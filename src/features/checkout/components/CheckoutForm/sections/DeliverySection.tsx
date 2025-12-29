import { Controller, UseFormReturn } from 'react-hook-form';
import { DeliveryMethodSelector } from '../DeliveryMethod/DeliveryMethodSelector';
import { NovaPoshtaFields } from '../DeliveryMethod/NovaPoshtaFields';
import { CustomDeliveryField } from '../DeliveryMethod/CustomDeliveryField';
import { City } from '../../DeliveryMethod/CitySelect';
import { Warehouse } from '../../DeliveryMethod/WarehouseSelect';
import styles from '../CheckoutForm.module.scss';

interface DeliverySectionProps {
  form: UseFormReturn<any>;
  deliveryMethod: string;
  selectedCity: City | null;
  selectedWarehouse: Warehouse | null;
  customDeliveryText: string;
  onCityChange: (city: City | null) => void;
  onWarehouseChange: (warehouseRef: string, warehouse: Warehouse | null) => void;
  onCustomDeliveryChange: (text: string) => void;
  onQuickInsert: (text: string) => void;
}

export const DeliverySection = ({
  form,
  deliveryMethod,
  selectedCity,
  selectedWarehouse,
  customDeliveryText,
  onCityChange,
  onWarehouseChange,
  onCustomDeliveryChange,
  onQuickInsert,
}: DeliverySectionProps) => {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <>
      <h3 className={styles.sectionTitle}>ДОСТАВКА</h3>

      <Controller
        control={control}
        name="deliveryMethod"
        render={({ field }) => (
          <DeliveryMethodSelector
            selectedMethod={field.value}
            onChange={field.onChange}
            error={errors.deliveryMethod?.message as string}
          />
        )}
      />

      {/* Nova Poshta fields */}
      {deliveryMethod === 'nova_poshta' && (
        <NovaPoshtaFields
          form={form}
          selectedCity={selectedCity}
          selectedWarehouse={selectedWarehouse}
          onCityChange={onCityChange}
          onWarehouseChange={onWarehouseChange}
        />
      )}

      {/* Custom delivery field */}
      {deliveryMethod === 'other' && (
        <CustomDeliveryField
          value={customDeliveryText}
          onChange={onCustomDeliveryChange}
          onQuickInsert={onQuickInsert}
        />
      )}

      {/* Hidden delivery data fields */}
      <input type="hidden" {...form.register('deliveryData.cityRef')} />
      <input type="hidden" {...form.register('deliveryData.cityName')} />
      <input type="hidden" {...form.register('deliveryData.warehouseRef')} />
      <input type="hidden" {...form.register('deliveryData.warehouseName')} />
    </>
  );
};
