import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // Auto-generated!
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/themes/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { setupInterceptors } from '@/api/interceptors';
import { initSentry } from '@/monitoring/sentry';
import * as Sentry from '@sentry/react';


initSentry();


// Create a client
const queryClient = new QueryClient();

const router = createRouter({ routeTree })

// Initialize HTTP axios interceptors
setupInterceptors();




// Register the router for type-safety across your app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>}>
    <QueryClientProvider client={queryClient}>

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
   </QueryClientProvider>
  </Sentry.ErrorBoundary>
  </StrictMode>

)