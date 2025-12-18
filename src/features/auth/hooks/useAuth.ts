import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { currentUser, login, logout, register, type RegisterPayload } from '../../../api/v1/authApi';

export function useAuth() {
  const qc = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: currentUser,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password, remember }: { email: string; password: string; remember?: boolean }) =>
      login(email, password, !!remember),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      // Natychmiast wyczyść cache, żeby UI od razu pokazał wylogowanie
      qc.setQueryData(['auth', 'user'], null);
      await qc.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  return {
    user: userQuery.data,
    isLoadingUser: userQuery.isLoading,
    userError: userQuery.error as any,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
