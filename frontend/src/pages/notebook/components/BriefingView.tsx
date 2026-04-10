import { useState, useMemo } from 'react';
import { ArrowLeft, FileText, AlertCircle, CheckSquare, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudioViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
}

interface BriefingData {
  title: string;
  executiveSummary: string;
  keyFindings: string[];
  actionItems: string[];
  additionalSections: { heading: string; content: string }[];
}

function parseBriefing(content: string): BriefingData {
  const lines = content.split('\n');
  let title = '';
  let executiveSummary = '';
  const keyFindings: string[] = [];
  const actionItems: string[] = [];
  const additionalSections: { heading: string; content: string }[] = [];

  type ParseMode = 'none' | 'summary' | 'findings' | 'actions' | 'other';
  let mode: ParseMode = 'none';
  let currentOtherHeading = '';
  const otherLines: string[] = [];

  const flushOther = () => {
    if (currentOtherHeading && otherLines.length > 0) {
      additionalSections.push({ heading: currentOtherHeading, content: otherLines.join('\n').trim() });
      otherLines.length = 0;
    }
    currentOtherHeading = '';
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Title
    if (line.match(/^#\s+/) && !title) {
      title = line.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
      continue;
    }

    // Section headings
    const headingMatch = line.match(/^#{2,4}\s+(.*)/);
    if (headingMatch) {
      const heading = headingMatch[1].replace(/\*+/g, '').trim().toLowerCase();

      flushOther();

      if (heading.includes('executive') || heading.includes('summary') || heading.includes('overview')) {
        mode = 'summary';
      } else if (heading.includes('key finding') || heading.includes('highlights') || heading.includes('main point')) {
        mode = 'findings';
      } else if (heading.includes('action') || heading.includes('recommendation') || heading.includes('next step')) {
        mode = 'actions';
      } else {
        mode = 'other';
        currentOtherHeading = headingMatch[1].replace(/\*+/g, '').trim();
      }
      continue;
    }

    // Bold heading pattern: **Executive Summary**
    const boldHeading = line.match(/^\*\*(.*?)\*\*\s*:?\s*$/);
    if (boldHeading) {
      const heading = boldHeading[1].toLowerCase();
      flushOther();

      if (heading.includes('executive') || heading.includes('summary')) mode = 'summary';
      else if (heading.includes('finding') || heading.includes('highlight')) mode = 'findings';
      else if (heading.includes('action') || heading.includes('recommendation')) mode = 'actions';
      else {
        mode = 'other';
        currentOtherHeading = boldHeading[1];
      }
      continue;
    }

    if (!line) continue;

    // Bullet items
    const bulletMatch = line.match(/^[-*+]\s+(.*)/);
    const numMatch = line.match(/^\d+[\.\)]\s+(.*)/);
    const itemText = bulletMatch?.[1] ?? numMatch?.[1] ?? null;

    switch (mode) {
      case 'summary':
        if (itemText) executiveSummary += (executiveSummary ? ' ' : '') + itemText.replace(/\*+/g, '');
        else executiveSummary += (executiveSummary ? ' ' : '') + line.replace(/\*+/g, '');
        break;
      case 'findings':
        if (itemText) keyFindings.push(itemText.replace(/\*+/g, '').trim());
        else if (line) keyFindings.push(line.replace(/\*+/g, '').trim());
        break;
      case 'actions':
        if (itemText) actionItems.push(itemText.replace(/\*+/g, '').trim());
        else if (line) actionItems.push(line.replace(/\*+/g, '').trim());
        break;
      case 'other':
        otherLines.push(rawLine);
        break;
      default:
        // Before any section detected, treat as summary
        if (!executiveSummary && line && !title) {
          title = line.replace(/\*+/g, '').trim();
        } else if (!executiveSummary) {
          executiveSummary = line.replace(/\*+/g, '').trim();
        }
    }
  }

  flushOther();

  if (!title) title = 'Briefing Document';

  return { title, executiveSummary, keyFindings, actionItems, additionalSections };
}

export function BriefingView({ content, isLoading, onBack }: StudioViewProps) {
  const data = useMemo(() => parseBriefing(content), [content]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-orange-300">Briefing</h2>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-2/3 bg-gray-800/60 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-800/60 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-800/60 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const hasStructuredContent = data.executiveSummary || data.keyFindings.length > 0 || data.actionItems.length > 0;

  if (!hasStructuredContent && data.additionalSections.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-orange-300">Briefing</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 mb-4">Showing briefing content:</p>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </button>
        <FileText className="w-5 h-5 text-orange-300" />
        <h2 className="text-lg font-semibold text-orange-300">Briefing</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center pb-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white">{data.title}</h1>
          </div>

          {/* Executive Summary */}
          {data.executiveSummary && (
            <div className="bg-orange-950/20 border border-orange-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-300" />
                <h3 className="text-base font-semibold text-orange-300">Executive Summary</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">{data.executiveSummary}</p>
            </div>
          )}

          {/* Key Findings */}
          {data.keyFindings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-semibold text-amber-300">Key Findings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.keyFindings.map((finding, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-gray-900/80 border border-gray-800 rounded-xl"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed">{finding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {data.actionItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-emerald-300" />
                <h3 className="text-base font-semibold text-emerald-300">Action Items</h3>
              </div>
              <div className="space-y-2">
                {data.actionItems.map((item, i) => (
                  <ActionItem key={i} text={item} />
                ))}
              </div>
            </div>
          )}

          {/* Additional Sections */}
          {data.additionalSections.map((section, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-200 mb-3">{section.heading}</h3>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionItem({ text }: { text: string }) {
  const [checked, setChecked] = useState(false);

  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`flex items-start gap-3 w-full text-left p-3 rounded-xl border transition-all ${
        checked
          ? 'bg-emerald-950/20 border-emerald-600/30'
          : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-colors ${
        checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'
      }`}>
        {checked && <CheckSquare className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
        {text}
      </span>
    </button>
  );
}

