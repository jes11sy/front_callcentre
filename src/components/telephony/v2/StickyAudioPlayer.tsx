'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  X, 
  Volume2, 
  VolumeX,
  Download,
  SkipBack,
  SkipForward,
  Phone
} from 'lucide-react';
import { Call } from '@/types/telephony';
import { cn } from '@/lib/utils';

interface StickyAudioPlayerProps {
  call: Call | null;
  audioUrl: string | null;
  isVisible: boolean;
  onClose: () => void;
  onDownload: (call: Call) => void;
}

export const StickyAudioPlayer: React.FC<StickyAudioPlayerProps> = ({
  call,
  audioUrl,
  isVisible,
  onClose,
  onDownload
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  // Auto-play when new audio is loaded
  useEffect(() => {
    if (audioUrl && audioRef.current && !isLoading) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isLoading]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isVisible || !audioUrl || !call) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-gradient-to-r from-[#17212b] to-[#1a1a2e]",
      "border-t-2 border-[#FFD700]/30",
      "shadow-2xl shadow-black/50",
      "transform transition-transform duration-300",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Информация о звонке */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#FFD700] truncate">
                {call.phoneClient}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {call.city} • {call.operator.name}
              </div>
            </div>
          </div>

          {/* Контролы плеера */}
          <div className="flex-1 flex items-center gap-3">
            {/* Кнопки управления */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(-10)}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="h-10 w-10 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FFD700] border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(10)}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Время текущее */}
            <span className="text-xs text-gray-400 font-mono min-w-[40px]">
              {formatTime(currentTime)}
            </span>

            {/* Прогресс-бар */}
            <div className="flex-1">
              <Slider
                value={[progressPercentage]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                disabled={isLoading}
                className="cursor-pointer"
              />
            </div>

            {/* Время общее */}
            <span className="text-xs text-gray-400 font-mono min-w-[40px]">
              {formatTime(duration)}
            </span>

            {/* Громкость */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
            </div>
          </div>

          {/* Дополнительные действия */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(call)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#FFD700]"
              title="Скачать запись"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              title="Закрыть плеер"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

StickyAudioPlayer.displayName = 'StickyAudioPlayer';
