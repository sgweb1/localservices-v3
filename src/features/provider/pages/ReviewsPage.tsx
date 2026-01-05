import React, { useMemo, useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { Star, MessageCircle, Award, Loader2, ThumbsUp, Send, X } from 'lucide-react';
import { PageTitle, Text, Caption, StatValue } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';

/**
 * Reviews Management Page
 * 
 * Zarządzanie opiniami i recenzjami od klientów:
 * - Statystyki: średnia rating, rozkład gwiazdek
 * - Trendy: liczba opinii w czasie
 * - Filtrowanie po liczbie gwiazdek (1-5)
 * - Opcja wyświetlania tylko bez odpowiedzi
 * - Lista opinii z możliwością udzielenia odpowiedzi
 * - Zaznaczanie opinii jako pomocne (helpful)
 * - Paginacja
 * 
 * @component
 * @returns {React.ReactElement} Reviews dashboard with stats and review list
 */
const ReviewsPage: React.FC = () => {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [page, setPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});

  const { data, isLoading, error, refetch, isRefetching } = useReviews(filterRating, page, showUnanswered);
  const items = data?.data ?? [];
  const avgRating = data?.averageRating ?? 0;
  const totalReviews = data?.totalReviews ?? 0;
  const distribution = data?.distribution ?? {};

  const ratingBreakdown = useMemo(() => ({
    5: distribution['5'] ?? 0,
    4: distribution['4'] ?? 0,
    3: distribution['3'] ?? 0,
    2: distribution['2'] ?? 0,
    1: distribution['1'] ?? 0,
  }), [distribution]);

  const filteredItems = items; // filtrowanie realizuje API (rating param)
  const currentPage = data?.meta?.current_page ?? 1;
  const lastPage = data?.meta?.last_page ?? 1;
  const total = data?.meta?.total ?? totalReviews;
  const perPage = data?.meta?.per_page ?? 20;

  console.log('Pagination debug:', { currentPage, lastPage, total, perPage, itemsLength: items.length });

  const handleFilterChange = (stars: number | null) => {
    console.log('Filter change:', { current: filterRating, new: stars });
    setFilterRating(stars);
    setPage(1); // Reset do strony 1 przy zmianie filtra
  };

  const toggleHelpful = (id: number) => {
    setHelpful((prev) => {
      if (prev[id]) return prev; // tylko front, bez backendu
      return { ...prev, [id]: true };
    });
  };

  const handleReplyChange = (id: number, value: string) => {
    setReplyTexts((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (id: number) => {
    const payload = replyTexts[id]?.trim();
    if (!payload) {
      toast.error('Wpisz odpowiedź');
      return;
    }

    try {
      await apiClient.post(`/provider/reviews/${id}/response`, {
        response: payload,
      });

      toast.success('Odpowiedź zapisana');
      setReplyingTo(null);
      setReplyTexts((prev) => ({ ...prev, [id]: '' }));
      await refetch();
    } catch (e) {
      if (e instanceof Error && e.message.includes('409')) {
        toast.error('Już odpowiedziałeś na tę opinię');
      } else {
        toast.error('Błąd sieci');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero - inspirowany DashboardPage */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,#ffffff_0%,transparent_35%)]" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10 blur-3xl" />

          <div className="relative p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">⭐</span>
              <div>
                <p className="text-sm font-semibold text-white">Zarządzanie opiniami</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight drop-shadow-md">Opinie klientów</h1>
              </div>
            </div>
            <p className="text-white text-sm sm:text-base max-w-2xl">
              Monitoruj swoją reputację, odpowiadaj na feedback i buduj zaufanie. Twoje opinie mają znaczenie dla nowych klientów.
            </p>

            {/* Stats Grid - szklane karty jak na Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Średnia ocena */}
              <div className="glass-card bg-white/90 border border-white/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-xs text-amber-700 font-semibold">Średnia ocena</p>
                  <p className="text-3xl font-black mt-1 text-amber-900">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : avgRating.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <Star className="w-5 h-5 fill-white" />
                </div>
              </div>

              {/* Łączna liczba */}
              <div className="glass-card bg-white/90 border border-white/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-xs text-orange-700 font-semibold">Łączna liczba</p>
                  <p className="text-3xl font-black mt-1 text-orange-900">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalReviews}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Jakość zadowolenia */}
              <div className="glass-card bg-white/90 border border-white/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-xs text-amber-700 font-semibold">Zadowolenie</p>
                  <p className="text-3xl font-black mt-1 text-amber-900">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${Math.round(avgRating * 20)}%`}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtry - szklane karty */}
        <div className="glass-card rounded-2xl p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Filtry opinii</h2>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterRating === null && !showUnanswered ? 'primary' : 'info'}
                size="sm"
                onClick={() => { setFilterRating(null); setShowUnanswered(false); setPage(1); }}
              >
                Wszystkie ({totalReviews})
              </Button>
              <Button
                variant={showUnanswered ? 'warning' : 'info'}
                size="sm"
                onClick={() => { setShowUnanswered(!showUnanswered); setFilterRating(null); setPage(1); }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Bez odpowiedzi
              </Button>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingBreakdown[stars as keyof typeof ratingBreakdown] || 0;
                if (count === 0) return null;
                return (
                  <Button
                    key={stars}
                    variant={filterRating === stars ? 'primary' : 'info'}
                    size="sm"
                    onClick={() => handleFilterChange(stars)}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: stars }, (_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                      ))}
                      ({count})
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

      {/* Lista opinii - szklane karty */}
      <div className="space-y-4">
        {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-slate-900 mb-2">Brak opinii</p>
              <p className="text-sm text-slate-600">Każda opinia od klienta pojawi się tutaj. Czekaj na pierwsze oceny!</p>
            </div>
          ) : (
            filteredItems.map((r: any) => (
              <div key={r.id} className="glass-card rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-900">{r.customerName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <Badge variant="primary" className="text-xs">{r.rating}/5</Badge>
                      <span className="text-xs text-slate-500">{r.date}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-4 leading-relaxed">{r.comment}</p>

                {r.response && (
                  <div className="mb-4 p-4 rounded-xl bg-white/50 border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2 text-cyan-700 text-sm font-semibold">
                      <Send className="w-4 h-4" />
                      Twoja odpowiedź
                    </div>
                    <p className="text-sm text-slate-700">{r.response.response}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!r.response && replyingTo === r.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <textarea
                        placeholder="Napisz odpowiedź..."
                        className="flex-1 px-4 py-2 border border-cyan-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm bg-white"
                        autoFocus
                        rows={2}
                        value={replyTexts[r.id] || ''}
                        onChange={(e) => handleReplyChange(r.id, e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReplySubmit(r.id)}>
                          <Send className="w-4 h-4 mr-1" />
                          Wyślij
                        </Button>
                        <Button size="sm" variant="info" onClick={() => setReplyingTo(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!r.response && (
                        <Button size="sm" variant="info" onClick={() => setReplyingTo(r.id)}>
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Odpowiedz
                        </Button>
                      )}
                      <button
                        onClick={() => toggleHelpful(r.id)}
                        disabled={helpful[r.id]}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          helpful[r.id]
                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Przydatne
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginacja */}
        {lastPage > 1 && (
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="info"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isRefetching}
              >
                ← Poprzednia
              </Button>
              <Button
                size="sm"
                variant="info"
                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage || isRefetching}
              >
                Następna →
              </Button>
            </div>
            <Text muted size="sm" className="text-xs">
              Strona {currentPage} z {lastPage}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
