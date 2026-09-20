'use client';

import { Select, Loader, Text, Group, Badge } from '@mantine/core';
import { useState, useEffect, useMemo } from 'react';
import { IconBuilding, IconMailbox } from '@tabler/icons-react';
import styles from './DeliveryMethod.module.scss';

// Нова Пошта змішує п'ять кодпоінтів апострофа в адресах (46% київських точок:
// U+0027, U+2019, U+2018, U+0060, U+02BC), тож порівнювати їх як різні символи
// означає ховати від клієнта половину списку. Прибираємо апостроф зовсім - тоді
// збігається і той, хто набрав «В'ячеслава», і той, хто набрав «вячеслава».
const APOSTROPHES = /['’‘`ʼ´]/g;

// Латинські двійники кирилиці: промах розкладкою не має обнуляти пошук.
// Обидві сторони проходять одне й те саме перетворення, тому латиниця в назвах
// магазинів (MOYO, БРСМ) далі знаходиться.
const HOMOGLYPHS: Record<string, string> = {
  a: 'а',
  c: 'с',
  e: 'е',
  i: 'і',
  o: 'о',
  p: 'р',
  x: 'х',
  y: 'у',
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(APOSTROPHES, '')
    .replace(/[aceiopxy]/g, (char) => HOMOGLYPHS[char]);

export interface Warehouse {
  ref: string;
  name: string;
  shortAddress: string;
  number: string;
  type: 'branch' | 'postbox';
}

interface WarehouseSelectProps {
  cityRef: string;
  value?: string;
  onChange: (value: string, warehouse: Warehouse | null) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
}

export const WarehouseSelect = ({
  cityRef,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  onBlur,
}: WarehouseSelectProps) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset everything when cityRef changes or becomes empty
  useEffect(() => {
    // Clear search and errors
    setSearchValue('');
    setApiError(null);

    // If no cityRef, clear everything
    if (!cityRef || !cityRef.trim()) {
      setWarehouses([]);
      // Clear the selection if there was one
      if (value) {
        onChange('', null);
      }
      return;
    }

    const fetchWarehouses = async () => {
      setLoading(true);
      setWarehouses([]); // Clear previous warehouses

      // Clear current selection when loading new city's warehouses
      if (value) {
        onChange('', null);
      }

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/delivery/warehouses/${cityRef}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setWarehouses(result.data);
          setApiError(null);
        } else {
          console.error('❌ Invalid warehouses API response:', result);
          setApiError('Невалідна відповідь сервера');
          setWarehouses([]);
        }
      } catch (error) {
        console.error('💥 Warehouses fetch error:', error);
        setApiError(error instanceof Error ? error.message : 'Помилка завантаження');
        setWarehouses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [cityRef]); // Removed value and onChange from deps to avoid loops

  // Clear value if it's not in current warehouses list
  useEffect(() => {
    if (value && warehouses.length > 0) {
      const exists = warehouses.some((w) => w.ref === value);
      if (!exists) {
        onChange('', null);
      }
    }
  }, [value, warehouses]);

  // Нормалізуємо один раз на завантаження міста, а не на кожне натискання:
  // у Києві це 7988 точок по три поля.
  const searchIndex = useMemo(
    () =>
      warehouses.map((warehouse) => ({
        warehouse,
        haystack: normalize(
          `${warehouse.name} ${warehouse.shortAddress} ${warehouse.number} ${warehouse.number.padStart(3, '0')}`
        ),
      })),
    [warehouses]
  );

  // Filter warehouses by search value
  const getFilteredWarehouses = () => {
    if (!searchValue || !searchValue.trim()) {
      return warehouses;
    }

    const query = normalize(searchValue.trim());
    return searchIndex.filter((entry) => entry.haystack.includes(query)).map((entry) => entry.warehouse);
  };

  // Convert to Mantine Select format
  const getSelectData = () => {
    try {
      const filtered = getFilteredWarehouses();

      return filtered.map((warehouse) => ({
        value: warehouse.ref,
        label: `№${warehouse.number} - ${warehouse.shortAddress}`,
        warehouse: warehouse,
      }));
    } catch (error) {
      console.error('💥 Error preparing select data:', error);
      return [];
    }
  };

  const selectData = getSelectData();

  const handleChange = (selectedValue: string | null) => {
    if (!selectedValue) {
      onChange('', null);
      onBlur?.();
      return;
    }

    const selectedWarehouse = warehouses.find((w) => w.ref === selectedValue) || null;

    onChange(selectedValue, selectedWarehouse);
    onBlur?.();
  };

  // Custom option renderer with icons and badges
  const renderSelectOption = ({ option }: any) => {
    try {
      const warehouse = option.warehouse as Warehouse;
      if (!warehouse) return option.label;

      const isPostbox = warehouse.type === 'postbox';

      return (
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
            {isPostbox ? (
              <IconMailbox size={16} color="var(--mantine-color-blue-6)" />
            ) : (
              <IconBuilding size={16} color="var(--mantine-color-gray-6)" />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} truncate>
                №{warehouse.number}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {warehouse.shortAddress}
              </Text>
            </div>
          </Group>
          <Badge size="xs" variant="light" color={isPostbox ? 'blue' : 'gray'}>
            {isPostbox ? 'Поштомат' : 'Відділення'}
          </Badge>
        </Group>
      );
    } catch (error) {
      console.error('💥 Error rendering option:', error);
      return <Text>{option.label}</Text>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.warehouseSelect}>
        <Select
          label="Відділення/Поштомат"
          placeholder="Завантаження відділень..."
          disabled
          rightSection={<Loader size="xs" />}
          error={error}
          required={required}
          data={[]}
        />
      </div>
    );
  }

  // No city selected
  if (!cityRef || !cityRef.trim()) {
    return (
      <div className={styles.warehouseSelect}>
        <Select
          label="Відділення/Поштомат"
          placeholder="Спочатку оберіть місто"
          disabled
          data={[]}
          error={error}
          required={required}
        />
      </div>
    );
  }

  // API error state
  if (apiError) {
    return (
      <div className={styles.warehouseSelect}>
        <Select
          label="Відділення/Поштомат"
          placeholder="Помилка завантаження відділень"
          disabled
          data={[]}
          error={error || apiError}
          required={required}
        />
      </div>
    );
  }

  // No warehouses found
  if (warehouses.length === 0 && !loading) {
    return (
      <div className={styles.warehouseSelect}>
        <Select
          label="Відділення/Поштомат"
          placeholder="Відділення не знайдено для цього міста"
          disabled
          data={[]}
          error={error}
          required={required}
        />
      </div>
    );
  }

  // Main render with data
  return (
    <div className={styles.warehouseSelect}>
      <Select
        label="Відділення/Поштомат"
        placeholder="Введіть номер або адресу відділення"
        data={selectData}
        value={value || null}
        onChange={handleChange}
        onBlur={onBlur}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        // Список уже відфільтровано вище. Власний фільтр Mantine дивиться лише
        // на label (`№123 - адреса`), тому відкидав збіги, знайдені в назві -
        // «Позняки» чи «Поштомат» давали «не знайдено» при живих точках.
        filter={({ options }) => options}
        nothingFoundMessage="Відділення не знайдено за вашим запитом"
        disabled={disabled}
        error={'Вкажіть адресу доставки'}
        required={required}
        renderOption={renderSelectOption}
        maxDropdownHeight={400}
        clearable={true}
        limit={50}
      />
    </div>
  );
};
