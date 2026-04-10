import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudioViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
}

interface InfographicSection {
  heading: string;
  bullets: string[];
  stats: { value: string; label: string }[];
}

interface InfographicData {
  title: string;
  sections: InfographicSection[];
}

function parseInfographic(content: string): InfographicData {
  // Try JSON first
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.title && parsed.sections) return parsed as InfographicData;
    }
    const parsed = JSON.parse(content);
    if (parsed.title && parsed.sections) return parsed as InfographicData;
  } catch {
    // Fall through to markdown parsing
  }

  // Parse markdown
  const lines = content.split('\n');
  let title = '';
  const sections: InfographicSection[] = [];
  let currentSection: InfographicSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Title: # heading
    if (line.match(/^#\s+/) && !title) {
      title = line.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
      continue;
    }

    // Section heading: ## or ### heading
    if (line.match(/^#{2,4}\s+/)) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: line.replace(/^#+\s*/, '').replace(/\*+/g, '').trim(),
        bullets: [],
        stats: [],
      };
      continue;
    }

    if (!currentSection && line && !line.startsWith('#')) {
      if (!title) {
        title = line.replace(/\*+/g, '').trim();
      } else {
        currentSection = { heading: '', bullets: [], stats: [] };
      }
      continue;
    }

    if (!currentSection) continue;

    // Stats: numbers like "85%" or "$1.2M" or "1,234"
    const statMatch = line.match(/^[-*]\s*\*{0,2}([\d,.]+[%KMBkmbTt]?(?:\s*[\w/]+)?)\*{0,2}\s*[-:]\s*(.*)/);
    if (statMatch) {
      currentSection.stats.push({
        value: statMatch[1].trim(),
        label: statMatch[2].replace(/\*+/g, '').trim(),
      });
      continue;
    }

    // Bullet points
    const bulletMatch = line.match(/^[-*+]\s+(.*)/);
    if (bulletMatch) {
      currentSection.bullets.push(bulletMatch[1].replace(/\*+/g, '').trim());
      continue;
    }

    // Numbered items
    const numMatch = line.match(/^\d+[\.\)]\s+(.*)/);
    if (numMatch) {
      currentSection.bullets.push(numMatch[1].replace(/\*+/g, '').trim());
      continue;
    }

    // Plain text paragraph
    if (line && !line.startsWith('#')) {
      currentSection.bullets.push(line.replace(/\*+/g, '').trim());
    }
  }

  if (currentSection) sections.push(currentSection);
  if (!title) title = 'Infographic';

  return { title, sections };
}

const sectionColors = [
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-300', statBg: 'bg-indigo-500/20' },
  { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-300', statBg: 'bg-violet-500/20' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-300', statBg: 'bg-cyan-500/20' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', statBg: 'bg-emerald-500/20' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', statBg: 'bg-amber-500/20' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-300', statBg: 'bg-rose-500/20' },
];

export function InfographicView({ content, isLoading, onBack }: StudioViewProps) {
  const data = useMemo(() => parseInfographic(content), [content]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-indigo-300">Infographic</h2>
        </div>
        <div className="flex-1 p-6">
          <div className="h-10 w-1/2 bg-gray-800/60 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-800/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.sections.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-indigo-300">Infographic</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 mb-4">Could not parse infographic. Showing raw content:</p>
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
        <h2 className="text-lg font-semibold text-indigo-300">Infographic</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{data.title}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mx-auto" />
        </div>

        {/* Stats row - collect all stats from all sections */}
        {(() => {
          const allStats = data.sections.flatMap((s) => s.stats);
          if (allStats.length === 0) return null;
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {allStats.slice(0, 8).map((stat, i) => {
                const color = sectionColors[i % sectionColors.length];
                return (
                  <div key={i} className={`p-5 rounded-2xl border ${color.border} ${color.bg} text-center`}>
                    <div className={`text-3xl font-bold ${color.text} mb-1`}>
                      <TrendingUp className="w-5 h-5 inline-block mr-1 opacity-60" />
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Section cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.sections.map((section, i) => {
            const color = sectionColors[i % sectionColors.length];
            if (!section.heading && section.bullets.length === 0) return null;
            return (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${color.border} ${color.bg} transition-all hover:scale-[1.01]`}
              >
                {section.heading && (
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className={`w-5 h-5 ${color.text}`} />
                    <h3 className={`text-lg font-semibold ${color.text}`}>{section.heading}</h3>
                  </div>
                )}
                {section.bullets.length > 0 && (
                  <ul className="space-y-2">
                    {section.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${color.statBg} mt-1.5 flex-shrink-0`} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
