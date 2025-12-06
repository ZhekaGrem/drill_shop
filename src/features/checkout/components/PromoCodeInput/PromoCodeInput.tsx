'use client';

import { useState } from 'react';
import { TextInput, Group, Alert, Text, Stack } from '@mantine/core';
import { IconTag, IconCheck, IconX } from '@tabler/icons-react';
import { useValidatePromoCode } from '@/features/admin/hooks/discountHooks';
import { formatPrice } from '@/shared/utils/format';
import { Button } from '@/shared/components/Button/Button';
import styles from './PromoCodeInput.module.scss';
interface PromoCodeInputProps {
  orderAmount: number;
  onApply: (discountData: {
    code: string;
    discountAmount: number;
    discountId: string;
    discountName: string;
  }) => void;
  onRemove: () => void;
  appliedCode?: string;
  disabled?: boolean;
}

export const PromoCodeInput = ({
  orderAmount,
  onApply,
  onRemove,
  appliedCode,
  disabled = false,
}: PromoCodeInputProps) => {
  const [code, setCode] = useState('');
  const { mutate: validatePromo, isPending, data: apiResponse, reset } = useValidatePromoCode();

  // Витягуємо дані з відповіді API
  const validationResult = apiResponse?.data || apiResponse;

  const handleApply = () => {
    if (!code.trim()) return;

    validatePromo(
      {
        code: code.trim().toUpperCase(),
        orderAmount,
      },
      {
        onSuccess: (response) => {
          // API повертає { success, data: { isValid, discount, potentialSavings, ... }, message }
          const data = response.data || response;

          if (data.isValid && data.discount && data.eligibleForDiscount) {
            onApply({
              code: data.discount.code || code.trim().toUpperCase(),
              discountAmount: data.potentialSavings || 0,
              discountId: data.discount.id,
              discountName: data.discount.name,
            });
            setCode('');
            reset(); // Очищаємо стан валідації після успішного застосування
          }
        },
        onError: (error: any) => {
          console.error('Validation error:', error);
        },
      }
    );
  };

  const handleRemove = () => {
    setCode('');
    reset();
    onRemove();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  // Якщо промокод вже застосовано
  if (appliedCode) {
    return (
      <Alert
        icon={<IconCheck size={20} />}
        color="green"
        title="Промокод застосовано"
        withCloseButton
        onClose={handleRemove}>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              {appliedCode}
            </Text>
            {validationResult?.discount?.name && (
              <Text size="xs" c="dimmed">
                {validationResult.discount.name}
              </Text>
            )}
          </Group>
          {validationResult?.potentialSavings && (
            <Text size="sm" c="green" fw={500}>
              Економія: {formatPrice(validationResult.potentialSavings)}
            </Text>
          )}
        </Stack>
      </Alert>
    );
  }

  return (
    <Stack gap="xs">
      <Group wrap="nowrap" align="flex-start">
        <div className={styles.promoInput} style={{ flex: 1 }}>
          <TextInput
            placeholder="Введіть промокод"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            leftSection={<IconTag size={16} />}
            disabled={disabled || isPending}
            error={
              validationResult && !validationResult.isValid
                ? validationResult.errorMessage || validationResult.message || 'Промокод недійсний'
                : undefined
            }
          />
        </div>
        <Button
          onClick={handleApply}
          loading={isPending}
          disabled={!code.trim() || disabled}
          variant="outline"
          size="promo">
          Застосувати
        </Button>
      </Group>

      {/* Показуємо потенційну економію при успішній валідації */}
      {validationResult?.isValid && validationResult?.potentialSavings && !appliedCode && (
        <Alert icon={<IconCheck size={16} />} color="green" p="xs">
          <Text size="xs">
            Промокод дійсний! Ви заощадите: {formatPrice(validationResult.potentialSavings)}
          </Text>
        </Alert>
      )}

      {/* Показуємо помилку валідації або недоступності */}
      {validationResult && !validationResult.isValid && (
        <Alert icon={<IconX size={16} />} color="red" p="xs">
          <Text size="xs">
            {validationResult.errorMessage || validationResult.message || 'Промокод недійсний'}
          </Text>
        </Alert>
      )}

      {/* Показуємо помилку якщо промокод валідний, але не доступний для застосування */}
      {validationResult?.isValid &&
        !validationResult.eligibleForDiscount &&
        validationResult.errorMessage && (
          <Alert icon={<IconX size={16} />} color="red" p="xs">
            <Text size="xs">{validationResult.errorMessage}</Text>
          </Alert>
        )}

      {/* Показуємо вимоги про мінімальну суму, якщо є і немає іншої помилки */}
      {validationResult?.isValid &&
        !validationResult.eligibleForDiscount &&
        !validationResult.errorMessage &&
        validationResult.requirements?.minOrderAmount && (
          <Alert color="yellow" p="xs">
            <Text size="xs">
              Мінімальна сума замовлення: {formatPrice(validationResult.requirements.minOrderAmount)}
            </Text>
          </Alert>
        )}
    </Stack>
  );
};
