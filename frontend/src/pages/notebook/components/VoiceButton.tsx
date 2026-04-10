import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { speechToText } from '../../../services/notebookApi';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

/** Minimum recording duration in ms to avoid sending empty/noise clips. */
const MIN_RECORDING_MS = 500;

/**
 * Pick a MIME type the current browser actually supports.
 * Safari does not support audio/webm, so we fall back to audio/mp4.
 */
function getSupportedMimeType(): { mimeType: string; ext: string } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: '', ext: '' };
  }
  const candidates: { mimeType: string; ext: string }[] = [
    { mimeType: 'audio/webm;codecs=opus', ext: 'webm' },
    { mimeType: 'audio/webm', ext: 'webm' },
    { mimeType: 'audio/mp4', ext: 'mp4' },
    { mimeType: 'audio/ogg;codecs=opus', ext: 'ogg' },
    { mimeType: 'audio/wav', ext: 'wav' },
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
  }
  // Let the browser pick its default
  return { mimeType: '', ext: 'webm' };
}

export function VoiceButton({ onTranscript, onError, disabled }: VoiceButtonProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  // Clean up on unmount: stop any active stream / recorder
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch { /* already stopped */ }
      }
    };
  }, []);

  const reportError = useCallback(
    (msg: string) => {
      setError(msg);
      onError?.(msg);
      // Auto-clear after 5 s
      setTimeout(() => setError(null), 5000);
    },
    [onError],
  );

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startRecording = async () => {
    setError(null);

    // Feature detection
    if (typeof MediaRecorder === 'undefined') {
      reportError('Your browser does not support audio recording.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      reportError('Your browser does not support microphone access.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: unknown) {
      const e = err as DOMException;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        reportError('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (e.name === 'NotFoundError') {
        reportError('No microphone found. Please connect a microphone.');
      } else {
        reportError(`Microphone error: ${e.message || 'Unknown error'}`);
      }
      return;
    }

    streamRef.current = stream;

    const { mimeType, ext } = getSupportedMimeType();

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch {
      stopStream();
      reportError('Failed to initialise audio recorder.');
      return;
    }

    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onerror = () => {
      stopStream();
      setRecording(false);
      reportError('Recording failed unexpectedly.');
    };

    mediaRecorder.onstop = async () => {
      stopStream();

      const elapsed = Date.now() - recordingStartRef.current;
      if (elapsed < MIN_RECORDING_MS || chunksRef.current.length === 0) {
        reportError('Recording too short. Please hold the button longer.');
        return;
      }

      const actualType = mediaRecorder.mimeType || mimeType || 'audio/webm';
      const audioBlob = new Blob(chunksRef.current, { type: actualType });

      if (audioBlob.size < 100) {
        reportError('Recording was empty. Please try again.');
        return;
      }

      setProcessing(true);
      try {
        const result = await speechToText(audioBlob, `recording.${ext || 'webm'}`);
        if (result.text && result.text.trim()) {
          onTranscript(result.text.trim());
        } else {
          reportError('No speech detected. Please try again.');
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Speech-to-text failed.';
        console.error('STT error:', err);
        if (msg.includes('not configured') || msg.includes('Whisper')) {
          reportError('Speech-to-text service is not configured. Contact your admin.');
        } else {
          reportError(`Transcription failed: ${msg}`);
        }
      } finally {
        setProcessing(false);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    recordingStartRef.current = Date.now();
    mediaRecorder.start(250); // collect data every 250 ms for smoother stop
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled || processing}
        className={`p-2.5 rounded-xl transition-all ${
          recording
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse'
            : processing
            ? 'bg-gray-700 text-gray-500'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
        }`}
        title={recording ? 'Stop recording' : processing ? 'Processing...' : 'Start voice input'}
      >
        {processing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : recording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      {error && (
        <div className="absolute bottom-full mb-2 right-0 w-64 p-2 bg-red-900/90 border border-red-700 rounded-lg text-xs text-red-200 shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}
