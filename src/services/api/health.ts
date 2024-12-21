import { APIClient } from './client';
import { logger } from '../../utils/logger';

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const client = APIClient.getInstance();
    const response = await client.request<{ status: string }>('GET', '/health');
    return response.status === 'ok';
  } catch (error) {
    logger.error('Health check failed', error);
    return false;
  }
}