import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, Check, RotateCcw } from 'lucide-react';

interface StudioViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
}

interface Flashcard {
  front: string;
  back: string;
}

function parseFlashcards(content: string): Flashcard[] {
  const cards: Flashcard[] = [];

  // Strategy 1: **Front:** ... **Back:** ... pattern
  const frontBackRegex = /\*{0,2}Front:?\*{0,2}\s*([\s\S]*?)\s*\*{0,2}Back:?\*{0,2}\s*([\s\S]*?)(?=\*{0,2}Front:?\*{0,2}|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = frontBackRegex.exec(content)) !== null) {
    const front = match[1].trim();
    const back = match[2].trim();
    if (front && back) cards.push({ front, back });
  }
  if (cards.length > 0) return cards;

  // Strategy 2: Q: / A: pattern
  const qaRegex = /(?:\*{0,2})?Q(?:uestion)?:?\*{0,2}\s*([\s\S]*?)\s*(?:\*{0,2})?A(?:nswer)?:?\*{0,2}\s*([\s\S]*?)(?=(?:\*{0,2})?Q(?:uestion)?:?\*{0,2}|$)/gi;
  while ((match = qaRegex.exec(content)) !== null) {
    const front = match[1].trim();
    const back = match[2].trim();
    if (front && back) cards.push({ front, back });
  }
  if (cards.length > 0) return cards;

  // Strategy 3: Numbered items separated by blank lines with - or : delimiter
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      const front = lines[0].replace(/^\d+[\.\)]\s*/, '').replace(/^\*+/, '').replace(/\*+$/, '').trim();
      const back = lines.slice(1).join('\n').replace(/^[-:]\s*/, '').trim();
      if (front && back) cards.push({ front, back });
    }
  }

  return cards;
}

export function FlashcardsView({ content, isLoading, onBack }: StudioViewProps) {
  const allCards = useMemo(() => parseFlashcards(content), [content]);
  const [deck, setDeck] = useState<Flashcard[]>(() => parseFlashcards(content));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<number>>(new Set());
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);

  // Sync deck when content changes (e.g., after loading completes)
  const prevContentRef = useRef(content);
  useEffect(() => {
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      const newCards = parseFlashcards(content);
      setDeck(newCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownIds(new Set());
    }
  }, [content]);

  const currentCard = deck[currentIndex];
  const total = allCards.length;
  const knownCount = knownIds.size;

  const goTo = useCallback((index: number, dir: 'left' | 'right') => {
    setSlideDir(dir);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setSlideDir(null);
    }, 200);
  }, []);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1, 'right');
  }, [currentIndex, goTo]);

  const goNext = useCallback(() => {
    if (currentIndex < deck.length - 1) goTo(currentIndex + 1, 'left');
  }, [currentIndex, deck.length, goTo]);

  const handleShuffle = useCallback(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck]);

  const handleMarkKnown = useCallback(() => {
    const originalIndex = allCards.indexOf(currentCard);
    if (originalIndex >= 0) {
      setKnownIds((prev) => {
        const next = new Set(prev);
        next.add(originalIndex);
        return next;
      });
    }
    const newDeck = deck.filter((_, i) => i !== currentIndex);
    if (newDeck.length === 0) {
      // All done
      setDeck(newDeck);
      return;
    }
    setDeck(newDeck);
    setCurrentIndex(Math.min(currentIndex, newDeck.length - 1));
    setIsFlipped(false);
  }, [allCards, currentCard, currentIndex, deck]);

  const handleReset = useCallback(() => {
    setDeck([...allCards]);
    setKnownIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [allCards]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-amber-300">Flashcards</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-[500px] h-[300px] rounded-2xl bg-gray-800/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-amber-300">Flashcards</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 mb-4">Could not parse flashcards. Showing raw content:</p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{content}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-amber-300">Flashcards</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-amber-300 mb-2">All Done!</h3>
            <p className="text-gray-400">You marked all {total} cards as known.</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = total > 0 ? (knownCount / total) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <h2 className="text-lg font-semibold text-amber-300">Flashcards</h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            {knownCount} known
          </span>
          <span>{deck.length} remaining</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{knownCount} / {total} mastered</p>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Flip card */}
        <div
          className="cursor-pointer select-none"
          style={{ perspective: '1000px', width: '500px', maxWidth: '100%', height: '300px' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full h-full transition-transform duration-600 ease-in-out ${slideDir === 'left' ? 'translate-x-[-20px] opacity-80' : slideDir === 'right' ? 'translate-x-[20px] opacity-80' : ''}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s ease',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-lg shadow-amber-500/5"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-xs uppercase tracking-widest text-amber-400/60 mb-4 font-medium">Front</p>
              <p className="text-xl font-semibold text-gray-100 text-center leading-relaxed">{currentCard.front}</p>
              <p className="text-xs text-gray-500 mt-6">Click to reveal answer</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-950/40 to-gray-900 p-8 shadow-lg shadow-amber-500/5 overflow-y-auto"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs uppercase tracking-widest text-amber-400/60 mb-4 font-medium">Back</p>
              <p className="text-lg text-gray-200 text-center leading-relaxed">{currentCard.back}</p>
            </div>
          </div>
        </div>

        {/* Card counter */}
        <p className="text-sm text-gray-400 mt-6 font-medium">
          {currentIndex + 1} / {deck.length}
        </p>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-sm">Shuffle</span>
          </button>

          <button
            onClick={handleMarkKnown}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700/40 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-700/60 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">Mark Known</span>
          </button>

          <button
            onClick={goNext}
            disabled={currentIndex >= deck.length - 1}
            className="p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
