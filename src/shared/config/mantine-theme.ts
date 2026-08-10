// src/shared/config/mantine-theme.ts
// Diia-style: білі поля, radius 8, синій фокус, чорні контроли
//
// NOTE: Mantine 8 (without @mantine/emotion) applies `styles` blocks as inline
// styles. Pseudo-selector keys like '&:focus', '&:checked', '&:hover' are
// silently ignored by inline styles. Any state-dependent (:focus/:hover/
// :checked/::placeholder/[dataSelected]) rules live in globals.css targeting
// Mantine's static classNames instead. Only static, always-applied
// properties stay here.
import { createTheme, Input } from '@mantine/core';

const inputStyles = {
  input: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-primary)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    transition: 'var(--transition-fast)',
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
    // Візуально нічого не змінює: varsResolver Mantine і так підставляє
    // `variant || 'filled'`. Але без явного значення атрибут data-variant у DOM
    // просто відсутній, і градієнтне hover-правило в globals.css довелося б
    // писати двома селекторами (`[data-variant='filled']` + `:not([data-variant])`).
    Button: { defaultProps: { variant: 'filled' } },
    InputWrapper: Input.Wrapper.extend({
      styles: {
        error: { color: 'var(--error)', fontWeight: '500' },
      },
    }),
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
        },
      }),
    },
    // Дефолти переходів. Значення дублюють --ease-out / --ease-sheet із globals.css:
    // Mantine кладе timingFunction в inline-стиль порталу, тому тримати їх
    // одним джерелом без окремого рантайм-читання CSS-змінної не виходить.
    // Міняєш криву в globals.css — поміняй і тут.
    Modal: {
      defaultProps: {
        transitionProps: {
          transition: 'pop',
          duration: 220,
          timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      },
      styles: {
        content: {
          borderRadius: 'var(--border-radius-md)',
          borderTop: '2px solid var(--text-primary)',
        },
      },
    },
    Drawer: {
      defaultProps: {
        transitionProps: { duration: 300, timingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      },
    },
    Menu: {
      defaultProps: {
        transitionProps: {
          transition: 'pop',
          duration: 180,
          timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      },
    },
    Popover: {
      defaultProps: {
        transitionProps: {
          transition: 'pop',
          duration: 180,
          timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      },
    },
    Tooltip: {
      defaultProps: {
        transitionProps: {
          transition: 'fade',
          duration: 180,
          timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      },
    },
    // Checkbox and Radio state-dependent styling (checked/disabled) lives in
    // globals.css targeting .mantine-Checkbox-input / .mantine-Radio-radio —
    // see note at top of this file.
  },
  focusRing: 'auto',
  cursorType: 'pointer',
});
