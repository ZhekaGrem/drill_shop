import { Button } from '@/shared/components/Button/Button';
import { TextareaField } from '@/shared/components/Input';
import styles from '../CheckoutForm.module.scss';

interface CustomDeliveryFieldProps {
  value: string;
  onChange: (value: string) => void;
  onQuickInsert: (text: string) => void;
}

export const CustomDeliveryField = ({ value, onChange, onQuickInsert }: CustomDeliveryFieldProps) => {
  return (
    <div className={styles.customDelivery}>
      <div className={styles.quickButtons}>
        <Button variant="ghost" size="sm" type="button" onClick={() => onQuickInsert('Укрпошта')}>
          Укрпошта
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => onQuickInsert('Містекспрес')}>
          Містекспрес
        </Button>
      </div>
      <TextareaField
        label="Адреса доставки"
        placeholder="Вкажіть спосіб доставки та адресу"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minRows={3}
        error={!value ? 'Вкажіть адресу доставки' : undefined}
      />
    </div>
  );
};
