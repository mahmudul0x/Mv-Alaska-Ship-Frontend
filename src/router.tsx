import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry 4xx (validation/not-found) — only transient 5xx/network
        // failures are worth a retry.
        retry: (failureCount, error) => {
          const status = (error as { status?: number }).status;
          return (status === undefined || status >= 500) && failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: false,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
