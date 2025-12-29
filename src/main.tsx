import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { JournalPage } from '@/pages/JournalPage'
import { RiskLabPage } from '@/pages/RiskLabPage'
import { StrategiesPage } from '@/pages/StrategiesPage'
import { SimulatorPage } from '@/pages/SimulatorPage'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/journal",
    element: <JournalPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/risk",
    element: <RiskLabPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/simulator",
    element: <SimulatorPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/strategies",
    element: <StrategiesPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)