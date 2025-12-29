import { Controller, UseFormReturn } from 'react-hook-form';
import { Input, PhoneInput } from '@/shared/components/Input';
import styles from '../CheckoutForm.module.scss';

interface ContactInfoSectionProps {
  form: UseFormReturn<any>;
}

export const ContactInfoSection = ({ form }: ContactInfoSectionProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const firstNameError = (errors.shippingAddress as any)?.firstName?.message;
  const lastNameError = (errors.shippingAddress as any)?.lastName?.message;
  const emailError = errors.guestEmail?.message as string;
  const phoneError = (errors.shippingAddress as any)?.phone?.message;

  return (
    <>
      <h3 className={styles.sectionTitle}>КОНТАКТНІ ДАНІ</h3>

      <div className={styles.formRow}>
        <Input
          label="Ім'я"
          placeholder="Іван"
          required
          error={firstNameError}
          {...register('shippingAddress.firstName')}
        />

        <Input
          label="Прізвище"
          placeholder="Петренко"
          required
          error={lastNameError}
          {...register('shippingAddress.lastName')}
        />
      </div>

      <Input
        type="email"
        label="Email"
        placeholder="your@email.com"
        required
        error={emailError}
        {...register('guestEmail')}
      />

      <Controller
        control={control}
        name="shippingAddress.phone"
        render={({ field }) => (
          <PhoneInput
            label="Телефон"
            placeholder="+380 (XX) XXX XX XX"
            required
            error={phoneError}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </>
  );
};
