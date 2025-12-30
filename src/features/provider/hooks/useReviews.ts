import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

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
  const params: Record<string, string> = {};
  if (rating) {
    params.rating = String(rating);
  }
  if (page > 1) {
    params.page = String(page);
  }
  if (unanswered) {
    params.unanswered = '1';
  }

  const response = await apiClient.get<ReviewsResponse>('/provider/reviews', { params });
  return response.data;
};

export const useReviews = (rating: number | null, page = 1, unanswered = false) => {
  return useQuery<ReviewsResponse, Error>({
    queryKey: ['provider', 'reviews', rating ?? 'all', page, unanswered ? 'unanswered' : 'all'],
    queryFn: async () => {
      return fetchReviews({ rating, page, unanswered });
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
