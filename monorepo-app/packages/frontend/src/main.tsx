import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // Auto-generated!
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/UI/themes/theme';


const router = createRouter({ routeTree })

// Register the router for type-safety across your app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />

    </ThemeProvider>
  </StrictMode>
)