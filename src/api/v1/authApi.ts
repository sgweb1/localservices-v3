import { apiClient } from '../client';
import axios from 'axios';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type: 'customer' | 'provider';
};

export async function csrf() {
  // Użyj bezwzględnego endpointu Sanctum poza baseURL /api/v1
  await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

export async function register(payload: RegisterPayload) {
  await csrf();
  const { data } = await apiClient.post('/register', payload, { withCredentials: true });
  return data;
}

export async function login(email: string, password: string, remember = false) {
  await csrf();
  const { data } = await apiClient.post(
    '/login',
    { email, password, remember },
    { withCredentials: true }
  );
  return data;
}

export async function logout() {
  const { data } = await apiClient.post('/logout', {}, { withCredentials: true });
  return data;
}

export async function currentUser() {
  try {
    const { data } = await apiClient.get('/user', { withCredentials: true });
    return data.user;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      // Brak sesji – traktuj jako niezalogowany
      return null;
    }
    throw error;
  }
}
