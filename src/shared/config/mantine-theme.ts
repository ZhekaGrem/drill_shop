// src/shared/config/mantine-theme.ts
import { createTheme } from '@mantine/core';

export const mantineTheme = createTheme({
  primaryColor: 'green',

  fontFamily: 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'IBM Plex Mono, Courier, monospace',

  headings: {
    fontFamily: 'Rubik, IBM Plex Sans, sans-serif',
    fontWeight: '900',
  },

  defaultRadius: 0,
colors: {
    red: [
      '#FFE8EB', // 0 - lightest
      '#FFD1D6', // 1
      '#FFA3AD', // 2
      '#FF7585', // 3
      '#FF475C', // 4
      '#A63C48', // 5 - main color (default)
      '#8F3440', // 6
      '#782C37', // 7
      '#61242E', // 8
      '#4A1C25', // 9 - darkest
    ],
  },
  components: {
    Anchor: {
      styles: {
        root: {
          '&:hover': {
            color: '#A63C48',
          },
        },
      },
    },
    Notification: {
      styles: {
        root: {
          border: '2px solid var(--text-primary)',
          borderRadius: 'var(--border-radius-sm)',
          background: 'var(--background)',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-md)',
        },
        title: {
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--fw-black)',
          color: 'var(--text-primary)',
        },
        description: {
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-xl)',
          color: 'var(--text-primary)',
          fontWeight: 'var(--fw-bold)',
        },
        closeButton: {
          color: 'var(--text-primary)',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
  },

  focusRing: 'auto',
  cursorType: 'pointer',
});
