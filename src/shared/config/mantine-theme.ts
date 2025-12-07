// src/shared/config/mantine-theme.ts
import { createTheme, Input } from '@mantine/core';

const inputStyles = {
  input: {
    // Фон (бежевий #e0ddca або змінна)
    backgroundColor: '#e0ddca',

    // Прибираємо всі бордери
    border: 'none',

    // Додаємо тільки нижній бордер (темно-зелений #33603b)
    // Використовуємо твою змінну ширини або 2px як фолбек
    borderBottom: 'var(--border-width, 2px) solid #33603b',

    // Квадратні кути
    borderRadius: 0,

    // Колір тексту
    color: 'var(--text-primary, #000)',

    // Трохи відступів, щоб текст не лип
    padding: 'var(--spacing-xs) var(--spacing-sm)',

    // Стилі при фокусі (щоб не було стандартної синьої обводки Mantine, якщо не треба)
    '&:focus': {
      borderBottomColor: '#254a2c', // Можна зробити темнішим при активності
    },

    // Плейсхолдер (підказка)
    '&::placeholder': {
      color: '#33603b', // Колір плейсхолдера (можна зробити прозорішим opacity: 0.6)
      opacity: 0.7,
    },
  },
};
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
    InputWrapper: Input.Wrapper.extend({
      styles: {
        error: {
          color: '#a63c48', // Твій колір
          fontWeight: '700',
        },
      },
    }),
    Anchor: {
      styles: {
        root: {
          '&:hover': {
            color: '#A63C48',
          },
        },
      },
    },
    TextInput: {
      styles: inputStyles,
    },
    PasswordInput: {
      styles: {
        ...inputStyles,

        innerInput: {
          backgroundColor: 'transparent',
        },
      },
    },
    Textarea: {
      styles: inputStyles,
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
    Checkbox: {
      styles: {
        input: {
          backgroundColor: 'transparent',
          border: 'var(--border-width) solid var(--border-color)',
          borderRadius: 0,
          cursor: 'pointer',
          '&:checked': {
            backgroundColor: 'var(--border-color)',
            borderColor: 'var(--border-color)',
            backgroundImage: "url('/svg/chekbox.svg')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
          },
          '&:disabled': {
            backgroundColor: 'transparent',
            borderColor: 'var(--text-tertiary)',
            opacity: 0.5,
            cursor: 'not-allowed',
            '&:checked': {
              backgroundColor: 'var(--text-tertiary)',
              backgroundImage: "url('/svg/chekbox.svg')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
            },
          },
        },
        icon: {
          display: 'none',
        },
      },
    },
  },

  focusRing: 'auto',
  cursorType: 'pointer',
});
