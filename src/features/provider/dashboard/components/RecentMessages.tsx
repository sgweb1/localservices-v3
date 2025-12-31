import React, { useEffect } from 'react';
import { MessageCircle, User, Clock, ChevronRight } from 'lucide-react';
import { useRecentMessages } from '../../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/typography';
import '@/lib/echo';

type RecentConversation = {
  id: string | number;
  customer_name: string;
  unread: number;
  time: string;
  last_message: string;
};

/**
 * Ostatnie wiadomości z rozmów
 */
export const RecentMessages: React.FC = () => {
  const { data, isLoading } = useRecentMessages(5);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Realtime invalidacja cache po nowej wiadomości
  useEffect(() => {
    if (!user?.id || !window.Echo) return;

    const userChannel = window.Echo.private(`user.${user.id}`);
    const providerChannel = window.Echo.private(`provider.${user.id}`);

    const handler = (payload: any) => {
      try {
        if (payload?.metadata?.event === 'message.sent') {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'messages'] });
        }
      } catch (_) {}
    };

    userChannel.listen('NotificationToast', handler);
    providerChannel.listen('NotificationToast', handler);

    return () => {
      try { userChannel.stopListening('NotificationToast'); } catch (_) {}
      try { providerChannel.stopListening('NotificationToast'); } catch (_) {}
    };
  }, [user?.id, queryClient]);

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-200/70 bg-white/80 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  // Dane ze zhaká
  const conversations = (data?.data as RecentConversation[]) || [];

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/70 bg-white/80 shadow-sm">
      <div className="p-6 border-b border-slate-200/70 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Ostatnie wiadomości</h3>
        <Link
          to="/provider/messages"
          className="text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-md transition-all"
        >
          Wszystkie <ChevronRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {!conversations || conversations.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <p>Brak wiadomości</p>
          </div>
        ) : (
          conversations.map((conv: any) => (
            <Link
              key={conv.id}
              to={`/provider/messages?conv=${conv.id}`}
              className="p-5 hover:bg-slate-50/70 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <User size={20} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-900">
                    {conv.customer_name}
                  </p>
                  <div className="flex items-center gap-2">
                    {conv.unread > 0 && (
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 shadow-sm"></span>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {conv.time}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {conv.last_message}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
