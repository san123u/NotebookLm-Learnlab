import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface StudioViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

function parseQuiz(content: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Split by question markers: "1.", "2.", "**1.", "### 1.", "Question 1", etc.
  const qBlocks = content.split(/(?=(?:^|\n)(?:\*{0,2}\s*)?(?:\d+[\.\):]|#{1,4}\s*\d+|Question\s+\d+))/i).filter((b) => b.trim());

  for (const block of qBlocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Extract question text
    let questionText = lines[0]
      .replace(/^(?:\*{0,2}\s*)?(?:\d+[\.\):]|#{1,4}\s*\d+[\.\):]?|Question\s+\d+[\.\):]?)\s*/i, '')
      .replace(/\*+/g, '')
      .trim();

    if (!questionText) continue;

    const options: { label: string; text: string }[] = [];
    let correctAnswer = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Match options: A) text, A. text, **A.** text, a) text
      const optMatch = line.match(/^(?:\*{0,2})?([A-Da-d])[\.\)\:](?:\*{0,2})?\s*(.*)/);
      if (optMatch) {
        options.push({
          label: optMatch[1].toUpperCase(),
          text: optMatch[2].replace(/\*+/g, '').trim(),
        });
        continue;
      }

      // Match correct answer: "Answer: A", "Correct: B", "**Answer:** C"
      const ansMatch = line.match(/(?:\*{0,2})?(?:Correct\s*)?Answer[\s:]*(?:\*{0,2})?\s*([A-Da-d])/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1].toUpperCase();
        continue;
      }

      // If the line continues question text (before options)
      if (options.length === 0 && !line.match(/^[A-Da-d][\.\)]/)) {
        questionText += ' ' + line.replace(/\*+/g, '').trim();
      }
    }

    if (options.length >= 2) {
      questions.push({
        question: questionText,
        options,
        correctAnswer: correctAnswer || 'A',
      });
    }
  }

  return questions;
}

export function QuizView({ content, isLoading, onBack }: StudioViewProps) {
  const questions = useMemo(() => parseQuiz(content), [content]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const current = questions[currentIndex];
  const isChecked = checkedQuestions.has(currentIndex);
  const selectedAnswer = selectedAnswers[currentIndex] ?? null;

  const correctCount = questions.reduce((acc, q, i) => {
    if (selectedAnswers[i] === q.correctAnswer) return acc + 1;
    return acc;
  }, 0);

  const handleSelect = (label: string) => {
    if (isChecked) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: label }));
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    setCheckedQuestions((prev) => new Set(prev).add(currentIndex));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCheckedQuestions(new Set());
    setShowResults(false);
  };

  const handleFinish = () => setShowResults(true);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-purple-300">Quiz</h2>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-3/4 bg-gray-800/60 rounded-lg animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-800/60 rounded-xl animate-pulse" />
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
          <h2 className="text-lg font-semibold text-purple-300">Quiz</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 mb-4">Could not parse quiz. Showing raw content:</p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{content}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-purple-300">Quiz Results</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg mx-auto">
            {/* Score card */}
            <div className="text-center bg-gray-900/80 border border-gray-800 rounded-2xl p-8 mb-6">
              <div className="text-5xl font-bold text-purple-300 mb-2">{pct}%</div>
              <p className="text-gray-400 text-lg mb-1">{correctCount} / {questions.length} correct</p>
              <p className="text-sm text-gray-500">
                {pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort!' : 'Keep studying!'}
              </p>
            </div>

            {/* Question breakdown */}
            <div className="space-y-3">
              {questions.map((q, i) => {
                const isCorrect = selectedAnswers[i] === q.correctAnswer;
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${isCorrect ? 'bg-emerald-950/30 border-emerald-700/30' : 'bg-red-950/30 border-red-700/30'}`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 font-medium">{q.question}</p>
                      {!isCorrect && (
                        <p className="text-xs text-gray-400 mt-1">
                          Your answer: {selectedAnswers[i] ?? 'None'} &middot; Correct: {q.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
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
          <h2 className="text-lg font-semibold text-purple-300">Quiz</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Score: {correctCount}/{checkedQuestions.size}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 pt-4">
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-purple-400'
                  : checkedQuestions.has(i)
                    ? selectedAnswers[i] === questions[i].correctAnswer
                      ? 'bg-emerald-500'
                      : 'bg-red-500'
                    : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Question {currentIndex + 1} of {questions.length}</p>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-100 mb-6 leading-relaxed">
            {current.question}
          </h3>

          <div className="space-y-3">
            {current.options.map((opt) => {
              let optStyle = 'bg-gray-900/80 border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800';
              if (selectedAnswer === opt.label && !isChecked) {
                optStyle = 'bg-purple-900/30 border-purple-500/60 ring-1 ring-purple-500/30';
              } else if (isChecked) {
                if (opt.label === current.correctAnswer) {
                  optStyle = 'bg-emerald-900/30 border-emerald-500/60';
                } else if (opt.label === selectedAnswer) {
                  optStyle = 'bg-red-900/30 border-red-500/60';
                }
              }

              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  disabled={isChecked}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all ${optStyle} disabled:cursor-default`}
                >
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isChecked && opt.label === current.correctAnswer
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : isChecked && opt.label === selectedAnswer
                        ? 'bg-red-500/30 text-red-300'
                        : selectedAnswer === opt.label
                          ? 'bg-purple-500/30 text-purple-300'
                          : 'bg-gray-800 text-gray-400'
                  }`}>
                    {opt.label}
                  </span>
                  <span className="text-gray-200">{opt.text}</span>
                  {isChecked && opt.label === current.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto flex-shrink-0" />
                  )}
                  {isChecked && opt.label === selectedAnswer && opt.label !== current.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {!isChecked ? (
            <button
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Check Answer
            </button>
          ) : currentIndex === questions.length - 1 ? (
            <button
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors text-sm"
            >
              See Results
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentIndex >= questions.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
