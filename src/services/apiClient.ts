import { logger } from '../utils/logger';
import { APIError, NetworkError } from '../utils/errors';

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

export class APIClient {
  private static instance: APIClient;
  private baseUrl: string;
  private retryConfig: RetryConfig;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.retryConfig = {
      maxRetries: 3,
      delayMs: 1000,
    };
  }

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error('API request failed', { status: response.status, errorData });
      throw new APIError(
        errorData?.detail || 'Request failed',
        response.status,
        errorData
      );
    }
    return response.json();
  }

  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    retries = this.retryConfig.maxRetries
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      if (retries > 0) {
        logger.warn(`Request failed, retrying... (${retries} attempts left)`);
        await this.delay(this.retryConfig.delayMs);
        return this.request(method, endpoint, data, retries - 1);
      }

      logger.error('Network request failed after retries', error);
      throw new NetworkError(
        error instanceof Error ? error.message : 'Failed to connect to API'
      );
    }
  }
}