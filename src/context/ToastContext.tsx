// contexts/ToastContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastType } from '../components/ui/toast/Toast';

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  closeToast: (id: string) => void;
  closeAllToasts: () => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = (++toastId).toString();
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const closeAllToasts = () => {
    setToasts([]);
  };

  const success = (message: string, duration?: number) => {
    return showToast(message, 'success', duration);
  };

  const error = (message: string, duration?: number) => {
    return showToast(message, 'error', duration);
  };

  const warning = (message: string, duration?: number) => {
    return showToast(message, 'warning', duration);
  };

  const info = (message: string, duration?: number) => {
    return showToast(message, 'info', duration);
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        closeToast,
        closeAllToasts,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
