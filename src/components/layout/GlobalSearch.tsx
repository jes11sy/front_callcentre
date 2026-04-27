'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Phone, FileText, Globe, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface SearchResult {
  orders: Array<{
    id: number;
    clientName: string;
    phone: string;
    status?: { name: string };
    city?: { name: string };
  }>;
  calls: Array<{
    id: number;
    phoneClient: string;
    createdAt: string;
    status: string;
    operator?: { name: string };
  }>;
  siteOrders: Array<{
    id: number;
    clientName: string;
    phone: string;
    status: string;
    site: string;
  }>;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchOverlay({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [ordersRes, callsRes, siteOrdersRes] = await Promise.allSettled([
          api.get(`/orders?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/calls?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/site-orders?search=${encodeURIComponent(query)}&limit=5`),
        ]);

        setResults({
          orders: ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.data || []) : [],
          calls: callsRes.status === 'fulfilled' ? (callsRes.value.data?.data || []) : [],
          siteOrders: siteOrdersRes.status === 'fulfilled' ? (siteOrdersRes.value.data?.data || []) : [],
        });
      } catch {
        setResults({ orders: [], calls: [], siteOrders: [] });
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const totalResults = results
    ? results.orders.length + results.calls.length + results.siteOrders.length
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] sm:pt-[12vh]">
      <div
        ref={panelRef}
        className="mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-2xl dark:border-white/15 dark:bg-[#141a22]"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-black/[0.08] px-4 py-3.5 dark:border-white/10">
          <Search className="h-5 w-5 shrink-0 text-[#6e6e73] dark:text-white/60" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по телефону, имени клиента..."
            className="flex-1 bg-transparent text-sm text-[#111113] outline-none placeholder:text-[#8e8e93] dark:text-white dark:placeholder:text-white/35"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[#6e6e73] dark:text-white/60" />}
          <button onClick={onClose} className="text-[#6e6e73] hover:text-[#111113] dark:text-white/60 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[52vh] overflow-y-auto bg-white dark:bg-[#141a22]">
          {query.length < 3 ? (
            <div className="px-4 py-10 text-center text-sm text-[#8e8e93] dark:text-white/45">
              Введите минимум 3 символа для поиска
            </div>
          ) : loading ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#FEC004]" />
            </div>
          ) : results && totalResults === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#8e8e93] dark:text-white/45">
              Ничего не найдено по запросу &ldquo;{query}&rdquo;
            </div>
          ) : results ? (
            <div className="py-2.5">
              {results.orders.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8e8e93] dark:text-white/45">
                    Заказы ({results.orders.length})
                  </div>
                  {results.orders.map((order) => (
                    <button
                      key={`order-${order.id}`}
                      onClick={() => navigateTo(`/orders?orderId=${order.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    >
                      <FileText className="h-4 w-4 text-[#FEC004] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#111113] dark:text-white">
                          #{order.id} — {order.clientName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6e6e73] dark:text-white/55">
                          <span>{order.phone}</span>
                          {order.city?.name && <span>&bull; {order.city.name}</span>}
                          {order.status?.name && <span>&bull; {order.status.name}</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.calls.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8e8e93] dark:text-white/45">
                    Звонки ({results.calls.length})
                  </div>
                  {results.calls.map((call) => (
                    <button
                      key={`call-${call.id}`}
                      onClick={() => navigateTo('/telephony')}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    >
                      <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-[#111113] dark:text-white">
                          {call.phoneClient}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6e6e73] dark:text-white/55">
                          <span>{new Date(call.createdAt).toLocaleString('ru-RU')}</span>
                          <span>&bull; {call.status === 'answered' ? 'Отвечен' : call.status === 'missed' ? 'Пропущен' : call.status}</span>
                          {call.operator?.name && <span>&bull; {call.operator.name}</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.siteOrders.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8e8e93] dark:text-white/45">
                    Заявки с сайта ({results.siteOrders.length})
                  </div>
                  {results.siteOrders.map((so) => (
                    <button
                      key={`so-${so.id}`}
                      onClick={() => navigateTo('/site-orders')}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    >
                      <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#111113] dark:text-white">
                          #{so.id} — {so.clientName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6e6e73] dark:text-white/55">
                          <span>{so.phone}</span>
                          <span>&bull; {so.site}</span>
                          <span>&bull; {so.status}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
