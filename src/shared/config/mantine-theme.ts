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
    // Було жорстке '#ffffff'. Це inline-стиль, тобто він перебивав будь-яку
    // тему — вночі кожне поле на сайті ставало білою коробкою з майже-білим
    // текстом (--text-primary #f2f4f3 на #ffffff = 1.10:1).
    backgroundColor: 'var(--surface-card)',
    // --border-control, а не --border-subtle: межа поля несе афорданс «сюди
    // можна тицьнути», для неї WCAG 1.4.11 вимагає 3:1.
    border: '1px solid var(--border-control)',
    borderRadius: 'var(--border-radius-sm)',
    // Дефолтна висота Mantine-інпута — 42px, і вона не збігалася ні з нашим
    // <Input> (40px), ні з <Button --md> (48px). Тепер поля проєкту стоять на
    // тій самій сходинці, що й решта контролів.
    minHeight: 'var(--control-h-sm)',
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
          // Без цих двох рядків спливаючий шар брав --mantine-color-body /
          // --mantine-color-text, тобто малювався світлою палітрою Mantine
          // поверх нашої темної сторінки.
          backgroundColor: 'var(--surface-card)',
          color: 'var(--text-primary)',
        },
        header: { backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)' },
        body: { color: 'var(--text-primary)' },
      },
    },
    Drawer: {
      defaultProps: {
        transitionProps: { duration: 300, timingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      },
      // Те саме, що й для Modal. Заголовок шухляди кошика рендериться поза
      // нашою розміткою, тому колір йому мусить дати саме тема.
      styles: {
        content: { backgroundColor: 'var(--background)', color: 'var(--text-primary)' },
        header: { backgroundColor: 'var(--background)', color: 'var(--text-primary)' },
        body: { color: 'var(--text-primary)' },
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
