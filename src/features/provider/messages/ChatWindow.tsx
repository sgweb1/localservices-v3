import React, { useEffect, useRef, useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useConversation, useHideConversation } from './hooks/useConversations';
import { useMessages, useSendMessage, useMarkAsRead } from './hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useConfirm } from '@/hooks/useConfirm';

interface ChatWindowProps {
  conversationId: number;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const queryClient = useQueryClient();
  const { data: conversation } = useConversation(conversationId);
  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const hideConversationMutation = useHideConversation();
  const { confirm, ConfirmDialog } = useConfirm();

  const otherUser = conversation?.other_user || conversation?.customer || conversation?.provider;
  const isHidden = conversation?.is_hidden_for_current_user ?? false;

  const handleHideConversation = async () => {
    const confirmed = await confirm({
      title: isHidden ? 'Pokaż konwersację' : 'Ukryj konwersację',
      message: isHidden 
        ? 'Czy na pewno chcesz przywrócić tę konwersację?'
        : 'Czy na pewno chcesz ukryć tę konwersację? Będziesz mógł ją przywrócić później.',
      confirmText: isHidden ? 'Pokaż' : 'Ukryj',
      cancelText: 'Anuluj',
      variant: isHidden ? 'success' : 'warning',
    });

    if (!confirmed) return;

    try {
      if (isHidden) {
        await hideConversationMutation.mutateAsync(conversationId);
        toast.success('Konwersacja przywrócona');
      } else {
        await hideConversationMutation.mutateAsync(conversationId);
        toast.success('Konwersacja ukryta');
      }
      
      // Refetch conversation to get updated hidden status
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Błąd przy zmianie statusu konwersacji');
    }
  };

  // Oznacz jako przeczytane gdy otwarty
  useEffect(() => {
    if (conversationId) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId]);

  // Poll conversation for online status updates and messages every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.refetchQueries({ queryKey: ['conversation', conversationId] });
      queryClient.refetchQueries({ queryKey: ['messages', conversationId] });
    }, 1000);

    return () => clearInterval(interval);
  }, [conversationId, queryClient]);

  // Flatten messages z wszystkich stron
  const messages = messagesData?.pages.flatMap(page => page.data) || [];

  const handleSendMessage = async (body: string, attachments?: File[]) => {
    if (!body.trim() && (!attachments || attachments.length === 0)) {
      toast.error('Napisz wiadomość lub dodaj załącznik');
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        body: body.trim(),
        attachments,
      });
      toast.success('Wiadomość wysłana');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.errors?.body?.[0] || 'Błąd przy wysyłaniu wiadomości';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 md:ml-0 ml-12">
          {/* Avatar */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {otherUser?.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{otherUser?.name || 'Ładowanie...'}</h3>
            {otherUser?.is_online ? (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
                Online
              </p>
            ) : (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 rounded-full" />
                Offline
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleHideConversation}
                  disabled={hideConversationMutation.isPending}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50 ${
                    isHidden
                      ? 'hover:bg-green-50 text-slate-600 hover:text-green-600'
                      : 'hover:bg-red-50 text-slate-600 hover:text-red-600'
                  }`}
                >
                  {isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  <span className="hidden sm:inline">{isHidden ? 'Pokaż' : 'Ukryj'}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">
                <p>{isHidden ? 'Pokaż konwersację' : 'Ukryj konwersację'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        conversationId={conversationId}
        messages={messages}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

      {/* Input */}
      <MessageInput onSend={handleSendMessage} isLoading={sendMessageMutation.isPending} />

      {/* Confirm Dialog */}
      {ConfirmDialog}
    </div>
  );
};
