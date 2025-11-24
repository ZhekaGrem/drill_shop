import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { DiscountType } from '@/shared/types/generated.types';
import { DiscountFormData } from '@/shared/types/admin.types';

interface UseDiscountFormProps {
  discount?: any;
}

export const useDiscountForm = ({ discount }: UseDiscountFormProps) => {
  const form = useForm<DiscountFormData>({
    initialValues: {
      name: discount?.name || '',
      code: discount?.code || '',
      type: discount?.type || DiscountType.PERCENTAGE,
      value: discount?.value || 0,
      minOrderAmount: discount?.minOrderAmount || undefined,
      maxDiscount: discount?.maxDiscount || undefined,
      usageLimit: discount?.usageLimit || undefined,
      startsAt: discount?.startsAt ? new Date(discount.startsAt) : undefined,
      endsAt: discount?.endsAt ? new Date(discount.endsAt) : undefined,
      isActive: discount?.isActive ?? true,
      applicableProductIds: discount?.applicableProductIds || [],
    },
    validate: {
      name: (value) => (!value?.trim() ? "Назва знижки обов'язкова" : null),
      code: (value) => {
        if (value && !/^[A-Z0-9_-]+$/i.test(value)) {
          return 'Промокод може містити тільки літери, цифри, дефіси та підкреслення';
        }
        return null;
      },
      value: (value, values) => {
        if (value <= 0) return 'Значення знижки має бути більше 0';
        if (values.type === DiscountType.PERCENTAGE && value > 100) {
          return 'Відсоток не може бути більше 100';
        }
        if (values.type === DiscountType.FIXED_AMOUNT && value > 100000) {
          return 'Сума знижки занадто велика';
        }
        return null;
      },
      startsAt: (value, values) => {
        if (value && values.endsAt && value >= values.endsAt) {
          return 'Дата початку повинна бути раніше дати закінчення';
        }
        return null;
      },
      endsAt: (value, values) => {
        if (value && values.startsAt && value <= values.startsAt) {
          return 'Дата закінчення повинна бути пізніше дати початку';
        }
        return null;
      },
    },
  });

  // Auto-generate code logic
  const generateCode = (name: string): string => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 20);
  };

  // Auto-generate code when name changes (only for new discounts)
  useEffect(() => {
    if (!discount && form.values.name && !form.values.code) {
      const generatedCode = generateCode(form.values.name);
      form.setFieldValue('code', generatedCode);
    }
  }, [form.values.name, discount]);

  return { form };
};
