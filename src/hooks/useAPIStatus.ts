import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../components/Notification';
import { checkAPIHealth } from '../services/api';
import { logger } from '../utils/logger';

export function useAPIStatus() {
  const [isOffline, setIsOffline] = useState(true);
  const { showNotification } = useNotification();

  const checkStatus = useCallback(async () => {
    try {
      const isAvailable = await checkAPIHealth();
      setIsOffline(!isAvailable);
      
      if (!isAvailable) {
        logger.info('API server is offline');
        showNotification({
          type: 'warning',
          message: 'API server is not running. Please start the server to enable all features.'
        });
      }
    } catch (error) {
      setIsOffline(true);
      logger.warn('Failed to check API status', error);
    }
  }, [showNotification]);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Set up polling interval
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkStatus]);

  return { isOffline };
}