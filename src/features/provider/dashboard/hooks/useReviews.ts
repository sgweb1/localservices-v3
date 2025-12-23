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
  response?: {
    id: number;
    response: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface ReviewsResponse {
  data: Review[];
  averageRating: number;
  totalReviews: number;
  distribution?: Record<string, number>;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

type ReviewsParams = {
  rating?: number | null;
  page?: number;
  unanswered?: boolean;
};

const fetchReviews = async ({ rating, page = 1, unanswered = false }: ReviewsParams): Promise<ReviewsResponse> => {
  const search = new URLSearchParams();
  if (rating) {
    search.set('rating', String(rating));
  }
  if (page > 1) {
    search.set('page', String(page));
  }
  if (unanswered) {
    search.set('unanswered', '1');
  }

  const url = `${API_BASE_URL}/api/v1/provider/reviews${search.toString() ? `?${search.toString()}` : ''}`;

  const res = await fetch(url, {
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

export const useReviews = (rating: number | null, page = 1, unanswered = false) => {
  return useQuery<ReviewsResponse, Error>({
    queryKey: ['provider', 'reviews', rating ?? 'all', page, unanswered ? 'unanswered' : 'all'],
    queryFn: async () => {
      // Wymuszenie mock przez ?mock=1
      if (isMockMode()) {
        return MOCK_SUBPAGES.reviews;
      }
      return fetchReviews({ rating, page, unanswered });
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
