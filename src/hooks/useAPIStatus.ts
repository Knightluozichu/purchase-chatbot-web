import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../components/Notification';
import { useLLM } from './useLLM';

export function useAPIStatus() {
  const [isOffline, setIsOffline] = useState(true);
  const { checkAPIAvailability } = useLLM();
  const { showNotification } = useNotification();

  const checkAPI = useCallback(async () => {
    const isAvailable = await checkAPIAvailability();
    setIsOffline(!isAvailable);
    if (!isAvailable) {
      showNotification({
        type: 'warning',
        message: 'API server is not running. Please start the server to enable all features.'
      });
    }
  }, [checkAPIAvailability, showNotification]);

  useEffect(() => {
    checkAPI();
    const interval = setInterval(checkAPI, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkAPI]);

  return { isOffline };
}