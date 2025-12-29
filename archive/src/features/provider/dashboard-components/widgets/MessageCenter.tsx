import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { BadgeGradient } from '@/components/ui/BadgeGradient';
import { MessageCenter as MessageCenterType } from '../../types';
import { Inbox, ChevronRight } from 'lucide-react';

interface MessageCenterProps {
  data: MessageCenterType;
}

/**
 * Widget: Message Center
 * 
 * Lista ostatnich 4 zapytań ofertowych (contact_requests)
 * z deadline (quote_due) i CTA "Wyceń usługę".
 */
export const MessageCenter: React.FC<MessageCenterProps> = ({ data }) => {
  const getTimeUrgency = (quoteDue: string | null) => {
    if (!quoteDue) return null;
    
    // Parse quote_due (format: "24 godz.")
    const hoursMatch = quoteDue.match(/(\d+)\s*godz/);
    if (!hoursMatch) return null;
    
    const hours = parseInt(hoursMatch[1]);
    if (hours <= 6) return 'urgent';
    if (hours <= 12) return 'soon';
    return 'normal';
  };

  return (
    <GlassCard className="rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Wiadomości</h3>
          {data.unread_count > 0 && (
            <BadgeGradient>{data.unread_count} nowych</BadgeGradient>
          )}
        </div>

        {data.items.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Brak nowych wiadomości</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((request) => {
              const urgency = getTimeUrgency(request.quote_due);
              
              return (
                <a
                  key={request.id}
                  href={`/provider/requests/${request.id}`}
                  className="block p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {request.customer_name[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {request.customer_name}
                        </p>
                        {urgency === 'urgent' && (
                          <span className="text-xs bg-error text-white px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                            Pilne
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2">{request.service_name}</p>
                      
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {request.message_preview}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{request.created_at}</p>
                        {request.quote_due && (
                          <p className={`text-xs font-semibold ${
                            urgency === 'urgent' ? 'text-error' :
                            urgency === 'soon' ? 'text-warning' :
                            'text-gray-600'
                          }`}>
                            Deadline: {request.quote_due}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-primary-600 transition-colors" />
                  </div>
                </a>
              );
            })}
          </div>
        )}

        <a
          href="/provider/requests"
          className="block text-center px-4 py-2 rounded-xl border-2 border-primary-200 text-primary-600 hover:border-primary-400 hover:bg-primary-50 font-semibold text-sm transition-all"
        >
          Zobacz wszystkie zapytania
        </a>
      </div>
    </GlassCard>
  );
};
