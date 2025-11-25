// src/shared/config/mantine-theme.ts
import { createTheme, MantineColorsTuple } from '@mantine/core';

// Кольори з Figma дизайну "Щільний дріл"
const yellow: MantineColorsTuple = [
  '#FFFCF0', // 0 - найсвітліший
  '#FFF9E0', // 1
  '#FFF3C0', // 2
  '#FFED99', // 3
  '#F5E84D', // 4
  '#EFDB14', // 5 - secondary yellow
  '#E6DB1B', // 6 - primary yellow (main button color)
  '#CCB800', // 7
  '#B39900', // 8
  '#997A00', // 9 - найтемніший
];

const beige: MantineColorsTuple = [
  '#F7F6F0', // 0 - найсвітліший
  '#EDECDA', // 1 - light beige
  '#E6E4D5', // 2
  '#E0DDCA', // 3 - light accent
  '#DDD9C2', // 4
  '#D5D3B5', // 5 - primary background
  '#CCCCAE', // 6
  '#CBCBAE', // 7
  '#B8B69A', // 8
  '#A5A388', // 9 - найтемніший
];

const dark: MantineColorsTuple = [
  '#E6E6E5', // 0 - найсвітліший
  '#CCCCCA', // 1
  '#B3B3AF', // 2
  '#999994', // 3
  '#808079', // 4
  '#66665E', // 5
  '#4D4D43', // 6
  '#373737', // 7
  '#2B2B27', // 8 - primary dark text
  '#1E1E1B', // 9 - найтемніший
];

const green: MantineColorsTuple = [
  '#EBF5ED', // 0 - найсвітліший
  '#D7EBD9', // 1
  '#BFE0C5', // 2
  '#A7D6B1', // 3
  '#8FCB9D', // 4
  '#77C189', // 5
  '#5FB775', // 6
  '#47AC61', // 7
  '#33603B', // 8 - button green
  '#254629', // 9 - найтемніший
];

const red: MantineColorsTuple = [
  '#F8E9EC', // 0 - найсвітліший
  '#F0D3D9', // 1
  '#E8BDC6', // 2
  '#E0A7B3', // 3
  '#D891A0', // 4
  '#D07B8D', // 5
  '#C8657A', // 6
  '#C04F67', // 7
  '#A63C48', // 8 - menu red
  '#9C0C3D', // 9 - dark red
];

export const mantineTheme = createTheme({
  // Основний колір для всіх компонентів
  primaryColor: 'green',

  // Додаємо всі кольори з дизайну
  colors: {
    yellow,
    beige,
    dark,
    green,
    red,
  },

  // Шрифти з Figma
  fontFamily: 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'IBM Plex Mono, Courier, monospace',
  headings: {
    fontFamily: 'Rubik Glitch, IBM Plex Sans, sans-serif',
    fontWeight: '400',
    sizes: {
      h1: { fontSize: '40px', lineHeight: '1.2' },
      h2: { fontSize: '36px', lineHeight: '1.2' },
      h3: { fontSize: '32px', lineHeight: '1.2' },
      h4: { fontSize: '27px', lineHeight: '1.2' },
      h5: { fontSize: '24px', lineHeight: '1.2' },
      h6: { fontSize: '20px', lineHeight: '1.2' },
    },
  },

  // Радіуси (в дизайні все квадратне - pixel art стиль)
  defaultRadius: 0,

  // Тіні (pixel art стиль - жорсткі тіні)
  shadows: {
    xs: '0px 0px 0px rgba(43, 43, 39, 0.1)',
    sm: '0px 0px 0px rgba(43, 43, 39, 0.2)',
    md: '3px 3px 0px rgba(43, 43, 39, 0.3)',
    lg: '4px 4px 0px rgba(43, 43, 39, 0.4)',
    xl: '5px 5px 0px rgba(43, 43, 39, 0.5)',
  },

  // Глобальні стилі для компонентів
  components: {
    Button: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
          fontFamily: 'IBM Plex Sans, sans-serif',
          fontWeight: 700,
          fontSize: '18px',
          transition: 'all 0.15s ease',
          '&:hover': {
            transform: 'translate(1px, 1px)',
          },
          '&:active': {
            transform: 'translate(2px, 2px)',
          },
        },
      },
    },

    Anchor: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Checkbox: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        input: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Radio: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        radio: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Switch: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        track: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Slider: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Progress: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Badge: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Loader: {
      defaultProps: {
        color: 'green',
      },
    },

    TextInput: {
      styles: {
        input: {
          border: 'none',
          borderRadius: 0,
          fontFamily: 'IBM Plex Sans Condensed, sans-serif',
          fontSize: '16px',
        },
      },
    },

    NumberInput: {
      styles: {
        input: {
          border: 'none',
          borderRadius: 0,
          fontFamily: 'IBM Plex Sans Condensed, sans-serif',
          fontSize: '16px',
        },
      },
    },

    Select: {
      styles: {
        input: {
          border: 'none',
          borderRadius: 0,
          fontFamily: 'IBM Plex Sans Condensed, sans-serif',
          fontSize: '16px',
        },
      },
    },

    MultiSelect: {
      styles: {
        input: {
          border: 'none',
          borderRadius: 0,
          fontFamily: 'IBM Plex Sans Condensed, sans-serif',
          fontSize: '16px',
        },
      },
    },

    Textarea: {
      styles: {
        input: {
          border: 'none',
          borderRadius: 0,
          fontFamily: 'IBM Plex Sans Condensed, sans-serif',
          fontSize: '16px',
        },
      },
    },

    Tabs: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
        tab: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Stepper: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Notification: {
      defaultProps: {
        color: 'green',
      },
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Card: {
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Paper: {
      styles: {
        root: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },

    Modal: {
      styles: {
        content: {
          border: 'none',
          borderRadius: 0,
        },
      },
    },
  },

  // Додаткові налаштування
  focusRing: 'auto',
  cursorType: 'pointer',
});
