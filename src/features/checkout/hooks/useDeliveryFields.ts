import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { City } from '../components/DeliveryMethod/CitySelect';
import { Warehouse } from '../components/DeliveryMethod/WarehouseSelect';

interface UseDeliveryFieldsProps {
  deliveryMethod: string;
  form: UseFormReturn<any>;
}

export const useDeliveryFields = ({ deliveryMethod, form }: UseDeliveryFieldsProps) => {
  const { setValue } = form;

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [customDeliveryText, setCustomDeliveryText] = useState('');

  // Reset city and warehouse when delivery method changes
  useEffect(() => {
    if (deliveryMethod !== 'nova_poshta') {
      setSelectedCity(null);
      setSelectedWarehouse(null);
      setValue('deliveryData.cityRef', '');
      setValue('deliveryData.cityName', '');
      setValue('deliveryData.warehouseRef', '');
      setValue('deliveryData.warehouseName', '');
      setValue('shippingAddress.address1', '');
      setValue('shippingAddress.city', '');
      setCustomDeliveryText('');
    }
  }, [deliveryMethod, setValue]);

  // Handle city change
  const handleCityChange = useCallback(
    (city: City | null) => {
      setSelectedCity(city);
      setSelectedWarehouse(null);

      if (city) {
        setValue('shippingAddress.city', city.name);
        setValue('deliveryData.cityRef', city.ref);
        setValue('deliveryData.cityName', city.name);
      } else {
        setValue('shippingAddress.city', '');
        setValue('shippingAddress.address1', '');
        setValue('deliveryData.cityRef', '');
        setValue('deliveryData.cityName', '');
      }
      setValue('deliveryData.warehouseRef', '');
      setValue('deliveryData.warehouseName', '');
      setValue('shippingAddress.address1', '');
    },
    [setValue]
  );

  // Handle warehouse change
  const handleWarehouseChange = useCallback(
    (warehouseRef: string, warehouse: Warehouse | null) => {
      setSelectedWarehouse(warehouse);

      if (warehouse) {
        setValue('deliveryData.warehouseRef', warehouse.ref);
        setValue('deliveryData.warehouseName', warehouse.name);
        setValue('shippingAddress.address1', warehouse.name);
      } else {
        setValue('deliveryData.warehouseRef', '');
        setValue('deliveryData.warehouseName', '');
        setValue('shippingAddress.address1', '');
      }
    },
    [setValue]
  );

  // Handle custom delivery text change
  const handleCustomDeliveryChange = useCallback(
    (text: string) => {
      setCustomDeliveryText(text);
      const cleanText = text.replace(/\n/g, ', ');
      setValue('shippingAddress.address1', cleanText);
      setValue('shippingAddress.city', '');
    },
    [setValue]
  );

  // Quick insert buttons for custom delivery
  const insertQuickText = useCallback(
    (text: string) => {
      const newText = customDeliveryText ? `${customDeliveryText}, ${text}` : text;
      handleCustomDeliveryChange(newText);
    },
    [customDeliveryText, handleCustomDeliveryChange]
  );

  return {
    selectedCity,
    selectedWarehouse,
    customDeliveryText,
    handleCityChange,
    handleWarehouseChange,
    handleCustomDeliveryChange,
    insertQuickText,
  };
};
