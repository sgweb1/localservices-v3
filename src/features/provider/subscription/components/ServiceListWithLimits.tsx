import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionTitle, Text } from '@/components/ui/typography';
import { HardLockOverlay } from './HardLockOverlay';
import { useSubscription } from '../hooks/useSubscription';
import {
  canAddService,
  getHiddenServicesCount,
  getLimitColor,
  getLimitMessage,
} from '../utils/hardLockUtils';

interface Service {
  id: number;
  name: string;
  description?: string;
  category?: string;
  status?: string;
}

interface ServiceListWithLimitsProps {
  services: Service[];
  onEditService?: (serviceId: number) => void;
  onDeleteService?: (serviceId: number) => void;
  onAddService?: () => void;
  onUpgrade?: () => void;
}

/**
 * Service list component ze HARD LOCK overlay dla ukrytych usług
 *
 * Flow:
 * 1. Wyświetla limit (np. "3 / 10 usług")
 * 2. Ukrywa usługi > limit z grey overlay
 * 3. Pokazuje liczę ukrytych usług (+3)
 * 4. Disable "Add service" button jeśli limit osiągnięty
 *
 * @since 2025-12-24
 */
export const ServiceListWithLimits: React.FC<ServiceListWithLimitsProps> = ({
  services,
  onEditService,
  onDeleteService,
  onAddService,
  onUpgrade,
}) => {
  const { limits } = useSubscription();

  if (!limits) return null;

  const visibleServices = services.slice(0, limits.max_services);
  const hiddenCount = getHiddenServicesCount(services.length, limits);
  const canAdd = canAddService(services.length, limits);
  const limitColor = getLimitColor(services.length, limits.max_services);
  const limitMessage = getLimitMessage(
    services.length,
    limits.max_services,
    'usług',
  );

  return (
    <div className="space-y-6">
      {/* Header + Limit Info */}
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle>Moje usługi</SectionTitle>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-sm font-semibold ${
                limitColor === 'red'
                  ? 'text-red-600 dark:text-red-400'
                  : limitColor === 'yellow'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
              }`}
            >
              {services.length} / {limits.max_services} usług
            </span>
            {services.length >= limits.max_services * 0.8 && (
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{limitMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Add Button */}
        <Button
          variant={canAdd ? 'primary' : 'disabled'}
          onClick={onAddService}
          disabled={!canAdd}
          title={
            !canAdd
              ? `Limit osiągnięty. Upgrade, aby dodać więcej usług.`
              : undefined
          }
        >
          + Nowa usługa
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Visible Services */}
        {visibleServices.map((service) => (
          <div
            key={service.id}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group relative"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {service.name}
                </h3>
                {service.category && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {service.category}
                  </p>
                )}
              </div>
              {service.status && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    service.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {service.status}
                </span>
              )}
            </div>

            {service.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {service.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditService?.(service.id)}
              >
                Edytuj
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 dark:text-red-400"
                onClick={() => onDeleteService?.(service.id)}
              >
                Usuń
              </Button>
            </div>
          </div>
        ))}

        {/* Hidden Services Overlay */}
        {hiddenCount > 0 &&
          services.slice(limits.max_services).map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 group relative overflow-hidden"
            >
              {/* Locked Content (behind overlay) */}
              <div className="blur-sm pointer-events-none">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {service.name}
                </h3>
                {service.category && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {service.category}
                  </p>
                )}
              </div>

              {/* Overlay */}
              <HardLockOverlay
                itemType="service"
                hiddenCount={hiddenCount}
                planName="PRO"
                onUpgrade={onUpgrade}
              />
            </div>
          ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <Text className="text-slate-600 dark:text-slate-400">
            Nie masz jeszcze żadnych usług
          </Text>
          <Button
            variant="primary"
            onClick={onAddService}
            className="mt-4"
          >
            Dodaj pierwszą usługę
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceListWithLimits;
