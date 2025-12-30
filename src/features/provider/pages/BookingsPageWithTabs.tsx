import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/ui/typography';
import { getBookings } from '@/api/v1/bookingApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { User, Briefcase, Calendar, MapPin, CheckCircle } from 'lucide-react';
import BookingsPage from './BookingsPage';

/**
 * Wrapper dla BookingsPage z zakładkami dual-role
 * 
 * Provider widzi:
 * 1. "Zlecenia" - zlecenia gdzie świadczy usługi (provider_id)
 * 2. "Moje rezerwacje" - rezerwacje gdzie jest klientem (customer_id)
 */
export const BookingsPageWithTabs: React.FC = () => {
  const { user } = useAuth();

  // Moje rezerwacje (jako customer)
  const { data: myBookingsData, isLoading: isLoadingMyBookings } = useQuery({
    queryKey: ['bookings', 'my', user?.id],
    queryFn: () => getBookings({ customer_id: user?.id }),
    enabled: !!user && user.user_type === 'provider',
  });

  const myBookings = myBookingsData?.data || [];

  //  Format helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  const formatServiceAddress = (value: any) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const { street, postalCode, city } = value as { street?: string; postalCode?: string; city?: string };
      const cityLine = [postalCode, city].filter(Boolean).join(' ').trim();
      return [street, cityLine].filter(Boolean).join(', ');
    }
    return '';
  };

  // Customer (nie provider) - pokazuj tylko moje rezerwacje bez zakładek
  if (user?.user_type !== 'provider') {
    return (
      <div className="space-y-6">
        <PageTitle gradient>Moje rezerwacje</PageTitle>
        <CustomerBookingsContent
          bookings={myBookings}
          isLoading={isLoadingMyBookings}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      </div>
    );
  }

  // Provider - pokazuj zakładki
  return (
    <div className="space-y-6">
      <PageTitle gradient>Rezerwacje</PageTitle>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Zlecenia
          </TabsTrigger>
          <TabsTrigger value="my" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Moje rezerwacje ({myBookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Zakładka: Zlecenia (jako provider) */}
        <TabsContent value="incoming" className="mt-6">
          <BookingsPage />
        </TabsContent>

        {/* Zakładka: Moje rezerwacje (jako customer) */}
        <TabsContent value="my" className="mt-6">
          <CustomerBookingsContent
            bookings={myBookings}
            isLoading={isLoadingMyBookings}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Komponent listy rezerwacji jako customer
 */
interface CustomerBookingsContentProps {
  bookings: any[];
  isLoading: boolean;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
}

const CustomerBookingsContent: React.FC<CustomerBookingsContentProps> = ({
  bookings,
  isLoading,
  formatDate,
  formatTime,
}) => {
  if (isLoading) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center">
        <div className="animate-spin mx-auto w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-slate-600">Ładowanie rezerwacji...</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="glass-card py-16 text-center rounded-2xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
          <Calendar className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Brak rezerwacji</h2>
        <p className="mt-2 text-sm text-slate-500">
          Nie masz jeszcze żadnych rezerwacji jako klient. Znajdź usługę i zarezerwuj!
        </p>
        <div className="mt-6 flex justify-center">
          <a 
            href="/szukaj" 
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Calendar className="w-5 h-5" />
            Szukaj usług
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <p className="text-base font-semibold text-slate-900">
                {booking.service?.name || 'Usługa'}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Provider: {booking.provider?.name || 'Nieznany'}
              </p>
              {formatServiceAddress(booking.service_address || (booking as any).serviceAddress) && (
                <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{formatServiceAddress(booking.service_address || (booking as any).serviceAddress)}</span>
                </div>
              )}
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${
              booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
              booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              booking.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
              booking.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
              'bg-slate-100 text-slate-700'
            }`}>
              {booking.status === 'pending' && 'Oczekuje'}
              {booking.status === 'confirmed' && 'Potwierdzona'}
              {booking.status === 'in_progress' && 'W trakcie'}
              {booking.status === 'completed' && 'Ukończona'}
              {booking.status === 'cancelled' && 'Anulowana'}
              {booking.status === 'no_show' && 'Niestawienie'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-500">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Data</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(booking.booking_date)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Godzina</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatTime(booking.start_time)}
                {booking.end_time && (
                  <>
                    <span className="text-slate-400"> - </span>
                    {formatTime(booking.end_time)}
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Czas trwania</p>
              <p className="mt-1 font-semibold text-slate-900">
                {booking.duration_minutes ? `${booking.duration_minutes} min` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Wartość</p>
              <p className="mt-1 font-semibold text-slate-900">
                {booking.total_price?.toFixed(2) || '0.00'} zł
              </p>
            </div>
          </div>

          {booking.customer_notes && (
            <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900 px-4 py-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Twoje notatki:
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{booking.customer_notes}</p>
            </div>
          )}

          {booking.status === 'confirmed' && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4" />
              <span>Rezerwacja potwierdzona - oczekiwanie na realizację</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingsPageWithTabs;
