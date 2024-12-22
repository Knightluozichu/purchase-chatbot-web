import { APIConfig, APIRequestOptions } from './types';
import { defaultConfig } from './config';
import { logger } from '../../utils/logger';
import { APIError, NetworkError } from '../../utils/errors';

export class APIClient {
  private static instance: APIClient;
  private config: APIConfig;

  private constructor(config: APIConfig = defaultConfig) {
    this.config = config;
  }

  static getInstance(config?: APIConfig): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient(config);
    }
    return APIClient.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.warn('API request failed', { status: response.status, errorData });
      throw new APIError(
        errorData?.detail || 'Request failed',
        response.status,
        errorData
      );
    }
    return response.json();
  }

  async request<T>({ method, endpoint, data, retries, isFormData }: APIRequestOptions): Promise<T> {
    const url = new URL(endpoint, this.config.baseUrl).toString();
    
    const attemptRequest = async (remainingRetries: number): Promise<T> => {
      try {
        const headers: Record<string, string> = {};
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }

        const requestOptions: RequestInit = {
          method,
          headers,
          body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
        };

        logger.debug('Making API request', { 
          url, 
          method, 
          isFormData, 
          hasBody: !!data 
        });

        const response = await fetch(url, requestOptions);
        return await this.handleResponse<T>(response);
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
  
        if (remainingRetries > 0 && !(error instanceof TypeError)) {
          logger.warn(`Request failed, retrying... (${remainingRetries} attempts left)`);
          await this.delay(this.config.retryConfig.delayMs);
          return attemptRequest(remainingRetries - 1);
        }
  
        logger.warn('Network request failed', error);
        throw new NetworkError(
          'Unable to connect to API server. Please ensure the server is running.'
        );
      }
    };
  
    return attemptRequest(retries ?? this.config.retryConfig.maxRetries);
  }
}