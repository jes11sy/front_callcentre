'use client';

import { useEffect } from 'react';
import { notifications } from '@/components/ui/notifications';
import { Call } from '@/types/telephony';

interface UseSocketCallsProps {
  socket: { on: (event: string, callback: (...args: unknown[]) => void) => void; off: (event: string) => void } | null;
  isConnected: boolean;
  onNewCall: (call: Call) => void;
  onUpdatedCall: (call: Call) => void;
  onEndedCall: (call: Call) => void;
}

export function useSocketCalls({
  socket,
  isConnected,
  onNewCall,
  onUpdatedCall,
  onEndedCall
}: UseSocketCallsProps) {

  console.log('🔧 useSocketCalls called, socket:', socket ? 'EXISTS' : 'NULL');

  useEffect(() => {
    console.log('🔧 useSocketCalls useEffect, socket:', socket ? 'EXISTS' : 'NULL');
    
    if (!socket) {
      console.warn('⚠️ useSocketCalls: socket is NULL');
      return;
    }

    console.log('✅ useSocketCalls: Registering listeners');

    const handleNewCall = (call: Call) => {
      console.log('📞 New call:', call);
      onNewCall(call);
      notifications.info('Новый звонок получен');
    };

    const handleUpdatedCall = (call: Call) => {
      console.log('📞 Call updated:', call);
      onUpdatedCall(call);
    };

    const handleEndedCall = (call: Call) => {
      console.log('📞 Call ended:', call);
      onEndedCall(call);
    };

    socket.on('call:new', handleNewCall);
    socket.on('call:updated', handleUpdatedCall);
    socket.on('call:ended', handleEndedCall);

    return () => {
      socket.off('call:new');
      socket.off('call:updated');
      socket.off('call:ended');
    };
  }, [socket, onNewCall, onUpdatedCall, onEndedCall]);
}

