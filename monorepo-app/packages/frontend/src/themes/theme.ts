

// ================= THEME CONFIG =================
// Create a reusable MUI theme for the whole app
// src/theme/index.ts

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0059bb',
      light: '#2455bf',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a5d6a7',
    },
    background: {
      default: '#f9f9ff',
      paper: 'rgba(255,255,255,0.9)',
    },
    text: {
      primary: '#1b5e20',
      secondary: '#4e6e58',
    },
    success: {
      main: '#0059bb',
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: `'Inter', 'Roboto', sans-serif`,
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingTop: 10,
          paddingBottom: 10,
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #0059bb, #2455bf)',
          boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
          '&:hover': {
            background: 'linear-gradient(90deg, #1b5e20, #4caf50)',
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          color: '#0059bb',
          fontWeight: 500,
        },
      },
    },
  },
});

