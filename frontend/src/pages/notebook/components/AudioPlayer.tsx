import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string | null;
  onClose?: () => void;
}

export function AudioPlayer({ audioUrl, onClose }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration && !Number.isNaN(audio.duration)) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    }
    if (audioRef.current && !audioRef.current.paused) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlaying(false);
        setProgress(100);
      };
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => {
        setPlaying(true);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };
      audio.onloadedmetadata = () => {
        if (audio.duration && !Number.isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      // Auto-play
      audio.play().catch(() => {});

      return () => {
        cancelAnimationFrame(animFrameRef.current);
        audio.pause();
        audio.src = '';
        // Revoke blob URLs to prevent memory leaks
        if (audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
      };
    }
  }, [audioUrl, updateProgress]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
    setProgress(pct * 100);
    setCurrentTime(pct * duration);
  };

  const formatTime = (t: number) => {
    if (!t || Number.isNaN(t)) return '0:00';
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-xl border border-gray-700">
      <button
        onClick={togglePlay}
        className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <span className="text-xs text-gray-500 min-w-[32px] text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      <div
        className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-sky-500 rounded-full transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-xs text-gray-500 min-w-[32px] tabular-nums">
        {formatTime(duration)}
      </span>

      <button
        onClick={() => setMuted(!muted)}
        className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {onClose && (
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
