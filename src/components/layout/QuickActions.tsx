'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Plus,
  Phone,
  FileText,
  Search,
  BarChart3,
  BookOpen,
  X,
  Globe,
  MessageSquare
} from 'lucide-react';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface QuickActionsProps {
  onOpenSearch: () => void;
}

export function QuickActions({ onOpenSearch }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const actions: QuickAction[] = [
    {
      label: 'Поиск клиента',
      icon: <Search className="h-4 w-4" />,
      action: () => { setIsOpen(false); onOpenSearch(); },
      color: 'text-[#FEC004]',
    },
    {
      label: 'Телефония',
      icon: <Phone className="h-4 w-4" />,
      action: () => { setIsOpen(false); router.push('/telephony'); },
      color: 'text-emerald-500',
    },
    {
      label: 'Заказы',
      icon: <FileText className="h-4 w-4" />,
      action: () => { setIsOpen(false); router.push('/orders'); },
      color: 'text-blue-500',
    },
    {
      label: 'Обращения',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => { setIsOpen(false); router.push('/appeals'); },
      color: 'text-purple-500',
    },
    {
      label: 'Заявки Сайт',
      icon: <Globe className="h-4 w-4" />,
      action: () => { setIsOpen(false); router.push('/site-orders'); },
      color: 'text-orange-500',
    },
    {
      label: 'Статистика',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => { setIsOpen(false); router.push('/stats'); },
      color: 'text-cyan-500',
    },
    {
      label: 'Справочник',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => { setIsOpen(false); router.push('/reference'); },
      color: 'text-gray-500',
    },
  ];

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-[9990] lg:hidden">
      {/* Actions panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-56 bg-white dark:bg-[#1e2530] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-2">
          <div className="py-2">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#FEC004]/10 transition-colors text-left"
              >
                <span className={action.color}>{action.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-200">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-gray-200 dark:bg-gray-700 rotate-45'
            : 'bg-[#FEC004] hover:bg-[#e6ac00]'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        ) : (
          <Zap className="h-6 w-6 text-gray-900" />
        )}
      </button>
    </div>
  );
}
