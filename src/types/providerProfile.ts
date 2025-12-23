export interface ProviderVerificationStatus {
  identity: boolean;
  phone: boolean;
  email: boolean;
  bank_account: boolean;
}

export interface TrustScoreResponse {
  trust_score: number;
  is_verified: boolean;
}

export interface PortfolioItemDto {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  category: string | null;
  image_paths: string[];
  thumbnail_path: string | null;
  completed_at: string | null;
  project_value: number | null;
  duration_days: number | null;
  views: number;
  likes: number;
  is_verified: boolean;
  average_rating: number;
  comments_count: number;
}

export interface CertificationDto {
  id: number;
  uuid: string;
  name: string;
  issuer: string | null;
  credential_id: string | null;
  description: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  is_verified: boolean;
  credential_url: string | null;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ProviderTodayMetrics {
  bookings_completed: number;
  bookings_cancelled: number;
  cancellation_rate: number;
  avg_response_time_minutes: number;
  avg_rating: number;
  utilization_rate: number;
  total_revenue: number;
}

export interface ServiceAreaDto {
  id: number;
  uuid: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  radius_km: number | null;
  travel_fee_per_km: number | null;
  min_travel_fee: number | null;
  is_active: boolean;
  location_id: number | null;
}
