import { useState, useCallback, useEffect } from 'react';
import { AudioPlayerState, Call } from '@/types/orders';
import { notifications } from '@/components/ui/notifications';
import api from '@/lib/api'; // 🍪 Используем настроенный axios instance

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

  // 🍪 Загрузка записи через axios
  const loadRecording = useCallback(async (call: Call) => {
    try {
      // Пробуем получить JSON response (S3 URL)
      const response = await api.get(`/recordings/call/${call.id}/download`, {
        responseType: 'json',
      });

      let audioUrl: string;
      
      // Если получили JSON с URL - используем его
      if (response.data.success && response.data.url) {
        audioUrl = response.data.url;
      } else {
        throw new Error(response.data.message || 'Не удалось получить URL записи');
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
