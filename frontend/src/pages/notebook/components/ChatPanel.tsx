import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { VoiceButton } from './VoiceButton';
import { AudioPlayer } from './AudioPlayer';
import type { ChatMessage as ChatMessageType } from '../../../services/notebookApi';

interface ChatPanelProps {
  messages: ChatMessageType[];
  onSend: (message: string) => void;
  onSaveNote: (content: string) => void;
  onSpeak: (text: string) => void;
  sending: boolean;
  audioUrl: string | null;
  isSpeaking: boolean;
}

export function ChatPanel({
  messages,
  onSend,
  onSaveNote,
  onSpeak,
  sending,
  audioUrl,
  isSpeaking,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    onSend(input.trim());
    setInput('');
  };

  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg font-medium mb-1">Start a conversation</p>
            <p className="text-sm">Ask questions about your uploaded documents</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id || i}
            role={msg.role}
            content={msg.content}
            onSaveNote={msg.role === 'assistant' ? onSaveNote : undefined}
            onSpeak={msg.role === 'assistant' ? onSpeak : undefined}
            isSpeaking={isSpeaking}
          />
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
            </div>
            <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                Thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="px-6 pb-2">
          <AudioPlayer audioUrl={audioUrl} />
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Start typing..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-colors"
              disabled={sending}
            />
          </div>
          <VoiceButton onTranscript={handleVoiceTranscript} disabled={sending} />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
