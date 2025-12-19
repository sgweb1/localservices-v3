import React from 'react';
import { X, Star, MapPin, Clock, Shield, Zap, Phone, Mail, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Service } from '../../../types/service';

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
  if (!service) return null;

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
            <Button size="lg" className="gap-2">
              <Calendar className="w-5 h-5" />
              Umów wizytę
            </Button>
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
