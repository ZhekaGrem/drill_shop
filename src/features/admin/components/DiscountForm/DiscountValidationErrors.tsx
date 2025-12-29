// src/features/admin/components/DiscountForm/components/DiscountValidationErrors.tsx
'use client';
import { ReactNode } from 'react';

import { Alert, Text, Box } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface DiscountValidationErrorsProps {
  errors: Record<string, string | ReactNode | undefined>;
}

export const DiscountValidationErrors = ({ errors }: DiscountValidationErrorsProps) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
      <Text fw={500} mb="xs">
        Помилки валідації:
      </Text>
      <Box component="ul" m={0} pl="lg">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>{error}</li>
        ))}
      </Box>
    </Alert>
  );
};
