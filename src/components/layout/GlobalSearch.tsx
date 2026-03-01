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

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, handleClose]);

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
    handleClose();
  };

  const totalResults = results
    ? results.orders.length + results.calls.length + results.siteOrders.length
    : 0;

  return (
    <>
      {/* Search trigger button in sidebar */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-normal text-gray-500 dark:text-gray-400 hover:text-[#FEC004] transition-colors w-full group"
      >
        <Search className="h-5 w-5 group-hover:text-[#FEC004] transition-colors" />
        <span className="group-hover:text-[#FEC004] transition-colors">Поиск</span>
        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
          Ctrl+K
        </span>
      </button>

      {/* Search overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
          <div
            ref={panelRef}
            className="w-full max-w-2xl mx-4 bg-white dark:bg-[#1e2530] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по телефону, имени клиента..."
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none text-sm"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query.length < 3 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  Введите минимум 3 символа для поиска
                </div>
              ) : loading ? (
                <div className="px-4 py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#FEC004]" />
                </div>
              ) : results && totalResults === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  Ничего не найдено по запросу &ldquo;{query}&rdquo;
                </div>
              ) : results ? (
                <div className="py-2">
                  {/* Orders */}
                  {results.orders.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Заказы ({results.orders.length})
                      </div>
                      {results.orders.map((order) => (
                        <button
                          key={`order-${order.id}`}
                          onClick={() => navigateTo(`/orders?orderId=${order.id}`)}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#FEC004]/10 transition-colors text-left"
                        >
                          <FileText className="h-4 w-4 text-[#FEC004] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              #{order.id} — {order.clientName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{order.phone}</span>
                              {order.city?.name && <span>&bull; {order.city.name}</span>}
                              {order.status?.name && <span>&bull; {order.status.name}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Calls */}
                  {results.calls.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Звонки ({results.calls.length})
                      </div>
                      {results.calls.map((call) => (
                        <button
                          key={`call-${call.id}`}
                          onClick={() => navigateTo('/telephony')}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#FEC004]/10 transition-colors text-left"
                        >
                          <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                              {call.phoneClient}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{new Date(call.createdAt).toLocaleString('ru-RU')}</span>
                              <span>&bull; {call.status === 'answered' ? 'Отвечен' : call.status === 'missed' ? 'Пропущен' : call.status}</span>
                              {call.operator?.name && <span>&bull; {call.operator.name}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Site Orders */}
                  {results.siteOrders.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Заявки с сайта ({results.siteOrders.length})
                      </div>
                      {results.siteOrders.map((so) => (
                        <button
                          key={`so-${so.id}`}
                          onClick={() => navigateTo('/site-orders')}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#FEC004]/10 transition-colors text-left"
                        >
                          <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              #{so.id} — {so.clientName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
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
      )}
    </>
  );
}
