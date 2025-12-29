import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography';

interface HardLockOverlayProps {
  itemType: 'service' | 'photo' | 'feature';
  hiddenCount?: number;
  planName?: string;
  onUpgrade?: () => void;
}

/**
 * Overlay dla ukrytych elementów (HARD LOCK)
 *
 * Wyświetlany na:
 * - Ukrytych usługach (>limit)
 * - Ukrytych zdjęciach (>limit)
 * - Niedostępnych feature'ach
 *
 * @since 2025-12-24
 */
export const HardLockOverlay: React.FC<HardLockOverlayProps> = ({
  itemType,
  hiddenCount,
  planName,
  onUpgrade,
}) => {
  const messages = {
    service: 'Musisz mieć wyższy plan, aby dodać więcej usług',
    photo: 'Limit zdjęć osiągnięty. Upgrade, aby dodać więcej',
    feature: 'Ta funkcja nie jest dostępna w Twoim planie',
  };

  const message = messages[itemType];

  return (
    <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20 group-hover:bg-black/70 dark:group-hover:bg-black/80 transition">
      {/* Lock Icon */}
      <div className="bg-white/10 dark:bg-white/5 rounded-full p-4 mb-4">
        <Lock className="w-8 h-8 text-white" />
      </div>

      {/* Hidden Count Badge */}
      {hiddenCount && hiddenCount > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          +{hiddenCount}
        </div>
      )}

      {/* Message */}
      <Text className="text-white text-center text-sm font-semibold mb-3 px-3">
        {message}
      </Text>

      {/* Plan Info */}
      {planName && (
        <Text muted className="text-white/70 text-xs mb-3">
          Dostępne w planie {planName} i wyższych
        </Text>
      )}

      {/* Upgrade Button */}
      {onUpgrade && (
        <Button
          size="sm"
          variant="primary"
          onClick={onUpgrade}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        >
          <Zap className="w-4 h-4" />
          Upgrade Plan
        </Button>
      )}
    </div>
  );
};

export default HardLockOverlay;
