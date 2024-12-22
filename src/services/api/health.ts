import { APIClient } from './client';
import { logger } from '../../utils/logger';

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const client = APIClient.getInstance();
    const response = await client.request<{ status: string }>({
      method: 'GET',
      endpoint: '/health',
      retries: 1 // Only retry once for health checks
    });
    
    return response.status === 'ok';
  } catch (error) {
    // Log as info instead of error since this is expected when server is not running
    logger.info('API server is not available');
    return false;
  }
}