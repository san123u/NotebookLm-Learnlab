import {
  MessageCircle,
  BookOpen,
  FileText,
  CheckSquare,
  Layers,
  GraduationCap,
  Headphones,
  BarChart3,
  Bookmark,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { Note } from '../../../services/notebookApi';

interface StudioAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const studioActions: StudioAction[] = [
  { id: 'faq', label: 'FAQ', icon: MessageCircle, color: 'text-amber-300', bgColor: 'bg-amber-900/40 hover:bg-amber-900/60' },
  { id: 'study-guide', label: 'Study Guide', icon: BookOpen, color: 'text-blue-300', bgColor: 'bg-blue-900/40 hover:bg-blue-900/60' },
  { id: 'briefing', label: 'Briefing', icon: FileText, color: 'text-orange-300', bgColor: 'bg-orange-900/40 hover:bg-orange-900/60' },
  { id: 'quiz', label: 'Quiz', icon: CheckSquare, color: 'text-purple-300', bgColor: 'bg-purple-900/40 hover:bg-purple-900/60' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-teal-300', bgColor: 'bg-teal-900/40 hover:bg-teal-900/60' },
  { id: 'exam', label: 'Take Exam', icon: GraduationCap, color: 'text-pink-300', bgColor: 'bg-pink-900/40 hover:bg-pink-900/60' },
  { id: 'podcast', label: 'Podcast', icon: Headphones, color: 'text-cyan-300', bgColor: 'bg-cyan-900/40 hover:bg-cyan-900/60' },
  { id: 'infographic', label: 'Infographic', icon: BarChart3, color: 'text-indigo-300', bgColor: 'bg-indigo-900/40 hover:bg-indigo-900/60' },
];

interface StudioPanelProps {
  notes: Note[];
  onRunAction: (action: string) => void;
  onDeleteNote: (noteId: string) => void;
  runningAction: string | null;
  hasSelectedSources: boolean;
  activeView: string;
}

export function StudioPanel({
  notes,
  onRunAction,
  onDeleteNote,
  runningAction,
  hasSelectedSources,
  activeView,
}: StudioPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Studio</h2>
      </div>

      {/* Action Grid */}
      <div className="p-4 grid grid-cols-2 gap-2">
        {studioActions.map((action) => {
          const isRunning = runningAction === action.id;
          const isActive = activeView === action.id;
          return (
            <button
              key={action.id}
              onClick={() => onRunAction(action.id)}
              disabled={isRunning || !!runningAction || !hasSelectedSources}
              className={`flex flex-col items-start gap-2 p-3 rounded-xl transition-all ${action.bgColor} ${
                !hasSelectedSources ? 'opacity-40 cursor-not-allowed' : ''
              } ${isActive ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-gray-900' : ''} disabled:opacity-40`}
            >
              {isRunning ? (
                <Loader2 className={`w-5 h-5 ${action.color} animate-spin`} />
              ) : (
                <action.icon className={`w-5 h-5 ${action.color}`} />
              )}
              <span className={`text-sm font-medium ${action.color}`}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {!hasSelectedSources && (
        <p className="px-4 text-xs text-gray-500 text-center">
          Select sources to enable studio actions
        </p>
      )}

      {/* Saved Notes */}
      <div className="flex-1 overflow-y-auto border-t border-gray-800 mt-2">
        <div className="px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide">
            <Bookmark className="w-4 h-4" />
            Saved Notes
          </h3>
        </div>

        {notes.length === 0 ? (
          <p className="px-4 text-sm text-gray-500 text-center">
            No saved notes yet.
          </p>
        ) : (
          <div className="px-3 pb-3 space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group p-3 bg-gray-800/40 rounded-lg border border-gray-700/30"
              >
                <p className="text-xs text-gray-400 line-clamp-3">
                  {note.content.slice(0, 150)}...
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">{note.source}</span>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
