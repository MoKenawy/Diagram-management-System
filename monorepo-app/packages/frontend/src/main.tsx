import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // Auto-generated!
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/themes/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 


// Create a client
const queryClient = new QueryClient();

const router = createRouter({ routeTree })

// Register the router for type-safety across your app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
   </QueryClientProvider>
  </StrictMode>
)