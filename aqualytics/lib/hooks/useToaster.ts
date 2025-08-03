import { toast } from 'react-hot-toast';

interface ToastProps {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export function useToaster() {
  const showToast = ({
    title,
    message,
    type = 'info',
    duration = 4000,
  }: ToastProps) => {
    const toastContent = `<strong>${title}</strong><br />${message}`;

    switch (type) {
      case 'success':
        toast.success(toastContent, { duration });
        break;
      case 'error':
        toast.error(toastContent, { duration });
        break;
      default:
        toast(toastContent, { duration });
        break;
    }
  };

  return { showToast };
} 