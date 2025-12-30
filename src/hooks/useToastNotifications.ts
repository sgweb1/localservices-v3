import { useEffect } from 'react';
import { toast } from 'sonner';
import Echo from '@/lib/echo';
import { useAuth } from '@/contexts/AuthContext';

export const useToastNotifications = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Real-time notifications via Laravel Echo
    // Note: Requires Laravel Reverb or Pusher to be configured
    try {
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
        try {
          channel.stopListening('.NotificationToast');
          Echo.leave(channelName);
        } catch (e) {
          // Fallback - broadcasting not available
        }
      };
    } catch (error) {
      // Fallback: Broadcasting not available (Reverb/Pusher not configured)
      // Frontend will use polling instead
      console.debug('Real-time notifications not available - using polling');
      return;
    }
  }, [isAuthenticated, user]);
};
