import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

type TimePeriod = '7d' | '30d' | '90d' | 'year';

export interface AnalyticsMetric {
  value: number;
  change: number;
}

export interface AnalyticsTopService {
  name: string;
  views: number;
  bookings: number;
  conversion: number;
}

export interface AnalyticsTrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface AnalyticsResponseTime {
  minutes: number;
  industry_average: number;
  comparison: number;
}

export interface AnalyticsRating {
  average: number;
  count: number;
}

export interface AnalyticsChartDataPoint {
  date: string;
  views: number;
}

export interface AnalyticsResponse {
  metrics: {
    profile_views: AnalyticsMetric;
    inquiries: AnalyticsMetric;
    bookings: AnalyticsMetric;
    conversion: AnalyticsMetric;
  };
  top_services: AnalyticsTopService[];
  traffic_sources: AnalyticsTrafficSource[];
  response_time: AnalyticsResponseTime;
  rating: AnalyticsRating;
  chart_data: AnalyticsChartDataPoint[];
  insights: string[];
}

const fetchAnalytics = async (period: TimePeriod): Promise<AnalyticsResponse> => {
  const url = `${API_BASE_URL}/api/v1/provider/analytics?period=${period}`;

  const res = await fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

export const useAnalytics = (period: TimePeriod = '30d') => {
  return useQuery<AnalyticsResponse, Error>({
    queryKey: ['provider', 'analytics', period],
    queryFn: () => fetchAnalytics(period),
    staleTime: 60_000, // 1 minuta
    refetchOnWindowFocus: false,
  });
};
