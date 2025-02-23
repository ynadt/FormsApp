import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { toast } from 'react-toastify';

const GlobalQueryClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);
  const authErrorHandled = useRef(false);

  const currentUser = useAuthStore((state) => state.user);
  useEffect(() => {
    if (currentUser) {
      authErrorHandled.current = false;
    }
  }, [currentUser]);

  const handleAuthError = (msg: string) => {
    if (!authErrorHandled.current) {
      authErrorHandled.current = true;
      toast.error(msg);
      clearUser();
      navigate('/auth');
    }
  };

  const queryClient = React.useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          onError: (error: Error) => {
            const msg = error.message || 'An error occurred';
            if (
              msg.includes('Unauthorized') ||
              msg.includes('Not authorized') ||
              msg.includes('User is blocked') ||
              msg.includes('Admin access required') ||
              msg.includes('Session expired')
            ) {
              handleAuthError(msg);
            } else {
              toast.error(msg);
            }
          },
        },
      },
    });
  }, [clearUser, navigate]);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if ('query' in event && event.query.state.error) {
        const error = event.query.state.error as Error;
        const msg = error.message || 'An error occurred';
        if (
          msg.includes('Unauthorized') ||
          msg.includes('Not authorized') ||
          msg.includes('User is blocked') ||
          msg.includes('Admin access required') ||
          msg.includes('Session expired')
        ) {
          handleAuthError(msg);
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient, clearUser, navigate]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default GlobalQueryClientProvider;
