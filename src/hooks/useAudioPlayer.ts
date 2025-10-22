import { useState, useCallback, useEffect } from 'react';
import { AudioPlayerState, Call } from '@/types/orders';
import { notifications } from '@/components/ui/notifications';
import { tokenStorage } from '@/lib/secure-storage';

const initialAudioState: AudioPlayerState = {
  audio: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  volume: 1,
  currentCallId: null
};

export const useAudioPlayer = () => {
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayerState>(initialAudioState);

  // Очистка аудио при размонтировании компонента
  useEffect(() => {
    return () => {
      if (audioPlayer.audio) {
        audioPlayer.audio.pause();
        audioPlayer.audio.currentTime = 0;
      }
    };
  }, [audioPlayer.audio]);

  const loadRecording = useCallback(async (call: Call) => {
    try {
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/recordings/call/${call.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load recording');
      }

      let audioUrl: string;
      
      // Проверяем, возвращает ли сервер JSON (S3) или аудио поток (локальный файл)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // S3 файл - получаем подписанный URL
        const data = await response.json();
        if (data.success && data.url) {
          audioUrl = data.url;
        } else {
          throw new Error(data.message || 'Не удалось получить URL записи');
        }
      } else {
        // Локальный файл - создаем blob URL
        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
      }
      
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioPlayer(prev => ({
          ...prev,
          audio,
          duration: audio.duration,
          currentCallId: call.id
        }));
      });

      audio.addEventListener('timeupdate', () => {
        setAudioPlayer(prev => ({
          ...prev,
          currentTime: audio.currentTime
        }));
      });

      audio.addEventListener('ended', () => {
        setAudioPlayer(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0
        }));
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', () => {
        notifications.error('Ошибка воспроизведения записи');
        URL.revokeObjectURL(audioUrl);
      });

    } catch (error) {
      console.error('Error loading recording:', error);
      notifications.error('Ошибка загрузки записи');
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioPlayer.audio) return;

    if (audioPlayer.isPlaying) {
      audioPlayer.audio.pause();
      setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioPlayer.audio.play();
      setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
    }
  }, [audioPlayer.audio, audioPlayer.isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (!audioPlayer.audio) return;
    audioPlayer.audio.currentTime = time;
    setAudioPlayer(prev => ({ ...prev, currentTime: time }));
  }, [audioPlayer.audio]);

  const setVolume = useCallback((volume: number) => {
    if (!audioPlayer.audio) return;
    audioPlayer.audio.volume = volume;
    setAudioPlayer(prev => ({ ...prev, volume }));
  }, [audioPlayer.audio]);

  const skipBackward = useCallback(() => {
    if (!audioPlayer.audio) return;
    const newTime = Math.max(0, audioPlayer.currentTime - 10);
    seekTo(newTime);
  }, [audioPlayer.audio, audioPlayer.currentTime, seekTo]);

  const skipForward = useCallback(() => {
    if (!audioPlayer.audio) return;
    const newTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    seekTo(newTime);
  }, [audioPlayer.audio, audioPlayer.currentTime, audioPlayer.duration, seekTo]);

  const stopPlayback = useCallback(() => {
    if (audioPlayer.audio) {
      audioPlayer.audio.pause();
      audioPlayer.audio.currentTime = 0;
    }
    setAudioPlayer(initialAudioState);
  }, [audioPlayer.audio]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    audioPlayer,
    loadRecording,
    togglePlayPause,
    seekTo,
    setVolume,
    skipBackward,
    skipForward,
    stopPlayback,
    formatTime
  };
};
