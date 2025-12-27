import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SectionTitle, Text } from '@/components/ui/typography';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, MessageSquare, Clock, Zap, Package, Info } from 'lucide-react';
import { useWebPush } from '@/hooks/useWebPush';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

interface EventPreference {
  event_id: number;
  event_key: string;
  event_name: string;
  is_active?: boolean;
  channels: {
    email: boolean;
    toast: boolean;
    push: boolean;
    database: boolean;
  };
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly' | 'off';
  batch_enabled?: boolean;
}

interface SettingsData {
  notifications?: any;
}

interface NotificationsTabProps {
  data?: SettingsData['notifications'];
}

const getCsrfToken = (): string => {
  const name = 'XSRF-TOKEN';
  let token = '';
  if (document.cookie) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        token = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return token;
};

const fetchPreferences = async (): Promise<EventPreference[]> => {
  console.log('Fetching preferences from:', `${API_BASE_URL}/api/v1/notification-preferences`);
  const res = await fetch(`${API_BASE_URL}/api/v1/notification-preferences`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log('Preferences data:', data);
  return data.data;
};

const updatePreference = async (eventId: number, updates: any): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/notification-preferences/${eventId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
};

const sendTestNotification = async (eventId: number, channel: string): Promise<{ toast?: { type: string; title: string; message: string } }> => {
  // Dla kanału push, upewnij się że jest aktywna subskrypcja
  if (channel === 'push') {
    await ensurePushSubscription();
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/notifications/${eventId}/test`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify({ channel }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data;
};

const ensurePushSubscription = async (): Promise<void> => {
  // Pobierz status subskrypcji
  const statusRes = await fetch(`${API_BASE_URL}/api/v1/push/status`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!statusRes.ok) return;

  const { data } = await statusRes.json();
  
  // Jeśli już jest subskrypcja, nic nie rób
  if (data.has_subscription) {
    return;
  }

  // W przeciwnym razie, zarejestruj service workera i zasubskrybuj
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;

      const appServerKey = new Uint8Array(
        atob(vapidKey.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => c.charCodeAt(0))
      );

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });
    }

    // Wyślij subskrypcję na serwer
    if (subscription) {
      const key = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (key && auth) {
        await fetch(`${API_BASE_URL}/api/v1/push/enable`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(key)))),
            auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth)))),
          }),
        });
      }
    }
  } catch (e) {
    console.warn('Failed to setup push subscription:', e);
  }
};

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const { status: pushStatus, isSupported, subscribe, error: pushError } = useWebPush();
  
  // Debug push support
  console.log('Push Debug:', { 
    isSupported, 
    pushStatus, 
    pushError,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotification: 'Notification' in window,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'unavailable'
  });
  
  const { data: preferences, isLoading } = useQuery<EventPreference[]>({
    queryKey: ['notification-preferences'],
    queryFn: fetchPreferences,
    staleTime: 60 * 1000,
  });

  const [localPreferences, setLocalPreferences] = useState<Record<number, any>>({});
  const [debounceTimers, setDebounceTimers] = useState<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (preferences) {
      const prefs = preferences.reduce((acc, pref) => {
        acc[pref.event_id] = {
          channels: pref.channels,
          quiet_hours_enabled: pref.quiet_hours_enabled ?? false,
          quiet_hours_start: pref.quiet_hours_start ?? '22:00',
          quiet_hours_end: pref.quiet_hours_end ?? '08:00',
          frequency: pref.frequency ?? 'instant',
          batch_enabled: pref.batch_enabled ?? false,
        };
        return acc;
      }, {} as Record<number, any>);
      setLocalPreferences(prefs);
    }
  }, [preferences]);

  const updateMutation = useMutation({
    mutationFn: ({ eventId, updates }: { eventId: number; updates: any }) =>
      updatePreference(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferencje zaktualizowane');
    },
    onError: () => {
      toast.error('Błąd aktualizacji preferencji');
    },
  });

  const testMutation = useMutation({
    mutationFn: ({ eventId, channel }: { eventId: number; channel: string }) =>
      sendTestNotification(eventId, channel),
    onSuccess: (data) => {
      toast.success('Powiadomienie testowe wysłane');
      
      // Jeśli backend zwrócił toast payload, wyświetl go
      if (data.toast) {
        const { type, title, message } = data.toast;
        if (type === 'success') toast.success(message, { description: title });
        else if (type === 'error') toast.error(message, { description: title });
        else if (type === 'info') toast.info(message, { description: title });
        else toast(message, { description: title });
      }
    },
    onError: () => {
      toast.error('Błąd wysyłania powiadomienia testowego');
    },
  });

  const handleChannelToggle = (eventId: number, channel: string) => {
    const current = localPreferences[eventId] || { channels: { email: true, toast: true, push: true, database: true } };
    const updated = {
      ...current,
      channels: { ...current.channels, [channel]: !current.channels[channel] },
    };
    setLocalPreferences({ ...localPreferences, [eventId]: updated });
    updateMutation.mutate({ eventId, updates: updated });
  };

  const handleEventToggle = (eventId: number) => {
    const current = localPreferences[eventId] || { channels: { email: true, toast: true, push: true, database: true } };
    const anyEnabled = Object.values(current.channels).some(v => v);
    const updated = {
      ...current,
      channels: {
        email: !anyEnabled,
        toast: !anyEnabled,
        push: !anyEnabled,
        database: !anyEnabled,
      },
    };
    setLocalPreferences({ ...localPreferences, [eventId]: updated });
    updateMutation.mutate({ eventId, updates: updated });
  };

  const handleQuietHoursChange = (eventId: number, updates: any) => {
    const updated = { ...localPreferences[eventId], ...updates };
    setLocalPreferences({ ...localPreferences, [eventId]: updated });
    
    // Debounce API call
    if (debounceTimers[eventId]) clearTimeout(debounceTimers[eventId]);
    const timer = setTimeout(() => {
      updateMutation.mutate({ eventId, updates: updated });
      setDebounceTimers(t => {
        const n = { ...t };
        delete n[eventId];
        return n;
      });
    }, 500);
    setDebounceTimers({ ...debounceTimers, [eventId]: timer });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'toast': return <MessageSquare className="w-4 h-4" />;
      case 'database': return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900 mb-1">Dostępne kanały</p>
          <p className="text-sm text-blue-800">
            Email • Push • Toast (powiadomienia w aplikacji) • Historia (archiwum w panelu)
          </p>
        </div>
      </div>

      {/* Push setup */}
      {isSupported && pushStatus !== 'subscribed' && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <SectionTitle>Włącz powiadomienia push</SectionTitle>
              <Text size="sm" muted>Natychmiastowe powiadomienia na tym urządzeniu</Text>
            </div>
          </div>
          <Button
            type="button"
            onClick={subscribe}
            disabled={pushStatus === 'pending'}
            variant="primary"
            size="md"
          >
            {pushStatus === 'pending' ? 'Włączanie…' : 'Włącz powiadomienia push'}
          </Button>
        </div>
      )}

      {isSupported && pushStatus === 'subscribed' && (
        <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">✓ Push włączony</p>
              <p className="text-sm text-gray-600">Subskrypcja aktywna na tym urządzeniu</p>
            </div>
          </div>
        </div>
      )}

      {/* Events */}
      <div className="space-y-6">
        {preferences?.map((pref) => {
          const current = localPreferences[pref.event_id] || { 
            channels: { email: true, toast: true, push: true, database: true },
            quiet_hours_enabled: false,
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00',
            frequency: 'instant',
            batch_enabled: false,
          };
          const anyEnabled = Object.values(current.channels).some(v => v);

          return (
            <div 
              key={pref.event_id} 
              className={`glass-card p-6 rounded-2xl transition-opacity ${
                !pref.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Header z titleem i toggle'm */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{pref.event_name}</h3>
                    {!pref.is_active && (
                      <Badge variant="neutral">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                        Nieaktywne
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Wybierz kanały, które będą używane dla tego powiadomienia</p>
                </div>
                
                {/* Toggle główny */}
                <button
                  onClick={() => handleEventToggle(pref.event_id)}
                  disabled={!pref.is_active}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all flex-shrink-0 ${
                    !pref.is_active
                      ? 'cursor-not-allowed opacity-50'
                      : anyEnabled
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 shadow-sm'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  title={!pref.is_active ? 'Event nieaktywny' : anyEnabled ? 'Wyłącz' : 'Włącz'}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      anyEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Channels Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {(['email', 'push', 'toast', 'database'] as const).map((channel) => {
                  const isDisabled = channel === 'push' && !isSupported;
                  const isEnabled = current.channels[channel];

                  return (
                    <div
                      key={channel}
                      onClick={() => pref.is_active && !isDisabled && handleChannelToggle(pref.event_id, channel)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && pref.is_active && !isDisabled) {
                          e.preventDefault();
                          handleChannelToggle(pref.event_id, channel);
                        }
                      }}
                      className={`p-2 rounded-lg border-2 transition-all text-center flex flex-col items-center gap-1 ${
                        !pref.is_active
                          ? 'opacity-40 cursor-not-allowed pointer-events-none'
                          : isDisabled
                          ? 'opacity-40 cursor-not-allowed pointer-events-none'
                          : isEnabled
                          ? 'border-cyan-500 bg-cyan-50 shadow-sm cursor-pointer'
                          : 'border-gray-200 bg-gray-50 hover:opacity-80 cursor-pointer'
                      }`}
                    >
                      <div className={`${isEnabled ? 'text-cyan-600' : 'text-gray-400'}`}>
                        {getChannelIcon(channel)}
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {channel === 'push' ? 'Push' : channel === 'email' ? 'Email' : channel === 'toast' ? 'Toast' : 'Historia'}
                      </div>
                      {isEnabled && (
                        <div className="text-cyan-600 text-xs font-bold">✓</div>
                      )}
                      
                      {/* Dev mode test button */}
                      {import.meta.env.DEV && isEnabled && pref.is_active && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            testMutation.mutate({ eventId: pref.event_id, channel });
                          }}
                          disabled={testMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="text-xs h-auto py-0.5"
                        >
                          {testMutation.isPending ? '...' : 'Test'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Advanced options - disabled for inactive events */}
              <div className={`pt-4 border-t border-gray-200 space-y-4 ${!pref.is_active ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={current.quiet_hours_enabled}
                      onChange={(e) => handleQuietHoursChange(pref.event_id, { quiet_hours_enabled: e.target.checked })}
                      disabled={!pref.is_active}
                      className="w-4 h-4 rounded border-gray-300 text-cyan-600"
                    />
                    <span className="text-sm font-semibold text-gray-700">Quiet hours (bez powiadomień o tej porze)</span>
                  </label>
                  {current.quiet_hours_enabled && (
                    <div className="flex gap-2 ml-6">
                      <Input
                        type="time"
                        value={current.quiet_hours_start}
                        onChange={(e) => handleQuietHoursChange(pref.event_id, { quiet_hours_start: e.target.value })}
                        disabled={!pref.is_active}
                        className="text-sm flex-1"
                      />
                      <span className="text-sm text-gray-600 self-center">–</span>
                      <Input
                        type="time"
                        value={current.quiet_hours_end}
                        onChange={(e) => handleQuietHoursChange(pref.event_id, { quiet_hours_end: e.target.value })}
                        disabled={!pref.is_active}
                        className="text-sm flex-1"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Częstotliwość</label>
                  <Select
                    value={current.frequency}
                    onChange={(e) => handleQuietHoursChange(pref.event_id, { frequency: e.target.value })}
                    disabled={!pref.is_active}
                  >
                    <option value="instant">Natychmiastowe</option>
                    <option value="hourly">Co godzinę</option>
                    <option value="daily">Codziennie (8:00)</option>
                    <option value="weekly">Co tydzień (poniedziałek 9:00)</option>
                    <option value="off">Wyłączone</option>
                  </Select>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={current.batch_enabled}
                    onChange={(e) => handleQuietHoursChange(pref.event_id, { batch_enabled: e.target.checked })}
                    disabled={!pref.is_active}
                    className="w-4 h-4 rounded border-gray-300 text-cyan-600 disabled:opacity-50"
                  />
                  <span className="text-sm font-semibold text-gray-700">Powiadomienia grupowe (zbieraj powiadomienia)</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
