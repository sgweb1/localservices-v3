import { useEffect } from 'react';
import { toast } from 'sonner';
import Echo from '@/lib/echo';
import { useAuth } from '@/contexts/AuthContext';

export const useToastNotifications = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const channelName = `user.${user.id}`;
    const channel = Echo.private(channelName).listen('.NotificationToast', (payload: any) => {
      const message = payload?.message || 'Powiadomienie';
      const title = payload?.title;
      const type = payload?.type || 'info';
      const actionUrl = payload?.action_url;

      const show = (variant: string) => {
        toast[variant as 'info' | 'success' | 'warning' | 'error'](title || 'Powiadomienie', {
          description: message,
          action: actionUrl
            ? {
                label: 'Otwórz',
                onClick: () => window.open(actionUrl, '_blank', 'noopener'),
              }
            : undefined,
        });
      };

      switch (type) {
        case 'success':
          show('success');
          break;
        case 'warning':
          show('warning');
          break;
        case 'error':
          show('error');
          break;
        default:
          show('info');
      }
    });

    return () => {
      channel.stopListening('.NotificationToast');
      Echo.leave(channelName);
    };
  }, [isAuthenticated, user]);
};
