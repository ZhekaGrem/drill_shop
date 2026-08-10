// Поля вводу в стилі plan2.diia.gov.ua: без рамки й фону, 2px лінія знизу,
// лейбл спливає з рядка вводу. Стани — в Input.module.scss.
//
// Тема (mantine-theme.ts) роздає рамку/фон/падінг ІНЛАЙНОМ кожному полю
// проєкту, а інлайн б'ється лише інлайном. Тому кожен компонент тут починає
// зі скидання цих значень — інакше Diia-поле лишилось би в рамці.
import {
  PasswordInput,
  PasswordInputProps,
  Select,
  SelectProps,
  TextInput,
  TextInputProps,
  Textarea,
  TextareaProps,
} from '@mantine/core';
import { ReactNode, forwardRef } from 'react';
import styles from './Input.module.scss';

const FIELD_HEIGHT = 40;

// Колір лейбла теж приходить із теми інлайном, тому клас його не перебиває —
// а він має червоніти разом із лінією. Звідси єдине місце в цьому файлі, де
// стан поля читається в JS, а не селектором.
const label = (error?: ReactNode) => ({
  color: error ? 'var(--error)' : 'var(--text-tertiary)',
  fontWeight: 300,
  marginBottom: 0,
});

const RESET = {
  height: FIELD_HEIGHT,
  padding: 0,
  border: 'none',
  borderRadius: 0,
  backgroundColor: 'transparent',
} as const;

const TEXTAREA_RESET = {
  ...RESET,
  height: 'auto',
  minHeight: 72,
  padding: '8px 0',
  resize: 'vertical',
} as const;

// Опис має стояти ПІД полем: місце над полем зайняте лейблом, який туди спливає.
const ORDER: TextInputProps['inputWrapperOrder'] = ['label', 'input', 'description', 'error'];

const WRAPPER_CLASSES = {
  root: styles.root,
  wrapper: styles.wrapper,
  label: styles.label,
  description: styles.description,
  error: styles.error,
  section: styles.section,
};

// Лейбл спливає за ознакою «плейсхолдер більше не показується». Поле без
// плейсхолдера не дає такої ознаки взагалі — лейбл завис би вгорі назавжди.
const withPlaceholder = (placeholder?: string) => placeholder ?? ' ';

// Секції накладаються на рядок вводу, тому під них треба звільнити місце
// (ширина секції — 40px, задана в Input.module.scss).
const sectionPadding = (left?: unknown, right?: unknown) => ({
  paddingLeft: left ? 40 : 0,
  paddingRight: right ? 40 : 0,
});

export const Input = forwardRef<HTMLInputElement, TextInputProps>(
  ({ classNames, placeholder, leftSection, rightSection, error, ...props }, ref) => (
    <TextInput
      {...props}
      ref={ref}
      error={error}
      leftSection={leftSection}
      rightSection={rightSection}
      placeholder={withPlaceholder(placeholder)}
      inputWrapperOrder={ORDER}
      classNames={{ ...WRAPPER_CLASSES, input: styles.input, ...classNames }}
      styles={{
        input: { ...RESET, ...sectionPadding(leftSection, rightSection) },
        label: label(error),
      }}
    />
  )
);

Input.displayName = 'Input';

export const PasswordField = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ classNames, placeholder, leftSection, error, ...props }, ref) => (
    <PasswordInput
      {...props}
      ref={ref}
      error={error}
      leftSection={leftSection}
      placeholder={withPlaceholder(placeholder)}
      inputWrapperOrder={ORDER}
      classNames={{
        ...WRAPPER_CLASSES,
        input: styles.input,
        innerInput: styles.innerInput,
        ...classNames,
      }}
      styles={{
        // rightSection зайнята кнопкою «показати пароль» — місце під неї треба завжди.
        input: { ...RESET, ...sectionPadding(leftSection, true) },
        innerInput: { height: FIELD_HEIGHT, padding: 0, backgroundColor: 'transparent' },
        label: label(error),
      }}
    />
  )
);

PasswordField.displayName = 'PasswordField';

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ classNames, placeholder, error, ...props }, ref) => (
    <Textarea
      {...props}
      ref={ref}
      error={error}
      placeholder={withPlaceholder(placeholder)}
      inputWrapperOrder={ORDER}
      classNames={{ ...WRAPPER_CLASSES, input: styles.input, ...classNames }}
      styles={{ input: TEXTAREA_RESET, label: label(error) }}
    />
  )
);

TextareaField.displayName = 'TextareaField';

export const SelectField = forwardRef<HTMLInputElement, SelectProps>(
  ({ classNames, placeholder, leftSection, rightSection, error, ...props }, ref) => (
    <Select
      {...props}
      ref={ref}
      error={error}
      leftSection={leftSection}
      rightSection={rightSection}
      placeholder={withPlaceholder(placeholder)}
      inputWrapperOrder={ORDER}
      classNames={{ ...WRAPPER_CLASSES, input: styles.input, ...classNames }}
      styles={{
        // Select завжди має стрілку/хрестик у правій секції.
        input: { ...RESET, ...sectionPadding(leftSection, true) },
        label: label(error),
      }}
    />
  )
);

SelectField.displayName = 'SelectField';
