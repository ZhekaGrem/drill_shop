// src/shared/config/mantine-theme.ts
// Diia-style: білі поля, radius 8, синій фокус, чорні контроли
import { createTheme, Input } from '@mantine/core';

const inputStyles = {
  input: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-primary)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    transition: 'var(--transition-fast)',
    '&:focus': {
      borderColor: 'var(--accent)',
    },
    '&::placeholder': {
      color: 'var(--text-secondary)',
      fontWeight: 300,
      opacity: 1,
    },
  },
  label: {
    color: 'var(--text-primary)',
    fontWeight: 400,
    marginBottom: '4px',
  },
};

export const mantineTheme = createTheme({
  primaryColor: 'dark',
  fontFamily: 'var(--font-body)',
  fontFamilyMonospace: 'var(--font-body)',
  headings: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '400',
  },
  defaultRadius: 'md',
  components: {
    InputWrapper: Input.Wrapper.extend({
      styles: {
        error: { color: 'var(--error)', fontWeight: '500' },
      },
    }),
    Anchor: {
      styles: {
        root: { '&:hover': { color: 'var(--accent)' } },
      },
    },
    TextInput: { styles: inputStyles },
    PasswordInput: {
      styles: {
        ...inputStyles,
        innerInput: { backgroundColor: 'transparent' },
      },
    },
    Textarea: { styles: inputStyles },
    Select: {
      styles: {
        input: inputStyles.input,
        label: inputStyles.label,
        dropdown: {
          backgroundColor: 'var(--background)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--border-radius-sm)',
          boxShadow: 'var(--shadow-md)',
        },
        option: {
          padding: 'var(--spacing-sm) var(--spacing-md)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--border-radius-sm)',
          '&:hover': { backgroundColor: 'var(--background-secondary)' },
          '&[dataSelected]': { backgroundColor: 'var(--background-secondary)' },
        },
      },
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--border-radius-md)',
        },
      },
    },
    Alert: {
      styles: () => ({
        root: {
          borderRadius: 'var(--border-radius-md)',
          borderTop: '2px solid var(--text-primary)',
        },
        message: { color: 'var(--text-primary)', fontWeight: '400' },
      }),
    },
    Notification: {
      styles: () => ({
        root: {
          border: 'none',
          borderTop: '2px solid var(--text-primary)',
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--background)',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-lg)',
        },
        title: { fontSize: 'var(--text-base)', fontWeight: '500' },
        description: { fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' },
        closeButton: {
          color: 'var(--text-secondary)',
          '&:hover': { background: 'var(--background-secondary)' },
        },
      }),
    },
    Modal: {
      styles: {
        content: { borderRadius: 'var(--border-radius-md)' },
        header: { borderBottom: '2px solid var(--text-primary)' },
      },
    },
    Checkbox: {
      styles: {
        input: {
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          cursor: 'pointer',
          '&:checked': {
            backgroundColor: 'var(--text-primary)',
            borderColor: 'var(--text-primary)',
            backgroundImage: "url('/svg/checkmark-white.svg')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '12px',
          },
          '&:disabled': {
            opacity: 0.4,
            cursor: 'not-allowed',
          },
        },
        icon: { display: 'none' },
      },
    },
    Radio: {
      styles: {
        radio: {
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          '&:checked': {
            backgroundColor: 'var(--text-primary)',
            borderColor: 'var(--text-primary)',
          },
        },
      },
    },
  },
  focusRing: 'auto',
  cursorType: 'pointer',
});
