import { useState, useEffect } from 'react';
import { Pencil, Trash2, MessageSquare } from 'lucide-react';
import { SourcesPanel } from './components/SourcesPanel';
import { ChatPanel } from './components/ChatPanel';
import { StudioPanel } from './components/StudioPanel';
import { FAQView } from './components/FAQView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { InfographicView } from './components/InfographicView';
import { StudyGuideView } from './components/StudyGuideView';
import { BriefingView } from './components/BriefingView';
import { ExamView } from './components/ExamView';
import { PodcastView } from './components/PodcastView';
import * as notebookApi from '../../services/notebookApi';
import type { Source, ChatMessage, Chat, Note } from '../../services/notebookApi';

type ActiveView = 'chat' | 'faq' | 'flashcards' | 'quiz' | 'infographic' | 'podcast' | 'study-guide' | 'briefing' | 'exam';

export default function NotebookPage() {
  // Sources state
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [sending, setSending] = useState(false);

  // Studio state
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const [studioContent, setStudioContent] = useState<string>('');
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioCache, setStudioCache] = useState<Record<string, string>>({});
  const [runningAction, setRunningAction] = useState<string | null>(null);

  // Voice state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Rename state
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load initial data
  useEffect(() => {
    loadSources();
    loadChats();
    loadNotes();
  }, []);

  const loadSources = async () => {
    try {
      const data = await notebookApi.getSources();
      setSources(data.sources);
    } catch (err) {
      console.error('Failed to load sources:', err);
    }
  };

  const loadChats = async () => {
    try {
      const data = await notebookApi.getChats();
      setChats(data.chats);
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await notebookApi.getNotes();
      setNotes(data.notes);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      const chat = await notebookApi.getChat(chatId);
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  // Source handlers
  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      for (const file of files) {
        await notebookApi.uploadSource(file);
      }
      await loadSources();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await notebookApi.deleteSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      setSelectedSourceIds((prev) => prev.filter((sid) => sid !== id));
    } catch (err) {
      console.error('Delete source failed:', err);
    }
  };

  const handleToggleSource = (id: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Chat handlers
  const handleSendMessage = async (message: string) => {
    // Optimistic UI - add user message immediately
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const result = await notebookApi.sendMessage(
        message,
        currentChatId || undefined,
        selectedSourceIds
      );

      // Update chat ID if new chat was created
      if (!currentChatId) {
        setCurrentChatId(result.chat_id);
      }

      // Add AI response
      setMessages((prev) => [...prev, result.message]);

      // Refresh chats list
      await loadChats();
    } catch (err) {
      console.error('Send message failed:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Error: Failed to get AI response. Please check your API settings.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await notebookApi.deleteChat(chatId);
      if (currentChatId === chatId) {
        handleNewChat();
      }
      await loadChats();
    } catch (err) {
      console.error('Delete chat failed:', err);
    }
  };

  const handleRenameChat = async (chatId: string) => {
    if (!editTitle.trim()) return;
    try {
      await notebookApi.renameChat(chatId, editTitle.trim());
      setEditingChatId(null);
      await loadChats();
    } catch (err) {
      console.error('Rename chat failed:', err);
    }
  };

  // Voice handlers
  const handleSpeak = async (text: string) => {
    setIsSpeaking(true);
    try {
      const audioBlob = await notebookApi.textToSpeech(text);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error('TTS failed:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Studio handlers
  const handleRunStudioAction = async (action: string) => {
    if (selectedSourceIds.length === 0) return;

    const apiAction = action;

    // Check cache first
    const cacheKey = `${action}-${selectedSourceIds.join(',')}`;
    if (studioCache[cacheKey]) {
      setStudioContent(studioCache[cacheKey]);
      setActiveView(action as ActiveView);
      return;
    }

    setActiveView(action as ActiveView);
    setStudioLoading(true);
    setRunningAction(action);
    setStudioContent('');

    try {
      const result = await notebookApi.runStudioAction(apiAction, selectedSourceIds);
      setStudioContent(result.content);
      setStudioCache(prev => ({ ...prev, [cacheKey]: result.content }));
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Failed to run studio action';
      setStudioContent(`Error: ${errorMsg}`);
    } finally {
      setStudioLoading(false);
      setRunningAction(null);
    }
  };

  const handleBackToChat = () => {
    setActiveView('chat');
  };

  // Notes handlers
  const handleSaveNote = async (content: string, source?: string) => {
    try {
      await notebookApi.saveNote(content, source || 'chat', currentChatId || undefined);
      await loadNotes();
    } catch (err) {
      console.error('Save note failed:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notebookApi.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error('Delete note failed:', err);
    }
  };

  return (
    <div className="-mx-6 -mb-6 flex overflow-hidden" style={{ height: 'calc(100vh - 7.75rem)' }}>
      {/* LEFT PANEL - Sources + Recent Chats */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-900/50">
        <div className="flex-1 overflow-hidden">
          <SourcesPanel
            sources={sources}
            selectedSourceIds={selectedSourceIds}
            onToggleSource={handleToggleSource}
            onUpload={handleUpload}
            onDelete={handleDeleteSource}
            uploading={uploading}
          />
        </div>

        {/* Recent Chats */}
        <div className="border-t border-gray-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Recent Chats
            </h3>
            <button
              onClick={handleNewChat}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              + New
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto px-3 pb-3 space-y-1">
            {chats.length === 0 && (
              <p className="text-center text-gray-600 text-xs py-2">No chats yet</p>
            )}
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
                onClick={() => loadChat(chat.id)}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                {editingChatId === chat.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameChat(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameChat(chat.id);
                      if (e.key === 'Escape') setEditingChatId(null);
                    }}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-white focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 text-sm truncate">{chat.title}</span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChatId(chat.id);
                      setEditTitle(chat.title);
                    }}
                    className="p-0.5 text-gray-500 hover:text-gray-300"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    className="p-0.5 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER PANEL - Dynamic Main Content */}
      <div className="flex-1 min-w-0">
        {activeView === 'chat' && (
          <ChatPanel
            messages={messages}
            onSend={handleSendMessage}
            onSaveNote={(content) => handleSaveNote(content)}
            onSpeak={handleSpeak}
            sending={sending}
            audioUrl={audioUrl}
            isSpeaking={isSpeaking}
          />
        )}
        {activeView === 'faq' && (
          <FAQView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} />
        )}
        {activeView === 'flashcards' && (
          <FlashcardsView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} />
        )}
        {activeView === 'quiz' && (
          <QuizView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} />
        )}
        {activeView === 'infographic' && (
          <InfographicView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} />
        )}
        {activeView === 'podcast' && (
          <PodcastView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} sourceIds={selectedSourceIds} />
        )}
        {activeView === 'study-guide' && (
          <StudyGuideView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} />
        )}
        {activeView === 'briefing' && (
          <BriefingView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} />
        )}
        {activeView === 'exam' && (
          <ExamView content={studioContent} isLoading={studioLoading} onBack={handleBackToChat} />
        )}
      </div>

      {/* RIGHT PANEL - Studio */}
      <div className="w-80 flex-shrink-0 border-l border-gray-800 bg-gray-900/50">
        <StudioPanel
          notes={notes}
          onRunAction={handleRunStudioAction}
          onDeleteNote={handleDeleteNote}
          runningAction={runningAction}
          hasSelectedSources={selectedSourceIds.length > 0}
          activeView={activeView}
        />
      </div>
    </div>
  );
}
