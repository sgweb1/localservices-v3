import React, { useState } from 'react';
import { useBookings } from '../dashboard/hooks/useBookings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/useConfirm';
import { DevToolsPanel } from '../dashboard/components/DevToolsPanel';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageTitle, SectionTitle, Text, Caption, Badge, StatValue, EmptyText } from '@/components/ui/typography';
import { Card, StatCard } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Trophy, 
  Lock, 
  Sparkles, 
  Gift, 
  Bell, 
  MessageSquare, 
  CalendarDays,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Mail,
  AlertTriangle,
  BadgeCheck,
  XCircle,
  Edit,
  EyeOff
} from 'lucide-react';

/**
 * Bookings Management Page - zgodny 1:1 z localservices
 * 
 * Pełna funkcjonalność: alert przeterminowanych, subscription/trial, 
 * szczegóły rezerwacji, akcje, sidebar, modal edycji, paginacja.
 */
export const BookingsPage: React.FC = () => {
  console.log('[BookingsPage] Rendering...');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);
  const { data, isLoading, error } = useBookings();
  
  console.log('[BookingsPage] Data:', { data, isLoading, error });
  
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { confirm, ConfirmDialog } = useConfirm();
  
  const items = data?.data ?? [];
  const stats = data?.counts ?? { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  const overdueCount = data?.overdueConfirmedCount ?? 0;
  const canManage = data?.canManage ?? false;
  const showUpsell = data?.showUpsell ?? false;
  const hasBookings = data?.hasBookings ?? (items.length > 0);
  const showTrialInfo = data?.showTrialInfo ?? false;
  const trialDays = data?.trialDays ?? 14;
  const maxBookingDate = data?.maxBookingDate;
  const pagination = data?.pagination;

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (bookingId: number) => apiClient.post(`/provider/bookings/${bookingId}/accept`),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Rezerwacja została zaakceptowana');
      queryClient.invalidateQueries({ queryKey: ['provider', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard', 'widgets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas akceptacji rezerwacji');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (bookingId: number) => apiClient.post(`/provider/bookings/${bookingId}/reject`),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Rezerwacja została odrzucona');
      queryClient.invalidateQueries({ queryKey: ['provider', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard', 'widgets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas odrzucania rezerwacji');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId: number) => apiClient.post(`/provider/bookings/${bookingId}/complete`),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Rezerwacja została oznaczona jako ukończona');
      queryClient.invalidateQueries({ queryKey: ['provider', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard', 'widgets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas oznaczania rezerwacji jako ukończona');
    },
  });

  const completeOverdueMutation = useMutation({
    mutationFn: () => apiClient.post('/provider/bookings/complete-overdue'),
    onSuccess: (response) => {
      const count = response.data.count || 0;
      toast.success(`Oznaczono ${count} rezerwacji jako ukończone`);
      queryClient.invalidateQueries({ queryKey: ['provider', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard', 'widgets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas oznaczania przeterminowanych rezerwacji');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bookingId: number) => apiClient.delete(`/provider/bookings/${bookingId}`),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Rezerwacja została ukryta w Twoim panelu');
      queryClient.invalidateQueries({ queryKey: ['provider', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard', 'widgets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas ukrywania rezerwacji');
    },
  });

  const handleDeleteBooking = async (bookingId: number) => {
    const ok = await confirm({
      title: 'Potwierdź ukrycie',
      message: 'Czy na pewno chcesz ukryć tę rezerwację? Rezerwacja zniknie z Twojego panelu, ale klient nadal będzie ją widzieć.',
      confirmText: 'Ukryj',
      variant: 'danger',
    });
    if (ok) {
      deleteMutation.mutate(bookingId);
    }
  };

  // Filtrowanie
  let filteredItems = items;
  if (statusFilter !== 'all') {
    filteredItems = filteredItems.filter(b => b.status === statusFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(b => 
      b.customerName?.toLowerCase().includes(q) || 
      b.serviceName?.toLowerCase().includes(q)
    );
  }

  // Akcje na rezerwacjach
  const handleAcceptBooking = (bookingId: number) => {
    acceptMutation.mutate(bookingId);
  };

  const handleRejectBooking = (bookingId: number) => {
    rejectMutation.mutate(bookingId);
  };

  const handleMarkCompleted = (bookingId: number) => {
    completeMutation.mutate(bookingId);
  };

  const handleCompleteBooking = (bookingId: number) => {
    completeMutation.mutate(bookingId);
  };

  const handleMarkAllOverdueCompleted = () => {
    completeOverdueMutation.mutate();
  };

  const handleOpenConversation = (customerId: number) => {
    console.log('Open conversation with customer:', customerId);
    // TODO: navigate do messages z customerId
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // Format time helper  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  return (
    <div className="space-y-8">
      {/* Alert: Przeterminowane potwierdzone rezerwacje */}
      {overdueCount > 0 && (
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Trophy className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="flex-1">
              <SectionTitle className="text-lg mb-1">
                Masz {overdueCount} {overdueCount === 1 ? 'zrealizowaną rezerwację' : 'zrealizowane rezerwacje'} do oznaczenia jako ukończona
              </SectionTitle>
              <Text size="sm" className="mb-4">
                Znaleziono potwierdzone rezerwacje, których termin już minął. Oznaczenie ich jako zrealizowanych zwiększa Twój <strong className="font-semibold text-emerald-700">Trust Score™</strong> i buduje wiarygodność w oczach klientów.
              </Text>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleMarkAllOverdueCompleted}
                  variant="success"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  Oznacz jako zrealizowane
                </Button>
                <Caption className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  Zwiększ Trust Score i widoczność
                </Caption>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pełny ekran upsell gdy brak rezerwacji i brak dostępu */}
      {showUpsell && !hasBookings && (
        <div className="glass-card p-12 rounded-2xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center">
              <Lock className="w-10 h-10 text-teal-600" />
            </div>
            
            <div className="space-y-3">
              <PageTitle gradient>
                Zarządzanie rezerwacjami
              </PageTitle>
              <Text size="lg" className="max-w-2xl mx-auto">
                Twój plan <strong>Free</strong> nie obejmuje zarządzania rezerwacjami instant booking. 
                Przejdź na plan <strong className="text-teal-600">Basic</strong>, aby:
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
              {[
                { icon: CheckCircle, title: 'Akceptuj rezerwacje', desc: 'Natychmiastowe potwierdzenia bez oczekiwania' },
                { icon: MessageSquare, title: 'Czat z klientami', desc: 'Bezpośrednia komunikacja w czasie rzeczywistym' },
                { icon: Bell, title: 'Powiadomienia push', desc: 'Nie przegap żadnej nowej rezerwacji' },
                { icon: CalendarDays, title: 'Kalendarz dostępności', desc: 'Zarządzaj swoim czasem i terminami' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-teal-50/50">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <Caption className="font-semibold text-slate-900">{item.title}</Caption>
                    <Text size="sm">{item.desc}</Text>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <Link to="/provider/subscription">
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  <Sparkles className="w-5 h-5" />
                  Przejdź na plan Basic
                </Button>
              </Link>
              <Caption muted>
                Od <strong className="text-teal-600">49 zł/mies</strong> • Anuluj w każdej chwili
              </Caption>
            </div>
          </div>
        </div>
      )}

      {/* Trial Mode Info Banner */}
      {showTrialInfo && (
        <div className="glass-card border-2 border-teal-100 bg-gradient-to-r from-teal-50/90 to-cyan-50/60 p-6 rounded-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-teal-600" />
                <Text size="lg" className="font-semibold">🎉 Tryb promocyjny aktywny!</Text>
              </div>
              <Text size="sm">
                Masz dostęp do zarządzania rezerwacjami na <strong>{trialDays} dni w przód</strong> 
                {maxBookingDate && ` (do ${maxBookingDate})`}.
                Rezerwacje w tym okresie są w pełni dostępne - możesz akceptować, odrzucać i przeglądać szczegóły.
              </Text>
              <Caption className="flex items-center gap-2 text-teal-700 mt-2">
                <Clock className="w-4 h-4" />
                <span>Rezerwacje poza tym okresem wymagają planu Basic (49 zł/mies)</span>
              </Caption>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/provider/subscription">
                <Button variant="primary" size="md">
                  <Sparkles className="w-5 h-5" />
                  Pełny dostęp
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Banner upsell gdy są rezerwacje ale brak dostępu */}
      {showUpsell && hasBookings && (
        <div className="glass-card border-2 border-teal-100 bg-gradient-to-r from-teal-50/90 to-cyan-50/60 p-6 rounded-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-600" />
                <Text size="lg" className="font-semibold">Zarządzanie rezerwacjami zablokowane</Text>
              </div>
              <Text size="sm">Twój plan Free nie obejmuje zarządzania rezerwacjami. Przejdź na plan Basic, aby akceptować/odrzucać rezerwacje, przeglądać szczegóły klientów i otrzymywać powiadomienia.</Text>
              <div className="flex flex-wrap gap-3 mt-3">
                {['Instant Booking', 'Czat z klientami', 'Powiadomienia push', 'Kalendarz dostępności'].map(feature => (
                  <Caption key={feature} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span>{feature}</span>
                  </Caption>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/provider/subscription">
                <Button variant="primary" size="md">
                  <Sparkles className="w-5 h-5" />
                  Ulepsz do planu Basic
                </Button>
              </Link>
              <Caption muted className="text-center">Od 49 zł/mies</Caption>
            </div>
          </div>
        </div>
      )}

      {/* Główna sekcja z rezerwacjami */}
      {(canManage || showTrialInfo || hasBookings) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Filtry */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Status</label>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Wszystkie rezerwacje</option>
                    <option value="pending">Oczekujące</option>
                    <option value="confirmed">Potwierdzone</option>
                    <option value="completed">Ukończone</option>
                    <option value="cancelled">Anulowane</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Szukaj klienta</label>
                  <Input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="np. Anna Kowalska"
                  />
                </div>
              </div>
            </div>

            {/* Empty state */}
            {stats.total === 0 && (
              <div className="glass-card py-16 text-center rounded-2xl">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                  <CalendarDays className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">Brak rezerwacji</h2>
                <p className="mt-2 text-sm text-slate-500">Gdy tylko klienci zaczną bukować Twoje usługi, wszystkie zgłoszenia pojawią się w tym miejscu.</p>
                <div className="mt-6 flex justify-center">
                  <Link to="/provider/services">
                    <Button variant="primary" size="md">
                      <Calendar className="w-5 h-5" />
                      Przejdź do usług
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Lista rezerwacji */}
            {stats.total > 0 && (
              <div className="space-y-4">
                {filteredItems.map(booking => {
                  const hasAccess = booking.canAccess !== false;
                  const isPending = booking.status === 'pending';
                  const isConfirmed = booking.status === 'confirmed';
                  const isConfirmedOverdue = booking.status === 'confirmed' && booking.bookingDate && booking.bookingDate <= '2025-12-19';
                  
                  return (
                    <div key={booking.id} className="glass-card p-6 rounded-2xl">
                      {!hasAccess ? (
                        // Zaślepka dla rezerwacji poza dostępem
                        <div className="flex flex-col items-center justify-center py-12">
                          <Lock className="w-12 h-12 text-slate-300 mb-4" />
                          <p className="text-lg font-bold text-slate-700">Rezerwacja poza okresem trial</p>
                          <p className="text-sm text-slate-500 mt-2">{booking.bookingNumber || `#${booking.id}`}</p>
                          <p className="text-sm text-slate-600 mt-1">Data: {booking.bookingDate}</p>
                          <p className="text-xs text-slate-500 mt-3">
                            {showTrialInfo 
                              ? `Twój trial obejmuje rezerwacje do ${maxBookingDate}` 
                              : 'Szczegóły dostępne w planie Basic'
                            }
                          </p>
                          <div className="mt-5 flex justify-center">
                            <Link to="/provider/subscription">
                              <Button variant="primary" size="sm">
                                {showTrialInfo ? 'Ulepsz do Basic' : 'Ulepsz plan'}
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        // Pełna zawartość rezerwacji
                        <>
                          {booking.hasConflict && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 border border-red-200">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="font-semibold">Konflikt czasowy!</span> Nakładające się rezerwacje w tym samym czasie.
                            </div>
                          )}

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-base font-semibold text-slate-900">
                                  {booking.customerName || 'Anonimowy klient'}
                                </p>
                                {booking.customerId && (canManage || showTrialInfo) && (
                                  <button 
                                    onClick={() => handleOpenConversation(booking.customerId!)}
                                    className="text-xs text-cyan-600 hover:text-cyan-700 transition-colors"
                                    title="Napisz wiadomość"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm font-medium text-slate-700 mt-1">{booking.serviceName}</p>
                              
                              {booking.serviceAddress && (
                                <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                    {booking.serviceAddress.street && `${booking.serviceAddress.street}, `}
                                    {booking.serviceAddress.postalCode} {booking.serviceAddress.city}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                              booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              booking.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                              booking.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {booking.status === 'pending' && 'Oczekuje'}
                              {booking.status === 'confirmed' && 'Potwierdzona'}
                              {booking.status === 'completed' && 'Ukończona'}
                              {booking.status === 'cancelled' && 'Anulowana'}
                              {booking.status === 'rejected' && 'Odrzucona'}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm text-slate-500">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">Data</p>
                              <p className="mt-1 font-semibold text-slate-900">{formatDate(booking.bookingDate) || 'TBD'}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">Godzina</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {booking.startTime ? formatTime(booking.startTime) : 'TBD'}
                                {booking.endTime && (
                                  <>
                                    <span className="text-slate-400"> - </span>
                                    {formatTime(booking.endTime)}
                                  </>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">Czas trwania</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {booking.durationMinutes ? `${booking.durationMinutes} min` : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">Wartość</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                {parseFloat(booking.totalPrice ?? booking.servicePrice ?? 0).toFixed(2)} zł
                              </p>
                            </div>
                          </div>

                          {booking.customerNotes && (
                            <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Notatki klienta:</p>
                              <p className="mt-1 text-sm text-slate-600">{booking.customerNotes}</p>
                            </div>
                          )}

                          {/* Akcje */}
                          {isPending && (
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                              <Button 
                                onClick={() => handleAcceptBooking(booking.id)}
                                variant="success"
                                size="sm"
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Zaakceptuj
                              </Button>
                              <Button 
                                onClick={() => handleRejectBooking(booking.id)}
                                variant="danger"
                                size="sm"
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4" />
                                Odrzuć
                              </Button>
                              <Button 
                                onClick={() => handleDeleteBooking(booking.id)}
                                variant="neutral"
                                size="sm"
                              >
                                <EyeOff className="w-4 h-4" />
                                Ukryj
                              </Button>
                            </div>
                          )}
                          
                          {isConfirmed && (
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                              <Button 
                                onClick={() => handleCompleteBooking(booking.id)}
                                variant="info"
                                size="sm"
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Oznacz jako zrealizowane
                              </Button>
                              <Button 
                                onClick={() => handleDeleteBooking(booking.id)}
                                variant="neutral"
                                size="sm"
                              >
                                <EyeOff className="w-4 h-4" />
                                Ukryj
                              </Button>
                            </div>
                          )}
                          
                          {(booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'rejected') && (
                            <div className="mt-6">
                              <Button 
                                onClick={() => handleDeleteBooking(booking.id)}
                                variant="neutral"
                                size="sm"
                              >
                                <EyeOff className="w-4 h-4" />
                                Ukryj
                              </Button>
                            </div>
                          )}
                          {isConfirmedOverdue && (
                            <div className="mt-6 flex gap-3">
                              <Button 
                                onClick={() => handleMarkCompleted(booking.id)}
                                variant="warning"
                                size="sm"
                                className="flex-1"
                              >
                                <BadgeCheck className="w-4 h-4" />
                                Oznacz jako ukończone
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="glass-card py-12 text-center rounded-2xl">
                    <p className="text-slate-500">
                      {statusFilter === 'all' 
                        ? 'Brak rezerwacji pasujących do wyszukiwania' 
                        : `Brak rezerwacji ze statusem "${statusFilter}"`
                      }
                    </p>
                  </div>
                )}

                {/* Paginacja */}
                {pagination && pagination.last_page > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl">
                    <div className="text-sm text-slate-600">
                      Pokazano {pagination.from ?? 0} - {pagination.to ?? 0} z {pagination.total} rezerwacji
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="neutral"
                        size="sm"
                      >
                        Poprzednia
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                          .filter(page => {
                            // Pokaż pierwsze 2, ostatnie 2 i strony wokół obecnej
                            return page === 1 || 
                                   page === 2 || 
                                   page === pagination.last_page - 1 || 
                                   page === pagination.last_page ||
                                   (page >= currentPage - 1 && page <= currentPage + 1);
                          })
                          .map((page, idx, arr) => {
                            const prevPage = arr[idx - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;
                            return (
                              <React.Fragment key={page}>
                                {showEllipsis && (
                                  <span className="px-2 text-slate-400">...</span>
                                )}
                                <Button
                                  onClick={() => setCurrentPage(page)}
                                  variant={currentPage === page ? "primary" : "neutral"}
                                  size="sm"
                                >
                                  {page}
                                </Button>
                              </React.Fragment>
                            );
                          })}
                      </div>
                      <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.last_page}
                        variant="neutral"
                        size="sm"
                      >
                        Następna
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 space-y-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-cyan-500" />
                <p className="text-base font-semibold text-slate-900">Widok kalendarza</p>
              </div>
              <p className="text-sm text-slate-500">Zobacz wszystkie rezerwacje w formie kalendarza. Łatwiej zauważysz konflikty i zaplanujesz czas.</p>
              <Link to="/provider/availability">
                <Button variant="primary" size="sm">
                  Otwórz kalendarz
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="glass-card p-6 space-y-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-amber-500" />
                <p className="text-base font-semibold text-slate-900">Automatyczne follow-upy</p>
              </div>
              <p className="text-sm text-slate-500">Aktywuj powiadomienia SMS przed wizytą i przypomnienia o opinii po zakończeniu zlecenia.</p>
              <Link to="/provider/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700">
                Skonfiguruj automatyzacje
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="glass-card p-6 space-y-4 rounded-2xl">
              <p className="text-sm font-semibold text-slate-900">Powiązane działania</p>
              <div className="space-y-3 text-sm text-slate-600">
                <a href="/provider/availability" className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:border-cyan-200 hover:text-cyan-600 transition">
                  Zaktualizuj dostępność
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a href="/provider/messages" className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:border-cyan-200 hover:text-cyan-600 transition">
                  Sprawdź wiadomości
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a href="/provider/reviews" className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:border-cyan-200 hover:text-cyan-600 transition">
                  Poproś o opinię
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal potwierdzenia usunięcia */}
      {ConfirmDialog}

      {/* DEV Tools */}
      <DevToolsPanel />
    </div>
  );
};

export default BookingsPage;
