"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { LoadingScreen } from "../components/loading-screen";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 1000, // 10s - consider data fresh
            gcTime: 5 * 60 * 1000, // 5min - keep in cache
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1,
          },
        },
      }),
  );

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Mark app as ready after initial mount
    setIsAppReady(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        {!isAppReady && <LoadingScreen key="loading" />}
      </AnimatePresence>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
