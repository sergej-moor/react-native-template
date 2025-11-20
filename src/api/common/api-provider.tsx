import { useReactQueryDevTools } from '@dev-plugins/react-query';
import NetInfo from '@react-native-community/netinfo';
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { type ReactNode } from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With 'offlineFirst', queries will try to fetch from cache if offline,
      // or make a request if online. If offline and no cache, it throws.
      networkMode: 'offlineFirst',
    },
    mutations: {
      // We use standard 'online' mode (default) for mutations.
      // If offline, the mutation will be PAUSED (queued) and retried when online.
      // 'onMutate' will still run immediately, giving us Optimistic UI.
      // If we used 'offlineFirst', it would try to execute, fail, and rollback.
      networkMode: 'online',
    },
  },
});

// Configure React Query to use NetInfo for online status
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  }),
);

export function APIProvider({ children }: Readonly<{ children: ReactNode }>) {
  useReactQueryDevTools(queryClient);
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
