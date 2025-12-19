import { useQuery } from '@tanstack/react-query';
import { isMockMode } from '@/utils/mockMode';
import { MOCK_SUBPAGES } from '../mocks/subpages';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ReviewsResponse {
  data: Review[];
  averageRating: number;
  totalReviews: number;
}

const fetchReviews = async (): Promise<ReviewsResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/provider/reviews`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // W DEV przy 401/404/5xx fallback do mock
    if (import.meta.env.DEV && (res.status === 401 || res.status === 404 || res.status >= 500)) {
      return MOCK_SUBPAGES.reviews;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

export const useReviews = () => {
  return useQuery<ReviewsResponse, Error>({
    queryKey: ['provider', 'reviews'],
    queryFn: async () => {
      // Wymuszenie mock przez ?mock=1
      if (isMockMode()) {
        return MOCK_SUBPAGES.reviews;
      }
      return fetchReviews();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
