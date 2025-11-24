// src/shared/config/mantine-theme.ts
import { createTheme, MantineColorsTuple } from '@mantine/core';

// Кастомний жовтий колір для Mantine
const yellow: MantineColorsTuple = [
  '#FFF9E6', // 0 - найсвітліший
  '#FFF3CC', // 1
  '#FFE799', // 2
  '#FFDB66', // 3
  '#FFCF33', // 4
  '#FFB81C', // 5 - основний (#fbb800)
  '#FFB81C', // 6 - трохи темніший
  '#CC9400', // 7
  '#B38200', // 8
  '#997000', // 9 - найтемніший
];

export const mantineTheme = createTheme({
  // Основний колір для всіх компонентів
  primaryColor: 'yellow',

  // Додаємо кастомний жовтий колір
  colors: {
    yellow,
  },

  // Шрифти
  fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Oswald, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  // Глобальні стилі для компонентів
  components: {
    Button: {
      defaultProps: {
        color: 'yellow', // За замовчуванням жовтий
      },
    },

    Anchor: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Checkbox: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Radio: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Switch: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Slider: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Progress: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Badge: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Loader: {
      defaultProps: {
        color: 'yellow',
      },
    },

    TextInput: {
      defaultProps: {
        color: 'yellow',
      },
    },

    NumberInput: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Select: {
      defaultProps: {
        color: 'yellow',
      },
    },

    MultiSelect: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Textarea: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Tabs: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Stepper: {
      defaultProps: {
        color: 'yellow',
      },
    },

    Notification: {
      defaultProps: {
        color: 'yellow',
      },
    },
  },

  // Додаткові налаштування
  defaultRadius: 'md',
  focusRing: 'auto',
});
