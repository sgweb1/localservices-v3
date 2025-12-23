/**
 * TypeScript types dla Profile API
 * 
 * Mirror backend models i API responses
 */

export enum UserType {
  Customer = 'customer',
  Provider = 'provider',
}

export interface User {
  id: number;
  uuid?: string;
  name: string;
  email: string;
  phone?: string | null;
  user_type: UserType;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  profile: UserProfile | null;
  provider_profile?: ProviderProfile | null;
  customer_profile?: CustomerProfile | null;
}

export interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  languages?: string[];
  profile_completion_percentage: number;
}

export interface ProviderProfile {
  business_name: string;
  service_description?: string | null;
  trust_score: number;
  verification_level: number;
  website_url?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
  };
  logo?: string | null;
  years_experience?: number | null;
}

export interface CustomerProfile {
  preferred_language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  reliability_score: number;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  first_name?: string;
  last_name?: string;
  preferred_language?: string;
  // Provider-specific
  business_name?: string;
  service_description?: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ApiResponse<T> {
  message: string;
  user?: T;
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
