import styles from '../CheckoutForm.module.scss';

const deliveryMethods = [
  { value: 'nova_poshta', label: 'Нова Пошта', description: 'Доставка до відділення Нової Пошти' },
  { value: 'other', label: 'Інший спосіб', description: 'Укрпошта, Містекспрес або інше' },
];

interface DeliveryMethodSelectorProps {
  selectedMethod: string;
  onChange: (method: string) => void;
  error?: string;
}

export const DeliveryMethodSelector = ({ selectedMethod, onChange, error }: DeliveryMethodSelectorProps) => {
  return (
    <div className={styles.radioGroup}>
      <p className={styles.radioGroupLabel}>
        Виберіть спосіб доставки <span className={styles.required}>*</span>
      </p>
      {error && <span className={styles.errorMessage}>{error}</span>}
      <div className={styles.radioOptions}>
        {deliveryMethods.map((method) => (
          <label
            key={method.value}
            className={`${styles.radioOption} ${selectedMethod === method.value ? styles.radioOptionActive : ''}`}>
            <input
              type="radio"
              value={method.value}
              checked={selectedMethod === method.value}
              onChange={(e) => onChange(e.target.value)}
              className={styles.radioInput}
            />

            <div className={styles.radioCircle}>
              {selectedMethod === method.value && <div className={styles.radioCircleInner}></div>}
            </div>

            <div className={styles.dividerVertical}></div>

            <div className={styles.radioContent}>
              <span className={styles.radioLabel}>{method.label}</span>
              <span className={styles.radioDescription}>{method.description}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
