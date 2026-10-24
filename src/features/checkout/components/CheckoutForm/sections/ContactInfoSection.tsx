import { Controller, UseFormReturn } from 'react-hook-form';
import { Input, PhoneInput, TelegramInput } from '@/shared/components/Input';
import styles from '../CheckoutForm.module.scss';

interface ContactInfoSectionProps {
  form: UseFormReturn<any>;
  showEmail?: boolean;
}

export const ContactInfoSection = ({ form, showEmail = true }: ContactInfoSectionProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const firstNameError = (errors.shippingAddress as any)?.firstName?.message;
  const lastNameError = (errors.shippingAddress as any)?.lastName?.message;
  const emailError = errors.guestEmail?.message as string;
  const phoneError = (errors.shippingAddress as any)?.phone?.message;
  const telegramError = errors.guestTelegram?.message as string;

  return (
    <>
      <h3 className={styles.sectionTitle}>КОНТАКТНІ ДАНІ</h3>

      <div className={styles.formRow}>
        <Input
          label="Імʼя"
          placeholder="Ваше імʼя"
          required
          error={firstNameError}
          {...register('shippingAddress.firstName')}
        />

        <Input
          label="Прізвище"
          placeholder="Ваше прізвище"
          required
          error={lastNameError}
          {...register('shippingAddress.lastName')}
        />
      </div>

      {showEmail && (
        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          error={emailError}
          {...register('guestEmail')}
        />
      )}

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
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="guestTelegram"
        render={({ field }) => (
          <TelegramInput
            ref={field.ref}
            label="Telegram"
            required
            error={telegramError}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </>
  );
};
