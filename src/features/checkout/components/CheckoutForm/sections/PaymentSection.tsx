import { Controller, UseFormReturn } from 'react-hook-form';
import styles from '../CheckoutForm.module.scss';

const paymentMethods = [
  {
    value: 'cash_on_delivery',
    label: 'Готівка при отриманні',
    description: 'Оплата готівкою або карткою у відділенні Нової Пошти.',
  },
];

interface PaymentSectionProps {
  form: UseFormReturn<any>;
}

export const PaymentSection = ({ form }: PaymentSectionProps) => {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <>
      <h3 className={styles.sectionTitle}>ОПЛАТА</h3>
      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <div className={styles.radioGroup}>
            <p className={styles.radioGroupLabel}>
              Усі транзакції безпечні та зашифровані <span className={styles.required}>*</span>
            </p>
            {errors.paymentMethod && (
              <span className={styles.errorMessage}>{errors.paymentMethod.message as string}</span>
            )}
            <div className={styles.radioOptions}>
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`${styles.radioOption} ${field.value === method.value ? styles.radioOptionActive : ''}`}>
                  <input
                    type="radio"
                    value={method.value}
                    checked={field.value === method.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className={styles.radioInput}
                  />

                  <div className={styles.radioCircle}>
                    {field.value === method.value && <div className={styles.radioCircleInner}></div>}
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
        )}
      />
    </>
  );
};
