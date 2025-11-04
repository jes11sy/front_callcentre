'use client';

import { useEffect } from 'react';
import { notifications } from '@/components/ui/notifications';
import { Call } from '@/types/telephony';

interface UseSocketCallsProps {
  on: (event: string, callback: (...args: unknown[]) => void) => (() => void);
  isConnected: boolean;
  onNewCall: (call: Call) => void;
  onUpdatedCall: (call: Call) => void;
  onEndedCall: (call: Call) => void;
}

export function useSocketCalls({
  on,
  isConnected,
  onNewCall,
  onUpdatedCall,
  onEndedCall
}: UseSocketCallsProps) {

  useEffect(() => {
    if (!on) {
      return;
    }

    const handleNewCall = (...args: unknown[]) => {
      const call = args[0] as Call;
      onNewCall(call);
      notifications.info('Новый звонок получен');
    };

    const handleUpdatedCall = (...args: unknown[]) => {
      const call = args[0] as Call;
      onUpdatedCall(call);
    };

    const handleEndedCall = (...args: unknown[]) => {
      const call = args[0] as Call;
      onEndedCall(call);
    };

    const unsubNewCall = on('call:new', handleNewCall);
    const unsubUpdatedCall = on('call:updated', handleUpdatedCall);
    const unsubEndedCall = on('call:ended', handleEndedCall);

    return () => {
      unsubNewCall();
      unsubUpdatedCall();
      unsubEndedCall();
    };
  }, [on, onNewCall, onUpdatedCall, onEndedCall]);
}

