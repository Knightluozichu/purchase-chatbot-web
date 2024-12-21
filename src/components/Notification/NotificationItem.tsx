import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { NotificationProps } from './types';

const variants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 text-green-800 border-green-200',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 text-red-800 border-red-200',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
};

export function NotificationItem({ type, message }: NotificationProps) {
  const { icon: Icon, className } = variants[type];

  return (
    <div className={`flex items-center p-4 rounded-lg border shadow-sm ${className}`}>
      <Icon className="w-5 h-5 mr-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}