import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X, Image as ImageIcon } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  onSend: (body: string, attachments?: File[]) => Promise<void>;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && attachments.length === 0) return;

    try {
      await onSend(trimmedMessage, attachments);
      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      // Błędy są obsługiwane w ChatWindow z toast
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-t border-slate-200">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="relative group bg-slate-100 rounded-lg p-2 pr-8 flex items-center gap-2 max-w-full"
            >
              {file.type.startsWith('image/') ? (
                <>
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                  />
                </>
              ) : (
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
              )}
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex-shrink-0"
                aria-label="Usu\u0144 za\u0142\u0105cznik"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1 sm:gap-2">
        {/* File upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 flex-shrink-0 touch-manipulation"
          disabled={isLoading}
          aria-label="Dodaj za\u0142\u0105cznik"
        >
          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Emoji picker */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 touch-manipulation"
            disabled={isLoading}
            aria-label="Dodaj emoji"
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Napisz wiadomo\u015b\u0107..."
          disabled={isLoading}
          className="flex-1 px-3 sm:px-4 py-2 bg-slate-100 border-0 rounded-full resize-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-sm max-h-[150px] min-w-0"
          rows={1}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
          className="p-2 sm:p-2.5 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-full hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0 touch-manipulation"
          aria-label="Wy\u015blij wiadomo\u015b\u0107"
        >
          {isLoading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
