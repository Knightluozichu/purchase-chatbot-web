import React, { createContext, useContext, useCallback, useState } from 'react';
import { NotificationProps } from './types';
import { NotificationContainer } from './NotificationContainer';
import { generateUniqueId } from '../../utils/ids';

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationProps, 'id'>) => {
    const id = generateUniqueId();
    setNotifications(prev => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}