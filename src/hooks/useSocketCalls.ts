'use client';

import { useEffect, useCallback } from 'react';
import { notifications } from '@/components/ui/notifications';
import { Call } from '@/types/telephony';
import { socketLogger } from '@/lib/logger';

interface UseSocketCallsProps {
  // Используем on/off из useGlobalSocket, а не raw socket
  on?: (event: string, callback: (...args: unknown[]) => void) => () => void;
  off?: (event: string, callback: (...args: unknown[]) => void) => void;
  isConnected: boolean;
  onNewCall: (call: Call) => void;
  onUpdatedCall: (call: Call) => void;
  onEndedCall: (call: Call) => void;
}

export function useSocketCalls({
  on,
  off,
  isConnected,
  onNewCall,
  onUpdatedCall,
  onEndedCall
}: UseSocketCallsProps) {

  const handleNewCall = useCallback((...args: unknown[]) => {
    socketLogger.log('handleNewCall triggered with args:', args);
    const call = args[0] as Call;
    socketLogger.log('Parsed call:', call);
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
    if (!on || !isConnected) {
      return;
    }

    // Используем on из SocketManager который работает через onAny proxy
    const unsubNew = on('call:new', handleNewCall);
    const unsubUpdated = on('call:updated', handleUpdatedCall);
    const unsubEnded = on('call:ended', handleEndedCall);

    return () => {
      unsubNew();
      unsubUpdated();
      unsubEnded();
    };
  }, [on, isConnected, handleNewCall, handleUpdatedCall, handleEndedCall]);
}

