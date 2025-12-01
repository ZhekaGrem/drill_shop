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

  },

  focusRing: 'auto',
  cursorType: 'pointer',
});
