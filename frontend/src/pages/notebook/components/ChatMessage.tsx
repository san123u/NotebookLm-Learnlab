import { Bot, User, Bookmark, AlertTriangle, XCircle, Volume2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  onSaveNote?: (content: string) => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function ChatMessage({ role, content, onSaveNote, onSpeak, isSpeaking }: ChatMessageProps) {
  const isUser = role === 'user';
  const isError = content.includes('Error:') || content.includes('not configured');
  const isWarning = content.includes('not configured') || content.includes('API Key not configured');

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gray-600'
            : 'bg-gray-700'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-300" />
        ) : (
          <Bot className="w-4 h-4 text-gray-300" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gray-700 text-gray-100'
            : 'bg-gray-800/80 border border-gray-700/50 text-gray-200'
        }`}
      >
        {/* Warning/Error indicator */}
        {!isUser && isWarning && (
          <div className="flex items-center gap-2 mb-2 text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">AI API Key not configured. Please add it to your Admin Settings.</span>
          </div>
        )}

        {!isUser && isError && !isWarning && (
          <div className="flex items-center gap-2 mb-2 text-red-400 text-sm">
            <XCircle className="w-4 h-4" />
            <span className="font-medium">{content.split('\n')[0]}</span>
          </div>
        )}

        {/* Content */}
        {!isUser && !isWarning ? (
          <div className="prose prose-invert prose-sm max-w-none">
            {isError && !isWarning ? (
              <p className="text-gray-400 text-sm mt-1">
                {content.split('\n').slice(1).join('\n').trim() || 'This usually happens when the AI service is overloaded or the API quota is reached. Please try again in a few moments.'}
              </p>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            )}
          </div>
        ) : isUser ? (
          <p className="text-sm">{content}</p>
        ) : null}

        {/* Actions for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-700/50">
            {onSaveNote && (
              <button
                onClick={() => onSaveNote(content)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save Note
              </button>
            )}
            {onSpeak && (
              <button
                onClick={() => onSpeak(content)}
                disabled={isSpeaking}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {isSpeaking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                {isSpeaking ? 'Speaking...' : 'Listen'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
