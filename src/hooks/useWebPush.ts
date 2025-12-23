import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscribePush } from '@/api/v1/pushApi';
import { urlBase64ToUint8Array } from '@/utils/push';

export type PushStatus = 'idle' | 'unsupported' | 'denied' | 'prompt' | 'subscribed' | 'error' | 'pending';

interface UseWebPushResult {
  status: PushStatus;
  isSupported: boolean;
  subscribe: () => Promise<void>;
  error?: string;
}

export const useWebPush = (): UseWebPushResult => {
  const [status, setStatus] = useState<PushStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);

  const isSupported = useMemo(() => {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }, []);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    const checkExistingSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        if (!registration) {
          setStatus('idle');
          return;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setStatus('subscribed');
        } else {
          setStatus('idle');
        }
      } catch (err) {
        console.warn('Failed to check existing subscription:', err);
        setStatus('idle');
      }
    };

    checkExistingSubscription();
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    setError(undefined);
    setStatus('pending');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        setError('Brak klucza VAPID w konfiguracji');
        setStatus('error');
        return;
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const appServerKey = new Uint8Array(urlBase64ToUint8Array(vapidKey));
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey,
        });
      }

      const json = subscription.toJSON();
      await subscribePush({
        endpoint: json.endpoint!,
        keys: {
          p256dh: json.keys?.p256dh || '',
          auth: json.keys?.auth || '',
        },
      });

      setStatus('subscribed');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się włączyć powiadomień push');
      setStatus('error');
    }
  }, [isSupported]);

  return { status, isSupported, subscribe, error };
};
