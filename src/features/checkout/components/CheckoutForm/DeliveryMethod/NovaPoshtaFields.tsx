import { UseFormReturn } from 'react-hook-form';
import { CitySelect, City } from '../../DeliveryMethod/CitySelect';
import { WarehouseSelect, Warehouse } from '../../DeliveryMethod/WarehouseSelect';
import styles from '../CheckoutForm.module.scss';

interface NovaPoshtaFieldsProps {
  form: UseFormReturn<any>;
  selectedCity: City | null;
  selectedWarehouse: Warehouse | null;
  onCityChange: (city: City | null) => void;
  onWarehouseChange: (warehouseRef: string, warehouse: Warehouse | null) => void;
}

export const NovaPoshtaFields = ({
  form,
  selectedCity,
  selectedWarehouse,
  onCityChange,
  onWarehouseChange,
}: NovaPoshtaFieldsProps) => {
  const {
    formState: { errors },
  } = form;

  const cityError =
    (errors.deliveryData as any)?.cityRef?.message || (errors.shippingAddress as any)?.city?.message;
  const warehouseError = (errors.deliveryData as any)?.warehouseRef?.message;

  return (
    <div className={styles.deliveryFields}>
      <CitySelect
        value={selectedCity}
        onChange={onCityChange}
        error={cityError}
        onBlur={() => {
          form.trigger('deliveryData.cityRef');
          form.trigger('shippingAddress.city');
        }}
      />

      {selectedCity && (
        <WarehouseSelect
          cityRef={selectedCity.ref}
          value={selectedWarehouse?.ref || ''}
          onChange={onWarehouseChange}
          error={warehouseError}
          required
          onBlur={() => form.trigger('deliveryData.warehouseRef')}
        />
      )}
    </div>
  );
};
