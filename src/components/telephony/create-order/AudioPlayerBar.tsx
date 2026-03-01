'use client';

import React from 'react';
import { Loader2, Play, Pause, X } from 'lucide-react';

interface Call {
  id: number;
  createdAt: string;
  callDirection: 'inbound' | 'outbound' | 'callback';
  operator?: { id: number; name: string; login: string };
}

interface AudioPlayerBarProps {
  playingCall: Call;
  audioUrl: string | null;
  audioLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isDark: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onPlayPause: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
  formatDate: (dateString: string) => string;
}

const formatAudioTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AudioPlayerBar = React.memo(({
  playingCall,
  audioUrl,
  audioLoading,
  isPlaying,
  currentTime,
  duration,
  isDark,
  audioRef,
  onPlayPause,
  onSeek,
  onClose,
  onPlay,
  onPause,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  formatDate,
}: AudioPlayerBarProps) => (
  <div className="border-t-2 px-3 sm:px-4 py-2 sm:py-3 shrink-0 border-[#FEC004]/40 bg-white dark:bg-[#252d3a]">
    {audioUrl && (
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />
    )}

    <div className="flex items-center gap-2 sm:gap-4">
      <button
        onClick={onPlayPause}
        disabled={audioLoading || !audioUrl}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 bg-[#FEC004] hover:bg-[#e6ac00]"
      >
        {audioLoading ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-900" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
        ) : (
          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 ml-0.5" />
        )}
      </button>

      <div className="hidden sm:block min-w-0 w-48">
        <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
          {playingCall.operator?.name || 'Оператор'}
        </div>
        <div className="text-xs flex items-center gap-1.5 truncate text-gray-500 dark:text-gray-400">
          <span>{formatDate(playingCall.createdAt)}</span>
          <span className="text-gray-300 dark:text-gray-600">&bull;</span>
          <span className={
            playingCall.callDirection === 'callback'
              ? 'text-purple-400'
              : playingCall.callDirection === 'outbound'
                ? 'text-blue-400'
                : 'text-emerald-400'
          }>
            {playingCall.callDirection === 'callback' ? 'От мастера' : playingCall.callDirection === 'outbound' ? 'Исход.' : 'Вход.'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-2 sm:gap-3">
        <span className="text-[10px] sm:text-xs w-8 sm:w-10 text-right font-mono text-gray-500 dark:text-gray-400">
          {formatAudioTime(currentTime)}
        </span>
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={onSeek}
            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer
              bg-gray-200 dark:bg-gray-700 [&::-webkit-slider-thumb]:bg-[#FEC004] [&::-moz-range-thumb]:bg-[#FEC004]`}
            style={{
              background: `linear-gradient(to right, #FEC004 0%, #FEC004 ${(currentTime / (duration || 1)) * 100}%, ${isDark ? '#374151' : '#e5e7eb'} ${(currentTime / (duration || 1)) * 100}%, ${isDark ? '#374151' : '#e5e7eb'} 100%)`
            }}
          />
        </div>
        <span className="text-[10px] sm:text-xs w-8 sm:w-10 font-mono text-gray-500 dark:text-gray-400">
          {formatAudioTime(duration)}
        </span>
      </div>

      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
));

AudioPlayerBar.displayName = 'AudioPlayerBar';
