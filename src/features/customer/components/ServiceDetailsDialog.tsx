import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Shield, Zap, Phone, Mail, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Service } from '../../../types/service';
import { useAuth } from '../../auth/hooks/useAuth';
import { createBooking } from '../../../api/v1/bookingApi';
import { toast } from 'sonner';

interface ServiceDetailsDialogProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}

export const ServiceDetailsDialog: React.FC<ServiceDetailsDialogProps> = ({
  service,
  open,
  onClose,
}) => {
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);

  if (!service) return null;

  const handleBooking = async () => {
    if (!user) {
      toast.error('Musisz być zalogowany aby dokonać rezerwacji');
      return;
    }

    if (!service.provider?.id) {
      toast.error('Brak danych providera');
      return;
    }

    // Blokada self-booking (provider nie może rezerwować swoich usług)
    if (service.provider.id === user.id) {
      toast.error('Nie możesz rezerwować własnych usług');
      return;
    }

    setIsBooking(true);

    try {
      // Toast dla providera rezerwującego jako klient
      if (user.user_type === 'provider') {
        toast.info('Rezerwujesz jako klient', {
          description: 'Twoja rezerwacja zostanie dodana do zakładki "Moje rezerwacje"',
          duration: 4000,
        });
      }

      // Testowa rezerwacja - w przyszłości to będzie formularz z wyborem daty
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const bookingDate = tomorrow.toISOString().split('T')[0];

      await createBooking({
        provider_id: service.provider.id,
        service_id: service.id,
        booking_date: bookingDate,
        start_time: '10:00',
        duration_minutes: 60,
        service_address: service.city || 'Adres do ustalenia',
        customer_notes: 'Rezerwacja utworzona przez system',
      });

      toast.success('Rezerwacja utworzona!', {
        description: 'Provider został powiadomiony o Twojej rezerwacji',
      });
      onClose();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error('Błąd rezerwacji', {
        description: error.response?.data?.message || 'Nie udało się utworzyć rezerwacji',
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-archivo">
            {service.name || 'Szczegóły usługi'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {service.category?.name && (
              <Badge variant="neutral" className="mr-2">
                {service.category.name}
              </Badge>
            )}
            {service.city && (
              <span className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {service.city}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Info */}
          {service.provider && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {service.provider.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {service.provider.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {service.provider.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({service.provider.reviews_count} {service.provider.reviews_count === 1 ? 'opinia' : 'opinii'})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Opis usługi
            </h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {service.description || 'Brak opisu dla tej usługi.'}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cena bazowa</div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {service.base_price} zł
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Badge dla providera rezerwującego jako klient */}
              {user?.user_type === 'provider' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                    Tryb klienta
                  </span>
                </div>
              )}
              <Button 
                size="lg" 
                className="gap-2"
                onClick={handleBooking}
                disabled={isBooking || !user}
              >
                <Calendar className="w-5 h-5" />
                {isBooking ? 'Rezerwuję...' : 'Umów wizytę'}
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Trust Score</div>
                <div className="font-semibold text-gray-900 dark:text-white">85%</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Czas odpowiedzi</div>
                <div className="font-semibold text-gray-900 dark:text-white">~ 2 godz.</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="primary" className="flex-1 gap-2">
              <Phone className="w-4 h-4" />
              Zadzwoń
            </Button>
            <Button variant="secondary" className="flex-1 gap-2">
              <Mail className="w-4 h-4" />
              Wyślij wiadomość
            </Button>
            <Button variant="outline" className="gap-2">
              Dodaj do ulubionych
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
