import React from 'react';
import { NotificationProps } from './types';
import { NotificationItem } from './NotificationItem';

interface NotificationContainerProps {
  notifications: NotificationProps[];
}

export function NotificationContainer({ notifications }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} {...notification} />
      ))}
    </div>
  );
}