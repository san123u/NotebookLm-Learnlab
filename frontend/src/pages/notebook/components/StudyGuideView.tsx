import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, BookOpen, List } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudioViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
}

interface StudySection {
  id: string;
  heading: string;
  level: number;
  content: string;
}

function parseStudyGuide(content: string): { title: string; sections: StudySection[] } {
  const lines = content.split('\n');
  let title = '';
  const sections: StudySection[] = [];
  let currentSection: StudySection | null = null;
  const contentLines: string[] = [];

  for (const rawLine of lines) {
    const headingMatch = rawLine.match(/^(#{1,4})\s+(.*)/);

    if (headingMatch) {
      // Flush current section
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        if (currentSection.content || currentSection.heading) sections.push(currentSection);
        contentLines.length = 0;
      }

      const level = headingMatch[1].length;
      const heading = headingMatch[2].replace(/\*+/g, '').trim();

      if (level === 1 && !title) {
        title = heading;
        continue;
      }

      const id = `section-${sections.length}`;
      currentSection = { id, heading, level, content: '' };
    } else {
      if (!currentSection && rawLine.trim() && !title) {
        // Bold text as title fallback
        const boldMatch = rawLine.match(/^\*\*(.*?)\*\*/);
        if (boldMatch) {
          title = boldMatch[1];
          continue;
        }
      }
      contentLines.push(rawLine);
    }
  }

  // Flush last section
  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    if (currentSection.content || currentSection.heading) sections.push(currentSection);
  }

  // If no sections found, create one from the whole content
  if (sections.length === 0 && content.trim()) {
    sections.push({
      id: 'section-0',
      heading: 'Overview',
      level: 2,
      content: content.trim(),
    });
  }

  if (!title) title = 'Study Guide';

  return { title, sections };
}

export function StudyGuideView({ content, isLoading, onBack }: StudioViewProps) {
  const { title, sections } = useMemo(() => parseStudyGuide(content), [content]);
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '');
  const [showToc, setShowToc] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Track active section on scroll
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.scrollTop;
      let closest = sections[0]?.id ?? '';
      let closestDist = Infinity;

      for (const section of sections) {
        const el = sectionRefs.current[section.id];
        if (!el) continue;
        const dist = Math.abs(el.offsetTop - containerTop - 80);
        if (dist < closestDist) {
          closestDist = dist;
          closest = section.id;
        }
      }
      setActiveSection(closest);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [sections]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-blue-300">Study Guide</h2>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-1/2 bg-gray-800/60 rounded-lg animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-800/60 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
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
          <BookOpen className="w-5 h-5 text-blue-300" />
          <h2 className="text-lg font-semibold text-blue-300">{title}</h2>
        </div>
        <button
          onClick={() => setShowToc(!showToc)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-blue-300 bg-gray-800 rounded-lg transition-colors"
        >
          <List className="w-3.5 h-3.5" />
          {showToc ? 'Hide' : 'Show'} TOC
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table of Contents */}
        {showToc && (
          <div className="w-64 flex-shrink-0 border-r border-gray-800 overflow-y-auto py-4 px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Contents</p>
            <nav className="space-y-0.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-500/15 text-blue-300 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                  style={{ paddingLeft: `${(section.level - 1) * 12 + 12}px` }}
                >
                  {section.heading}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((section) => (
              <div
                key={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="scroll-mt-6"
              >
                <h2 className={`font-bold text-gray-100 mb-4 pb-2 border-b border-gray-800/50 ${
                  section.level <= 2 ? 'text-xl' : 'text-lg'
                }`}>
                  {section.heading}
                </h2>
                <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed prose-headings:text-gray-100 prose-strong:text-blue-200 prose-code:text-blue-300 prose-code:bg-blue-950/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
