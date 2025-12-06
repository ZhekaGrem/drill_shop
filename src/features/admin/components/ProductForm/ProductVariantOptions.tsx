// src/features/admin/components/ProductForm/ProductVariantOptions.tsx
import { useState } from 'react';
import { Grid, Select, TextInput, Button, Group, Text, Badge } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

const STANDARD_OPTIONS = [
  { value: 'color', label: 'Колір' },
  { value: 'size', label: 'Розмір' },
  { value: 'material', label: 'Матеріал' },
  { value: 'brand', label: 'Бренд' },
  { value: 'taste', label: 'Смак' },
  { value: 'origin', label: 'Походження' },
];

const POPULAR_VALUES: Record<string, string[]> = {
  color: ['Червоний', 'Синій', 'Зелений', 'Жовтий', 'Чорний', 'Білий', 'Сірий'],
  size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Малий', 'Середній', 'Великий'],
  material: ['Бавовна', 'Поліестер', 'Шкіра', 'Метал', 'Пластик', 'Дерево'],
  brand: ['Власний бренд', 'Імпорт', 'Україна'],
  taste: ['Класичний', 'Солодкий', 'Гострий', 'Солоний', 'Копчений'],
  origin: ['Україна', 'Польща', 'Німеччина', 'США', 'Бразилія'],
};

interface ProductVariantOptionsProps {
  options: Record<string, any>;
  onChange: (options: Record<string, any>) => void;
}

export const ProductVariantOptions = ({ options, onChange }: ProductVariantOptionsProps) => {
  const [customKey, setCustomKey] = useState('');

  // Додати стандартну опцію
  const addStandardOption = (optionKey: string) => {
    const existingValue = options[optionKey] || '';
    onChange({
      ...options,
      [optionKey]: existingValue,
    });
  };

  // Додати власну опцію
  const addCustomOption = () => {
    if (customKey.trim() && !options[customKey]) {
      onChange({
        ...options,
        [customKey]: '',
      });
      setCustomKey('');
    }
  };

  // Видалити опцію
  const removeOption = (optionKey: string) => {
    const newOptions = { ...options };
    delete newOptions[optionKey];
    onChange(newOptions);
  };

  // Змінити значення опції
  const updateOption = (optionKey: string, value: string) => {
    onChange({
      ...options,
      [optionKey]: value,
    });
  };

  // Отримати популярні значення
  const getPopularValues = (optionKey: string) => {
    const popular = POPULAR_VALUES[optionKey] || [];
    return popular.map((value) => ({ value, label: value }));
  };

  return (
    <div>
      {/* Існуючі опції */}
      {Object.entries(options).map(([key, value]) => {
        const standardOption = STANDARD_OPTIONS.find((opt) => opt.value === key);
        const optionLabel = standardOption?.label || key;
        const popularValues = getPopularValues(key);

        return (
          <Group key={key} mb="xs" align="flex-end">
            <div style={{ flex: 1 }} className="option-item">
              <Text size="xs" c="dimmed" mb={4}>
                {optionLabel}
              </Text>
              {standardOption && (
                <Badge size="xs" ml={4} color="blue">
                  Стандартна
                </Badge>
              )}

              <TextInput
                value={value || ''}
                onChange={(e) => updateOption(key, e.target.value)}
                placeholder={`Введіть ${optionLabel.toLowerCase()}`}
                size="xs"
              />

              {/* Ручний ввід для популярних опцій */}
            </div>

            <Button size="xs" color="red" variant="light" onClick={() => removeOption(key)}>
              <IconTrash size={12} />
            </Button>
          </Group>
        );
      })}

      {/* Додавання стандартних опцій */}
      <Group mb="md" gap="xs">
        <Text size="sm" fw={500} c="dimmed">
          Додати характеристику:
        </Text>
        {STANDARD_OPTIONS.filter((opt) => !options[opt.value]).map((option) => (
          <Button
            key={option.value}
            size="xs"
            variant="light"
            onClick={() => addStandardOption(option.value)}>
            <IconPlus size={12} style={{ marginRight: 4 }} />
            {option.label}
          </Button>
        ))}
      </Group>

      {/* Додавання власної опції */}
      <Group gap="xs">
        <TextInput
          placeholder="Власна характеристика"
          value={customKey}
          onChange={(e) => setCustomKey(e.target.value)}
          size="xs"
          style={{ flex: 1 }}
        />
        <Button size="xs" onClick={addCustomOption} disabled={!customKey.trim() || !!options[customKey]}>
          <IconPlus size={12} />
        </Button>
      </Group>

      {Object.keys(options).length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="md">
          Немає характеристик. Додайте стандартні або власні.
        </Text>
      )}
      <style jsx>{`option-item:z-index:1000;`}</style>
    </div>
  );
};
