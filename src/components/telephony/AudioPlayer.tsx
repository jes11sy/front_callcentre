'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
import { SpotifyAudioPlayer } from '@/components/ui/spotify-audio-player';
import { Call } from '@/types/telephony';
import { toast } from 'sonner';

interface AudioPlayerProps {
  call: Call;
  playingCall: number | null;
  currentAudioUrl: string | null;
  onLoadRecording: (call: Call) => void;
  onClosePlayer: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  call,
  playingCall,
  currentAudioUrl,
  onLoadRecording,
  onClosePlayer
}) => {
  const isCurrentCall = playingCall === call.id;
  const hasRecording = !!call.recordingPath;

  if (!hasRecording) {
    if (call.recordingEmailSent) {
      return (
        <Badge variant="outline" className="text-xs">
          Ожидается
        </Badge>
      );
    }
    return <span className="text-muted-foreground">—</span>;
  }

  if (!isCurrentCall) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onLoadRecording(call)}
        className="h-8 flex items-center justify-center"
      >
        <Play className="h-4 w-4" />
      </Button>
    );
  }

  return currentAudioUrl ? (
    <SpotifyAudioPlayer 
      audioUrl={currentAudioUrl}
      onError={(error) => {
        toast.error(error);
        onClosePlayer();
      }}
      className="min-w-[250px]"
    />
  ) : (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-sm text-muted-foreground">Загрузка...</span>
    </div>
  );
};
