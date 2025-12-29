import { describe, it, expect } from 'vitest';
import {
  canAddService,
  canAddPhotoToService,
  canAddPortfolioPhoto,
  getHiddenServicesCount,
  getHiddenPhotosPerService,
  getHiddenPortfolioPhotos,
  getVisibleServices,
  getVisiblePhotosForService,
  getVisiblePortfolioPhotos,
  isFeatureAvailable,
  getLimitText,
  isNearLimit,
  getLimitColor,
  getLimitMessage,
} from '@/features/provider/subscription/utils/hardLockUtils';

describe('hardLockUtils', () => {
  const mockLimits = {
    max_services: 10,
    max_photos_per_service: 5,
    max_portfolio_photos: 20,
    has_calendar: true,
    has_subdomain: false,
    has_promotional_video: true,
    analytics_level: 'basic',
  };

  // ===== canAddService tests =====
  describe('canAddService', () => {
    it('should allow adding service when under limit', () => {
      expect(canAddService(5, mockLimits)).toBe(true);
    });

    it('should prevent adding service when at limit', () => {
      expect(canAddService(10, mockLimits)).toBe(false);
    });

    it('should prevent adding service when over limit', () => {
      expect(canAddService(15, mockLimits)).toBe(false);
    });

    it('should allow adding first service', () => {
      expect(canAddService(0, mockLimits)).toBe(true);
    });
  });

  // ===== canAddPhotoToService tests =====
  describe('canAddPhotoToService', () => {
    it('should allow adding photo when under limit', () => {
      expect(canAddPhotoToService(3, mockLimits)).toBe(true);
    });

    it('should prevent adding photo when at limit', () => {
      expect(canAddPhotoToService(5, mockLimits)).toBe(false);
    });

    it('should prevent adding photo when over limit', () => {
      expect(canAddPhotoToService(10, mockLimits)).toBe(false);
    });
  });

  // ===== canAddPortfolioPhoto tests =====
  describe('canAddPortfolioPhoto', () => {
    it('should allow adding portfolio photo when under limit', () => {
      expect(canAddPortfolioPhoto(10, mockLimits)).toBe(true);
    });

    it('should prevent adding portfolio photo when at limit', () => {
      expect(canAddPortfolioPhoto(20, mockLimits)).toBe(false);
    });

    it('should allow multiple additions up to limit', () => {
      expect(canAddPortfolioPhoto(0, mockLimits)).toBe(true);
      expect(canAddPortfolioPhoto(19, mockLimits)).toBe(true);
      expect(canAddPortfolioPhoto(20, mockLimits)).toBe(false);
    });
  });

  // ===== Hidden count tests =====
  describe('Hidden count functions', () => {
    it('getHiddenServicesCount should return 0 when under limit', () => {
      expect(getHiddenServicesCount(5, mockLimits)).toBe(0);
    });

    it('getHiddenServicesCount should return correct count when over limit', () => {
      expect(getHiddenServicesCount(15, mockLimits)).toBe(5);
    });

    it('getHiddenServicesCount should return 0 at exact limit', () => {
      expect(getHiddenServicesCount(10, mockLimits)).toBe(0);
    });

    it('getHiddenPhotosPerService should calculate correctly', () => {
      expect(getHiddenPhotosPerService(8, mockLimits)).toBe(3);
    });

    it('getHiddenPortfolioPhotos should calculate correctly', () => {
      expect(getHiddenPortfolioPhotos(25, mockLimits)).toBe(5);
    });
  });

  // ===== getVisible* tests =====
  describe('Visible filtering functions', () => {
    const mockServices = [
      { id: 1, name: 'Service 1' },
      { id: 2, name: 'Service 2' },
      { id: 3, name: 'Service 3' },
      { id: 4, name: 'Service 4' },
      { id: 5, name: 'Service 5' },
    ];

    const mockPhotos = [
      { id: 1, url: 'photo1.jpg' },
      { id: 2, url: 'photo2.jpg' },
      { id: 3, url: 'photo3.jpg' },
      { id: 4, url: 'photo4.jpg' },
      { id: 5, url: 'photo5.jpg' },
    ];

    it('getVisibleServices should return all when under limit', () => {
      const limits = { ...mockLimits, max_services: 10 };
      const visible = getVisibleServices(mockServices, limits);
      expect(visible).toHaveLength(5);
    });

    it('getVisibleServices should slice at limit', () => {
      const limits = { ...mockLimits, max_services: 3 };
      const visible = getVisibleServices(mockServices, limits);
      expect(visible).toHaveLength(3);
      expect(visible[0].id).toBe(1);
      expect(visible[2].id).toBe(3);
    });

    it('getVisiblePhotosForService should slice correctly', () => {
      const limits = { ...mockLimits, max_photos_per_service: 2 };
      const visible = getVisiblePhotosForService(mockPhotos, limits);
      expect(visible).toHaveLength(2);
    });

    it('getVisiblePortfolioPhotos should slice correctly', () => {
      const limits = { ...mockLimits, max_portfolio_photos: 4 };
      const visible = getVisiblePortfolioPhotos(mockPhotos, limits);
      expect(visible).toHaveLength(4);
    });
  });

  // ===== isFeatureAvailable tests =====
  describe('isFeatureAvailable', () => {
    it('should return true for available feature', () => {
      expect(isFeatureAvailable('calendar', mockLimits)).toBe(true);
      expect(isFeatureAvailable('promotional_video', mockLimits)).toBe(true);
    });

    it('should return false for unavailable feature', () => {
      expect(isFeatureAvailable('subdomain', mockLimits)).toBe(false);
    });

    it('should return true for advanced analytics if available', () => {
      const advancedLimits = { ...mockLimits, analytics_level: 'advanced' };
      expect(isFeatureAvailable('advanced_analytics', advancedLimits)).toBe(true);
    });

    it('should return false for advanced analytics if not available', () => {
      const basicLimits = { ...mockLimits, analytics_level: 'basic' };
      expect(isFeatureAvailable('advanced_analytics', basicLimits)).toBe(false);
    });
  });

  // ===== getLimitText tests =====
  describe('getLimitText', () => {
    it('should format limit text correctly', () => {
      expect(getLimitText(3, 10)).toBe('3 / 10');
    });

    it('should handle zero values', () => {
      expect(getLimitText(0, 5)).toBe('0 / 5');
    });

    it('should handle at limit', () => {
      expect(getLimitText(10, 10)).toBe('10 / 10');
    });
  });

  // ===== isNearLimit tests =====
  describe('isNearLimit', () => {
    it('should return true when at 80% capacity', () => {
      expect(isNearLimit(8, 10)).toBe(true);
    });

    it('should return true when over 80%', () => {
      expect(isNearLimit(9, 10)).toBe(true);
    });

    it('should return false when under 80%', () => {
      expect(isNearLimit(7, 10)).toBe(false);
    });

    it('should return true when at limit', () => {
      expect(isNearLimit(10, 10)).toBe(true);
    });
  });

  // ===== getLimitColor tests =====
  describe('getLimitColor', () => {
    it('should return green when under 80%', () => {
      expect(getLimitColor(5, 10)).toBe('green');
    });

    it('should return yellow when between 80-99%', () => {
      expect(getLimitColor(8, 10)).toBe('yellow');
      expect(getLimitColor(9, 10)).toBe('yellow');
    });

    it('should return red when at or over 100%', () => {
      expect(getLimitColor(10, 10)).toBe('red');
      expect(getLimitColor(11, 10)).toBe('red');
    });
  });

  // ===== getLimitMessage tests =====
  describe('getLimitMessage', () => {
    it('should return available message when under limit', () => {
      const msg = getLimitMessage(3, 10, 'usług');
      expect(msg).toContain('Jeszcze 7 usług');
    });

    it('should return warning message at 80%', () => {
      const msg = getLimitMessage(8, 10, 'zdjęć');
      expect(msg).toContain('Limit');
    });

    it('should return limit reached message at 100%', () => {
      const msg = getLimitMessage(10, 10, 'usług');
      expect(msg).toContain('Limit osiągnięty');
    });
  });

  // ===== Integration tests =====
  describe('Integration scenarios', () => {
    it('should handle FREE plan correctly', () => {
      const freeLimits = {
        max_services: 1,
        max_photos_per_service: 3,
        max_portfolio_photos: 10,
      };

      expect(canAddService(1, freeLimits)).toBe(false);
      expect(canAddPhotoToService(3, freeLimits)).toBe(false);
      expect(canAddPortfolioPhoto(10, freeLimits)).toBe(false);
    });

    it('should handle PREMIUM plan correctly', () => {
      const premiumLimits = {
        max_services: 50,
        max_photos_per_service: 50,
        max_portfolio_photos: 100,
      };

      expect(canAddService(49, premiumLimits)).toBe(true);
      expect(canAddPhotoToService(49, premiumLimits)).toBe(true);
      expect(canAddPortfolioPhoto(99, premiumLimits)).toBe(true);
    });

    it('should handle downgrade scenario', () => {
      // User has 5 services but downgrades from PREMIUM (50) to BASIC (3)
      const basicLimits = { ...mockLimits, max_services: 3 };

      expect(getHiddenServicesCount(5, basicLimits)).toBe(2);
      expect(canAddService(5, basicLimits)).toBe(false);
    });
  });
});
