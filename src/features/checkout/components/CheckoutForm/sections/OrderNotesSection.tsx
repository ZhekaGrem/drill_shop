import { Checkbox } from '@mantine/core';
import { TextareaField } from '@/shared/components/Input';
import styles from '../CheckoutForm.module.scss';

interface OrderNotesSectionProps {
  orderNotes: string;
  doNotCall: boolean;
  onOrderNotesChange: (value: string) => void;
  onDoNotCallChange: (value: boolean) => void;
}

export const OrderNotesSection = ({
  orderNotes,
  doNotCall,
  onOrderNotesChange,
  onDoNotCallChange,
}: OrderNotesSectionProps) => {
  return (
    <>
      <h3 className={styles.sectionTitle}>Додаткова інформація</h3>
      <TextareaField
        placeholder="Ваші побажання щодо замовлення"
        value={orderNotes}
        onChange={(e) => onOrderNotesChange(e.target.value)}
        minRows={2}
      />

      <Checkbox
        label="Не дзвонити для уточнення"
        checked={doNotCall}
        onChange={(e) => onDoNotCallChange(e.currentTarget.checked)}
        className={styles.btnConfirm}
        radius={0}
        styles={{
          root: { padding: 'var(--spacing-sm) var(--spacing-md)' },
          label: { fontFamily: 'var(--font-condensed)', fontSize: 'var(--text-sm)' },
        }}
      />
    </>
  );
};
