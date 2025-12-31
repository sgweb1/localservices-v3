import React, { useEffect, useRef, useState } from 'react';
import { Message, MessageAttachment } from './hooks/useMessages';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Download, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useDeleteMessage } from './hooks/useMessages';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

interface MessageListProps {
  messages: Message[];
  conversationId: number;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  conversationId,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<MessageAttachment | null>(null);
  const deleteMessageMutation = useDeleteMessage();
  const { user } = useAuth();
  const currentUserId = user?.id ?? 0;
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  // Infinite scroll - load more when scrolled to top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessageMutation.mutateAsync({ conversationId, messageId });
      toast.success('Wiadomość usunięta');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Błąd przy usuwaniu wiadomości');
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-slate-50"
    >
      {/* Load more indicator */}
      {isFetchingNextPage && (
        <div className="text-center py-2">
          <div className="inline-block w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const isDeleted = Boolean(message.deleted_at);
        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
        const showTimestamp = 
          index === 0 || 
          new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 min

        return (
          <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar (only for other user's messages) */}
            {!isOwnMessage && (
              <div className={`w-6 h-6 sm:w-8 sm:h-8 mr-1.5 sm:mr-2 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                {showAvatar && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
                    {message.sender?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
              {/* Timestamp */}
              {showTimestamp && (
                <div className="text-xs text-slate-500 mb-1.5 sm:mb-2 px-2 sm:px-3">
                  {format(new Date(message.created_at), 'HH:mm', { locale: pl })}
                </div>
              )}

              {/* Message bubble with delete button */}
              <div
                className={`rounded-2xl px-4 py-2 flex items-start gap-2 ${
                  isDeleted
                    ? 'bg-slate-100 text-slate-500 border border-slate-200 italic'
                    : isOwnMessage
                      ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                }`}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className="flex-1 min-w-0">
                  {/* Attachments */}
                  {!isDeleted && message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <AttachmentPreview
                          key={attachment.id}
                          attachment={attachment}
                          onPreview={setPreviewAttachment}
                        />
                      ))}
                    </div>
                  )}

                  {/* Text */}
                  <p className={`text-sm whitespace-pre-wrap break-words ${isDeleted ? 'text-slate-500' : ''}`}>
                    {isDeleted ? 'Wiadomość usunięta' : message.body}
                  </p>

                  {/* Edited indicator */}
                  {!isDeleted && message.is_edited && (
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-cyan-100' : 'text-slate-400'}`}>
                      (edytowane)
                    </p>
                  )}
                </div>

                {/* Delete button - wewnątrz bańki po prawej */}
                {isOwnMessage && !isDeleted && (
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    disabled={deleteMessageMutation.isPending}
                    className={`flex-shrink-0 p-1 hover:bg-red-100 rounded-lg text-red-500 transition-all disabled:opacity-50 ${
                      hoveredMessageId === message.id ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                    }`}
                    title="Usuń wiadomość"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
      {previewAttachment && (
        <ImagePreviewModal attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />
      )}
    </div>
  );
};

// Komponent preview załącznika
const AttachmentPreview: React.FC<{ attachment: MessageAttachment; onPreview?: (attachment: MessageAttachment) => void }> = ({ attachment, onPreview }) => {
  const isImage = attachment.file_type?.startsWith('image/');

  if (isImage) {
    return (
      <div className="relative rounded-lg overflow-hidden max-w-xs bg-white/10">
        <button
          type="button"
          onClick={() => onPreview?.(attachment)}
          className="block w-full text-left"
        >
          <img
            src={attachment.url}
            alt={attachment.file_name}
            className="w-full h-auto object-cover"
          />
        </button>
        <div className="absolute bottom-1 right-1 flex gap-1">
          <a
            href={attachment.url}
            download={attachment.file_name}
            rel="noopener noreferrer"
            className="p-1 rounded bg-white/80 text-slate-700 hover:bg-white"
            title="Pobierz"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
      <FileText className="w-8 h-8 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
        <p className="text-xs opacity-70">{(attachment.file_size / 1024).toFixed(1)} KB</p>
      </div>
      <a
        href={attachment.url}
        download={attachment.file_name}
        rel="noopener noreferrer"
        className="p-1 hover:bg-white/20 rounded"
        title="Pobierz"
      >
        <Download className="w-5 h-5" />
      </a>
    </div>
  );
};

const ImagePreviewModal: React.FC<{ attachment: MessageAttachment; onClose: () => void }> = ({ attachment, onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-full overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="text-sm font-medium text-slate-700 truncate pr-4">{attachment.file_name}</div>
          <div className="flex items-center gap-2">
            <a
              href={attachment.url}
              download={attachment.file_name}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              <Download className="w-4 h-4" />
              Pobierz
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Zamknij
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-auto">
          <img
            src={attachment.url}
            alt={attachment.file_name}
            className="max-h-[80vh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
