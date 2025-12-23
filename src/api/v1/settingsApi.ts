import { apiClient } from '../client';

/**
 * API dla ustawień providera
 * Endpoint: /api/v1/provider/settings
 */

export interface SettingsData {
  business: {
    name: string;
    short_description: string | null;
    bio: string | null;
    logo: string | null;
    video_url: string | null;
    website: string | null;
    social_media: {
      facebook?: string | null;
      instagram?: string | null;
      linkedin?: string | null;
      tiktok?: string | null;
    };
  };
  notifications: {
    email: {
      new_booking: boolean;
      booking_cancelled: boolean;
      new_message: boolean;
      new_review: boolean;
    };
    push: {
      new_booking: boolean;
      new_message: boolean;
      new_review: boolean;
    };
  };
  security: {
    two_factor_enabled: boolean;
    email: string;
    email_verified: boolean;
  };
}

export interface SettingsResponse {
  success: boolean;
  data: SettingsData;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface LogoUploadResponse {
  success: boolean;
  message: string;
  data: {
    logo_url: string;
  };
}

/**
 * Pobierz wszystkie ustawienia providera
 */
export async function getSettings(): Promise<SettingsResponse> {
  const response = await apiClient.get<SettingsResponse>('/provider/settings');
  return response.data;
}

/**
 * Aktualizuj profil biznesu
 */
export async function updateBusiness(
  data: Partial<SettingsData['business']>
): Promise<MessageResponse> {
  const response = await apiClient.put<MessageResponse>('/provider/settings/business', data);
  return response.data;
}

/**
 * Upload logo providera
 */
export async function uploadLogo(file: File): Promise<LogoUploadResponse> {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await apiClient.post<LogoUploadResponse>('/provider/settings/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

/**
 * Aktualizuj preferencje powiadomień
 */
export async function updateNotifications(
  notifications: SettingsData['notifications']
): Promise<MessageResponse> {
  const response = await apiClient.put<MessageResponse>(
    '/provider/settings/notifications',
    notifications
  );
  return response.data;
}

/**
 * Zmień hasło użytkownika
 */
export async function updatePassword(data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<MessageResponse> {
  const response = await apiClient.put<MessageResponse>('/provider/settings/password', data);
  return response.data;
}
