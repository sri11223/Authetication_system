import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

const VARIANT_CONFIG: Record<AlertVariant, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: <Info className="w-5 h-5 text-blue-600" />,
  },
};

export const Alert: React.FC<AlertProps> = ({ variant, message, className = '', onDismiss }) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        ${config.bg} ${config.text} ${config.border}
        animate-fade-in
        ${className}
      `.trim()}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
