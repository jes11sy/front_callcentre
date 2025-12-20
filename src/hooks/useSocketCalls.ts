'use client';

import { useEffect, useCallback } from 'react';
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

  const handleNewCall = useCallback((...args: unknown[]) => {
    console.log('📞 [useSocketCalls] handleNewCall triggered with args:', args);
    const call = args[0] as Call;
    console.log('📞 [useSocketCalls] Parsed call:', call);
    onNewCall(call);
    notifications.info('Новый звонок получен');
  }, [onNewCall]);

  const handleUpdatedCall = useCallback((...args: unknown[]) => {
    const call = args[0] as Call;
    onUpdatedCall(call);
  }, [onUpdatedCall]);

  const handleEndedCall = useCallback((...args: unknown[]) => {
    const call = args[0] as Call;
    onEndedCall(call);
  }, [onEndedCall]);

  useEffect(() => {
    if (!socket) {
      console.log('⚠️ [useSocketCalls] No socket available');
      return;
    }

    console.log('✅ [useSocketCalls] Setting up call event listeners');
    
    socket.on('call:new', handleNewCall);
    socket.on('call:updated', handleUpdatedCall);
    socket.on('call:ended', handleEndedCall);

    return () => {
      console.log('🧹 [useSocketCalls] Cleaning up call event listeners');
      socket.off('call:new');
      socket.off('call:updated');
      socket.off('call:ended');
    };
  }, [socket, handleNewCall, handleUpdatedCall, handleEndedCall]);
}

