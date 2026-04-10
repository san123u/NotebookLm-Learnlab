import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudioViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

function parseFAQ(content: string): FAQItem[] {
  const items: FAQItem[] = [];

  // Strategy 1: **Q: ...** / **A: ...** pattern
  const qaRegex = /(?:\*{1,2})?(?:\d+[\.\)]\s*)?Q(?:uestion)?[\s:]*(?:\*{1,2})?\s*([\s\S]*?)\s*(?:\*{1,2})?A(?:nswer)?[\s:]*(?:\*{1,2})?\s*([\s\S]*?)(?=(?:\*{1,2})?(?:\d+[\.\)]\s*)?Q(?:uestion)?[\s:]|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = qaRegex.exec(content)) !== null) {
    const q = match[1].trim().replace(/\*+$/g, '').trim();
    const a = match[2].trim().replace(/\*+$/g, '').trim();
    if (q && a) items.push({ question: q, answer: a });
  }
  if (items.length > 0) return items;

  // Strategy 2: Numbered questions with answers below
  // e.g. "1. What is X?\nAnswer text here\n\n2. What is Y?"
  const numberedRegex = /(\d+)[\.\)]\s*\*{0,2}(.*?\?)\*{0,2}\s*\n([\s\S]*?)(?=\d+[\.\)]\s|$)/g;
  while ((match = numberedRegex.exec(content)) !== null) {
    const q = match[2].trim();
    const a = match[3].trim();
    if (q && a) items.push({ question: q, answer: a });
  }
  if (items.length > 0) return items;

  // Strategy 3: ### heading as question, paragraph as answer
  const headingRegex = /#{1,4}\s*(.*?)\s*\n([\s\S]*?)(?=#{1,4}\s|$)/g;
  while ((match = headingRegex.exec(content)) !== null) {
    const q = match[1].trim();
    const a = match[2].trim();
    if (q && a) items.push({ question: q, answer: a });
  }

  return items;
}

function FAQAccordionItem({ item, isOpen, onToggle, index }: { item: FAQItem; isOpen: boolean; onToggle: () => void; index: number }) {
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden transition-colors hover:border-amber-500/30">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-5 py-4 text-left bg-gray-900/80 hover:bg-gray-900 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-semibold mt-0.5">
            {index + 1}
          </span>
          <span className="text-gray-100 font-medium leading-relaxed">{item.question}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? '1000px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-5 py-4 pl-15 border-t border-gray-800/50 bg-gray-950/50">
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed pl-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQView({ content, isLoading, onBack }: StudioViewProps) {
  const items = useMemo(() => parseFAQ(content), [content]);
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const expandAll = () => setOpenIndices(new Set(items.map((_, i) => i)));
  const collapseAll = () => setOpenIndices(new Set());

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-amber-300">FAQ</h2>
        </div>
        <div className="flex-1 p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-amber-300">FAQ</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 mb-4">Could not parse FAQ items. Showing raw content:</p>
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-amber-300">FAQ</h2>
          <span className="text-sm text-gray-500">({items.length} questions)</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-xs text-gray-400 hover:text-amber-300 transition-colors px-2 py-1">
            Expand All
          </button>
          <span className="text-gray-700">|</span>
          <button onClick={collapseAll} className="text-xs text-gray-400 hover:text-amber-300 transition-colors px-2 py-1">
            Collapse All
          </button>
        </div>
      </div>

      {/* FAQ List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {items.map((item, i) => (
          <FAQAccordionItem
            key={i}
            item={item}
            index={i}
            isOpen={openIndices.has(i)}
            onToggle={() => toggleItem(i)}
          />
        ))}
      </div>
    </div>
  );
}
