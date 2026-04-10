import { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Send } from 'lucide-react';

interface StudioViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
}

type ExamQuestionType = 'mcq' | 'truefalse' | 'short';

interface ExamQuestion {
  type: ExamQuestionType;
  question: string;
  options?: { label: string; text: string }[];
  correctAnswer: string;
  section: string;
}

function parseExam(content: string): { title: string; questions: ExamQuestion[] } {
  const questions: ExamQuestion[] = [];
  let title = '';
  let currentSection = 'General';

  // Extract title
  const titleMatch = content.match(/^#\s+(.*)/m);
  if (titleMatch) title = titleMatch[1].replace(/\*+/g, '').trim();

  // Split into blocks by question numbers or headings
  const blocks = content.split(/(?=(?:^|\n)(?:\*{0,2}\s*)?(?:\d+[\.\):]|#{2,4}\s))/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Section heading
    const sectionMatch = trimmed.match(/^#{2,4}\s+(.*)/);
    if (sectionMatch) {
      const heading = sectionMatch[1].replace(/\*+/g, '').trim();
      if (!title) title = heading;
      else currentSection = heading;
      // Continue processing the rest of the block after the heading
      const rest = trimmed.slice(trimmed.indexOf('\n') + 1).trim();
      if (!rest) continue;
    }

    // Extract question text
    const qMatch = trimmed.match(/(?:\*{0,2}\s*)?(\d+)[\.\):\s]+(?:\*{0,2})?\s*(.*?)(?:\n|$)/);
    if (!qMatch) continue;

    const questionText = qMatch[2].replace(/\*+/g, '').trim();
    if (!questionText) continue;

    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

    // Detect question type
    const hasOptions = lines.some((l) => l.match(/^[A-Da-d][\.\)]/));
    const isTrueFalse = questionText.toLowerCase().includes('true or false') ||
      questionText.toLowerCase().includes('(true/false)') ||
      lines.some((l) => l.match(/^[A-Ba-b][\.\)]\s*(?:True|False)/i));

    let correctAnswer = '';
    const options: { label: string; text: string }[] = [];

    // Extract answer
    for (const line of lines) {
      const ansMatch = line.match(/(?:\*{0,2})?(?:Correct\s*)?Answer[\s:]*(?:\*{0,2})?\s*(.*)/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1].replace(/\*+/g, '').trim();
        continue;
      }

      const optMatch = line.match(/^(?:\*{0,2})?([A-Da-d])[\.\):](?:\*{0,2})?\s*(.*)/);
      if (optMatch) {
        options.push({
          label: optMatch[1].toUpperCase(),
          text: optMatch[2].replace(/\*+/g, '').trim(),
        });
      }
    }

    if (isTrueFalse) {
      questions.push({
        type: 'truefalse',
        question: questionText.replace(/\s*\(?\s*true\s*[/or]+\s*false\s*\)?\s*/i, '').trim(),
        options: [
          { label: 'T', text: 'True' },
          { label: 'F', text: 'False' },
        ],
        correctAnswer: correctAnswer.toLowerCase().startsWith('t') ? 'T' : correctAnswer.toLowerCase().startsWith('f') ? 'F' : correctAnswer,
        section: currentSection,
      });
    } else if (hasOptions && options.length >= 2) {
      questions.push({
        type: 'mcq',
        question: questionText,
        options,
        correctAnswer: correctAnswer || 'A',
        section: currentSection,
      });
    } else {
      questions.push({
        type: 'short',
        question: questionText,
        correctAnswer: correctAnswer || '',
        section: currentSection,
      });
    }
  }

  if (!title) title = 'Exam';

  return { title, questions };
}

