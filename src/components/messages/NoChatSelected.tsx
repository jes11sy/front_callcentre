'use client';

import { MessageSquare } from 'lucide-react';

export function NoChatSelected() {
  return (
    <div className="text-center">
      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[#FFD700]" />
      <h3 className="text-xl font-medium text-[#F8F7F9] mb-2">Выберите чат</h3>
      <p className="text-[#F8F7F9]/80">
        Выберите чат из списка слева для начала общения
      </p>
    </div>
  );
}
