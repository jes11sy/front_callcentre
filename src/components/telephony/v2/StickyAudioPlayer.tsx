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
import { useDesignStore } from '@/store/designStore';

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
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  
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
      "transform transition-transform duration-300",
      isVisible ? "translate-y-0" : "translate-y-full",
      isDark
        ? "bg-[#1e2530] border-t border-gray-700 shadow-lg font-myriad"
        : "bg-white border-t border-gray-200 shadow-lg font-myriad"
    )}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Мобильный вид */}
      <div className="sm:hidden px-3 py-2">
        {/* Верхняя строка: инфо + кнопки */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Информация о звонке */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {false && (
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-[#FFD700]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className={cn(
                "text-xs font-medium truncate",
                isDark ? "text-gray-100" : "text-gray-900"
              )}>
                {call.phoneClient}
              </div>
              <div className={cn(
                "text-[10px] truncate",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {call.city?.name || '—'}
              </div>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(call)}
              className={cn(
                "h-8 w-8 p-0",
                "text-gray-400 active:text-[#FEC004]"
              )}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn(
                "h-8 w-8 p-0",
                isDark ? "text-gray-400 active:text-gray-200" : "text-gray-400 active:text-gray-700"
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Нижняя строка: контролы + прогресс */}
        <div className="flex items-center gap-2">
          {/* Кнопки управления */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-10)}
            disabled={isLoading}
            className={cn(
              "h-8 w-8 p-0 shrink-0",
              isDark ? "text-gray-400" : "text-gray-400"
            )}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            className={cn(
              "h-10 w-10 p-0 shrink-0",
              "text-[#FEC004]"
            )}
          >
            {isLoading ? (
              <div className={cn(
                "h-5 w-5 animate-spin rounded-full border-2 border-t-transparent",
                "border-[#FEC004]"
              )} />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(10)}
            disabled={isLoading}
            className={cn(
              "h-8 w-8 p-0 shrink-0",
              isDark ? "text-gray-400" : "text-gray-400"
            )}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* Время + прогресс */}
          <span className={cn(
            "text-[10px] font-mono w-8 text-center shrink-0",
              isDark ? "text-gray-400" : "text-gray-500"
          )}>
            {formatTime(currentTime)}
          </span>

          <div className="flex-1 min-w-0">
            <Slider
              value={[progressPercentage]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              disabled={isLoading}
              className={cn(
                "cursor-pointer",
                "[&_[role=slider]]:bg-[#FEC004] [&_[data-orientation=horizontal]>span:first-child>span]:bg-[#FEC004]"
              )}
            />
          </div>

          <span className={cn(
            "text-[10px] font-mono w-8 text-center shrink-0",
              isDark ? "text-gray-400" : "text-gray-500"
          )}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
      
      {/* Десктопный вид */}
      <div className="hidden sm:block max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Информация о звонке */}
          <div className="flex items-center gap-3 min-w-[200px]">
            {false && (
              <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#FFD700]" />
              </div>
            )}
            <div className="min-w-0">
              <div className={cn(
                "text-sm font-medium truncate",
                isDark ? "text-gray-100" : "text-gray-900"
              )}>
                {call.phoneClient}
              </div>
              <div className={cn(
                "text-xs truncate",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {call.city?.name || '—'} • {call.operator.name}
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
                className={cn(
                  "h-8 w-8 p-0",
                  isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"
                )}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                disabled={isLoading}
                className={cn(
                  "h-10 w-10 p-0",
                  "text-[#FEC004] hover:bg-[#FEC004]/10"
                )}
              >
                {isLoading ? (
                  <div className={cn(
                    "h-5 w-5 animate-spin rounded-full border-2 border-t-transparent",
                    "border-[#FEC004]"
                  )} />
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
                className={cn(
                  "h-8 w-8 p-0",
                  isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"
                )}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Время текущее */}
            <span className={cn(
              "text-xs font-mono min-w-[40px]",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
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
                className={cn(
                  "cursor-pointer",
                  "[&_[role=slider]]:bg-[#FEC004] [&_[data-orientation=horizontal]>span:first-child>span]:bg-[#FEC004]"
                )}
              />
            </div>

            {/* Время общее */}
            <span className={cn(
              "text-xs font-mono min-w-[40px]",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              {formatTime(duration)}
            </span>

            {/* Громкость */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className={cn(
                  "h-8 w-8 p-0",
                  isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"
                )}
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
                className={cn(
                  "w-20",
                  "[&_[role=slider]]:bg-[#FEC004] [&_[data-orientation=horizontal]>span:first-child>span]:bg-[#FEC004]"
                )}
              />
            </div>
          </div>

          {/* Дополнительные действия */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(call)}
              className={cn(
                "h-8 w-8 p-0",
                "text-gray-400 hover:text-[#FEC004]"
              )}
              title="Скачать запись"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn(
                "h-8 w-8 p-0",
                isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"
              )}
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