export function ExamView({ content, isLoading, onBack }: StudioViewProps) {
  const { title, questions } = useMemo(() => parseExam(content), [content]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (qIdx: number, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: value }));
  };

  const handleShortAnswer = (qIdx: number, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: value }));
  };

  const handleSubmit = () => setSubmitted(true);

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const score = useMemo(() => {
    if (!submitted) return { correct: 0, total: questions.length, pct: 0 };
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAnswer = (answers[i] ?? '').trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();

      if (q.type === 'short') {
        // Fuzzy match for short answers
        if (userAnswer && (correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer))) {
          correct++;
        }
      } else {
        if (userAnswer === correctAnswer) correct++;
      }
    }
    return { correct, total: questions.length, pct: Math.round((correct / questions.length) * 100) };
  }, [submitted, questions, answers]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-pink-300">Exam</h2>
        </div>
        <div className="flex-1 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 w-3/4 bg-gray-800/60 rounded animate-pulse" />
              <div className="h-10 bg-gray-800/60 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-pink-300">Exam</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 mb-4">Could not parse exam. Showing raw content:</p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{content}</pre>
          </div>
        </div>
      </div>
    );
  }

  // Group by section
  const sections: { name: string; questions: { q: ExamQuestion; idx: number }[] }[] = [];
  let lastSection = '';
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].section !== lastSection) {
      sections.push({ name: questions[i].section, questions: [] });
      lastSection = questions[i].section;
    }
    sections[sections.length - 1].questions.push({ q: questions[i], idx: i });
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[Number(k)]?.trim()).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-pink-300">{title}</h2>
        </div>
        {submitted ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-pink-300">{score.pct}% ({score.correct}/{score.total})</span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">{answeredCount}/{questions.length} answered</span>
        )}
      </div>

      {/* Score banner */}
      {submitted && (
        <div className={`px-6 py-3 text-center text-sm font-medium ${
          score.pct >= 80 ? 'bg-emerald-950/40 text-emerald-300' :
          score.pct >= 60 ? 'bg-amber-950/40 text-amber-300' :
          'bg-red-950/40 text-red-300'
        }`}>
          {score.pct >= 80 ? 'Excellent! Great job!' :
           score.pct >= 60 ? 'Good effort! Review the incorrect answers.' :
           'Keep studying! Review the material and try again.'}
        </div>
      )}

      {/* Questions */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((section, si) => (
            <div key={si}>
              {sections.length > 1 && (
                <h3 className="text-sm font-semibold text-pink-300/70 uppercase tracking-wider mb-4 pb-2 border-b border-gray-800/50">
                  {section.name}
                </h3>
              )}

              <div className="space-y-6">
                {section.questions.map(({ q, idx }) => {
                  const userAnswer = answers[idx] ?? '';
                  const isCorrect = submitted && (() => {
                    const ua = userAnswer.trim().toLowerCase();
                    const ca = q.correctAnswer.trim().toLowerCase();
                    if (q.type === 'short') return ua && (ca.includes(ua) || ua.includes(ca));
                    return ua === ca;
                  })();

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        submitted
                          ? isCorrect
                            ? 'bg-emerald-950/15 border-emerald-700/30'
                            : 'bg-red-950/15 border-red-700/30'
                          : 'bg-gray-900/80 border-gray-800'
                      }`}
                    >
                      {/* Question */}
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-100 font-medium leading-relaxed">{q.question}</p>
                          <span className="text-xs text-gray-500 mt-1 inline-block capitalize">{q.type === 'mcq' ? 'Multiple Choice' : q.type === 'truefalse' ? 'True / False' : 'Short Answer'}</span>
                        </div>
                        {submitted && (
                          isCorrect
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                      </div>

                      {/* Options (MCQ / True-False) */}
                      {(q.type === 'mcq' || q.type === 'truefalse') && q.options && (
                        <div className="space-y-2 ml-10">
                          {q.options.map((opt) => {
                            let style = 'bg-gray-800/60 border-gray-700/40 hover:border-pink-500/40';
                            if (userAnswer === opt.label && !submitted) {
                              style = 'bg-pink-900/20 border-pink-500/50 ring-1 ring-pink-500/20';
                            } else if (submitted) {
                              if (opt.label === q.correctAnswer.toUpperCase() || opt.label === q.correctAnswer) {
                                style = 'bg-emerald-900/20 border-emerald-500/40';
                              } else if (opt.label === userAnswer) {
                                style = 'bg-red-900/20 border-red-500/40';
                              }
                            }

                            return (
                              <button
                                key={opt.label}
                                onClick={() => handleSelectOption(idx, opt.label)}
                                disabled={submitted}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left text-sm transition-all ${style} disabled:cursor-default`}
                              >
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  userAnswer === opt.label ? 'bg-pink-500/30 text-pink-200' : 'bg-gray-700/50 text-gray-400'
                                }`}>
                                  {opt.label}
                                </span>
                                <span className="text-gray-200">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Short answer */}
                      {q.type === 'short' && (
                        <div className="ml-10">
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => handleShortAnswer(idx, e.target.value)}
                            disabled={submitted}
                            placeholder="Type your answer..."
                            className="w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700/40 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 disabled:opacity-60 transition-colors"
                          />
                          {submitted && q.correctAnswer && (
                            <p className="text-xs text-gray-400 mt-2">
                              Expected answer: <span className="text-emerald-300">{q.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      {!submitted && (
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="max-w-3xl mx-auto flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
