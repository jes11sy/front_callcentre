'use client';

import { useCallback, useState } from 'react';
import { recordingsService } from '@/services';

type UseCallRecordingPlaybackOptions<TCall> = {
  hasRecording?: (call: TCall) => boolean;
  onMissingRecording?: () => void;
  onLoadError?: (error: unknown) => void;
  onDownloadSuccess?: () => void;
  onDownloadError?: () => void;
};

type CallWithId = {
  id: number;
};

export function useCallRecordingPlayback<TCall extends CallWithId>(
  options: UseCallRecordingPlaybackOptions<TCall> = {}
) {
  const [playingCall, setPlayingCall] = useState<TCall | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const loadRecording = useCallback(async (call: TCall) => {
    if (options.hasRecording && !options.hasRecording(call)) {
      options.onMissingRecording?.();
      return;
    }

    try {
      setPlayingCall(call);
      const url = await recordingsService.getDownloadUrl(call.id);
      setCurrentAudioUrl(url);
    } catch (error) {
      setPlayingCall(null);
      setCurrentAudioUrl(null);
      options.onLoadError?.(error);
    }
  }, [options]);

  const closePlayer = useCallback(() => {
    setPlayingCall(null);
    setCurrentAudioUrl(null);
  }, []);

  const downloadRecording = useCallback(async (call: TCall) => {
    if (options.hasRecording && !options.hasRecording(call)) {
      options.onMissingRecording?.();
      return;
    }

    try {
      const url = await recordingsService.getDownloadUrl(call.id);
      const link = document.createElement('a');
      link.href = url;
      link.download = `call_${call.id}_recording.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      options.onDownloadSuccess?.();
    } catch (error) {
      options.onDownloadError?.();
      options.onLoadError?.(error);
    }
  }, [options]);

  return {
    playingCall,
    currentAudioUrl,
    loadRecording,
    closePlayer,
    downloadRecording,
  };
}

