import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  ArrowLeft,
  Download,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
  Headphones,
} from 'lucide-react';
import { textToSpeech } from '../../../services/notebookApi';

interface PodcastViewProps {
  content: string;
  isLoading: boolean;
  onBack: () => void;
  sourceIds: string[];
}

type PlayerState = 'idle' | 'generating' | 'ready' | 'playing' | 'paused' | 'error';

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;
const BAR_COUNT = 40;

export function PodcastView({ content, isLoading, onBack, sourceIds: _sourceIds }: PodcastViewProps) {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioBlobRef = useRef<Blob | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

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

  const generateAndPlay = useCallback(async () => {
    if (!content.trim()) {
      setErrorMessage('No content available for podcast generation.');
      setPlayerState('error');
      return;
    }

    setPlayerState('generating');
    setErrorMessage('');

    try {
      const blob = await textToSpeech(content);
      audioBlobRef.current = blob;

      // Cleanup previous blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      // Cleanup previous audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.volume = muted ? 0 : volume;
      audio.playbackRate = speed;

      audio.onloadedmetadata = () => {
        if (audio.duration && !Number.isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };
      audio.onended = () => {
        setPlayerState('paused');
        setProgress(100);
        cancelAnimationFrame(animFrameRef.current);
      };
      audio.onerror = () => {
        setPlayerState('error');
        setErrorMessage('Failed to play audio. The file may be corrupted.');
        cancelAnimationFrame(animFrameRef.current);
      };

      await audio.play();
      setPlayerState('playing');
      animFrameRef.current = requestAnimationFrame(updateProgress);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate podcast audio.';
      setErrorMessage(msg);
      setPlayerState('error');
    }
  }, [content, muted, volume, speed, updateProgress]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      // First play - generate audio
      generateAndPlay();
      return;
    }

    if (playerState === 'playing') {
      audio.pause();
      cancelAnimationFrame(animFrameRef.current);
      setPlayerState('paused');
    } else if (playerState === 'paused' || playerState === 'ready') {
      // If we finished, restart from beginning
      if (progress >= 100) {
        audio.currentTime = 0;
        setProgress(0);
      }
      audio.play().then(() => {
        setPlayerState('playing');
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }).catch(() => {
        setPlayerState('error');
        setErrorMessage('Playback failed. Please try again.');
      });
    } else if (playerState === 'idle' || playerState === 'error') {
      generateAndPlay();
    }
  }, [playerState, progress, generateAndPlay, updateProgress]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setProgress(pct * 100);
    setCurrentTime(pct * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) {
      audioRef.current.volume = next ? 0 : volume;
    }
  };

  const changeSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed as typeof SPEED_OPTIONS[number]);
    const nextSpeed = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleDownload = () => {
    if (!blobUrlRef.current || !audioBlobRef.current) return;
    const a = document.createElement('a');
    a.href = blobUrlRef.current;
    a.download = 'podcast.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (t: number) => {
    if (!t || Number.isNaN(t)) return '0:00';
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isActive = playerState === 'playing' || playerState === 'paused';

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Podcast</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">

        {/* Waveform Visualization */}
        <div className="flex items-end justify-center gap-[3px] h-24 w-full max-w-sm">
          {Array.from({ length: BAR_COUNT }).map((_, i) => {
            const isPlaying = playerState === 'playing';
            const barProgress = (i / BAR_COUNT) * 100;
            const isPast = barProgress <= progress && isActive;
            // Generate pseudo-random heights based on index
            const h = 20 + ((i * 7 + 13) % 80);
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-150 ${
                  isPast ? 'bg-cyan-400' : 'bg-gray-700'
                }`}
                style={{
                  width: '3px',
                  height: `${h}%`,
                  opacity: isPast ? 1 : 0.5,
                  transform: isPlaying
                    ? `scaleY(${0.6 + Math.sin(Date.now() / 200 + i * 0.5) * 0.4})`
                    : 'scaleY(1)',
                  animation: isPlaying ? `wave-${i % 5} 0.8s ease-in-out infinite alternate` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Central Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading || playerState === 'generating'}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            playerState === 'generating' || isLoading
              ? 'bg-cyan-900/40 text-cyan-500 cursor-wait'
              : playerState === 'error'
                ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60'
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:scale-105 active:scale-95'
          } border border-cyan-500/30`}
        >
          {playerState === 'generating' || isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : playerState === 'error' ? (
            <AlertCircle className="w-8 h-8" />
          ) : playerState === 'playing' ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>

        {/* Status Text */}
        <div className="text-center">
          {playerState === 'idle' && !isLoading && (
            <p className="text-sm text-gray-400">Click play to generate podcast audio</p>
          )}
          {isLoading && (
            <p className="text-sm text-cyan-400">Generating podcast content...</p>
          )}
          {playerState === 'generating' && (
            <p className="text-sm text-cyan-400">Converting to speech...</p>
          )}
          {playerState === 'error' && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="w-full max-w-md space-y-2">
            <div
              className="h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-cyan-400 rounded-full transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Controls Row */}
        {isActive && (
          <div className="flex items-center gap-4">
            {/* Speed */}
            <button
              onClick={changeSpeed}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
            >
              {speed}x
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 accent-cyan-400 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
              />
            </div>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Download podcast audio"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Waveform animation keyframes */}
      <style>{`
        @keyframes wave-0 { from { transform: scaleY(0.6); } to { transform: scaleY(1.0); } }
        @keyframes wave-1 { from { transform: scaleY(0.7); } to { transform: scaleY(0.9); } }
        @keyframes wave-2 { from { transform: scaleY(0.5); } to { transform: scaleY(1.0); } }
        @keyframes wave-3 { from { transform: scaleY(0.8); } to { transform: scaleY(0.6); } }
        @keyframes wave-4 { from { transform: scaleY(0.65); } to { transform: scaleY(0.95); } }
      `}</style>
    </div>
  );
}
