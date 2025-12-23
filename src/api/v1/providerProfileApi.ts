import { apiClient } from '../client';
import {
  ProviderVerificationStatus,
  TrustScoreResponse,
  PaginatedResponse,
  PortfolioItemDto,
  CertificationDto,
  ProviderTodayMetrics,
  ServiceAreaDto,
} from '../../types/providerProfile';

/**
 * API client do profilu providera bez mocków
 */
export async function getProviderVerifications(providerId: number) {
  const { data } = await apiClient.get<{ data: ProviderVerificationStatus }>(
    `/providers/${providerId}/verification`
  );
  return data.data;
}

export async function getTrustScore(providerId: number) {
  const { data } = await apiClient.get<{ data: TrustScoreResponse }>(
    `/providers/${providerId}/trust-score`
  );
  return data.data;
}

export async function getPortfolio(
  providerId: number,
  params: { page?: number; per_page?: number; verified_only?: boolean } = {}
) {
  const { data } = await apiClient.get<PaginatedResponse<PortfolioItemDto>>(
    `/providers/${providerId}/portfolio`,
    { params }
  );
  return data;
}

export async function getCertifications(
  providerId: number,
  params: { page?: number; per_page?: number; verified_only?: boolean } = {}
) {
  const { data } = await apiClient.get<PaginatedResponse<CertificationDto>>(
    `/providers/${providerId}/certifications`,
    { params }
  );
  return data;
}

export async function getServiceAreas(
  providerId: number,
  params: { page?: number; per_page?: number } = {}
) {
  const { data } = await apiClient.get<PaginatedResponse<ServiceAreaDto>>(
    `/providers/${providerId}/service-areas`,
    { params }
  );
  return data;
}

export async function getTodayProviderMetrics(providerId: number) {
  const { data } = await apiClient.get<{ data: ProviderTodayMetrics }>(
    `/analytics/providers/${providerId}/today`
  );
  return data.data;
}
