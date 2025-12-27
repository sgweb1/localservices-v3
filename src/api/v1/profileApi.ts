import { apiClient } from '../client';
import {
  User,
  ProfileUpdateRequest,
  UpdatePasswordRequest,
  ApiResponse,
  ApiError,
} from '../../types/profile';
import { AxiosError } from 'axios';

/**
 * API calls dla Profile endpoints v1
 * 
 * Wszystkie funkcje zwracają Promise z typed response lub rzucają ApiError
 */

/**
 * Aktualizuj profil użytkownika
 */
export async function updateProfile(
  data: ProfileUpdateRequest
): Promise<ApiResponse<User>> {
  try {
    const response = await apiClient.patch<ApiResponse<User>>('/profile', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Upload avatara użytkownika
 */
export async function uploadAvatar(file: File): Promise<ApiResponse<User>> {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<User>>(
      '/profile/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Usuń avatar użytkownika
 */
export async function deleteAvatar(): Promise<ApiResponse<User>> {
  try {
    const response = await apiClient.delete<ApiResponse<User>>('/profile/avatar');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Upload logo providera
 */
export async function uploadLogo(file: File): Promise<ApiResponse<User>> {
  try {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post<ApiResponse<User>>(
      '/provider/logo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Zmień hasło użytkownika
 */
export async function updatePassword(
  data: UpdatePasswordRequest
): Promise<ApiResponse<void>> {
  try {
    const response = await apiClient.put<ApiResponse<void>>(
      '/profile/password',
      data
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Handle axios error i konwertuj na ApiError
 */
function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    const errors = error.response?.data?.errors;

    return {
      message,
      status,
      errors,
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}
