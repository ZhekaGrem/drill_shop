// src/features/admin/components/OrderEdit/sections/ShippingAddressSection.tsx
import React from 'react';
import { Card, Grid, TextInput, Title } from '@mantine/core';
import { UseFormReturn } from 'react-hook-form';

interface ShippingAddressSectionProps {
  form: UseFormReturn<any>;
}

/**
 * Секція адреси доставки
 * Відображає поля для введення адреси доставки
 */
export const ShippingAddressSection: React.FC<ShippingAddressSectionProps> = ({ form }) => {
  const city = form.watch('shippingAddress.city');

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Title order={3} mb="lg">
        Адреса доставки
      </Title>

      <Grid>
        <Grid.Col span={12}>
          <TextInput
            label="Повне ім'я"
            required
            {...form.register('shippingAddress.fullName')}
            error={
              (form.formState.errors.shippingAddress as any)?.fullName?.message as string | undefined
            }
          />
        </Grid.Col>
        {city && city.trim() !== '' ? (
          <>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Місто"
                required
                {...form.register('shippingAddress.city')}
                error={(form.formState.errors.shippingAddress as any)?.city?.message as string | undefined}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Адреса"
                required
                {...form.register('shippingAddress.street')}
                error={
                  (form.formState.errors.shippingAddress as any)?.street?.message as string | undefined
                }
              />
            </Grid.Col>
          </>
        ) : (
          <Grid.Col span={12}>
            <TextInput
              label="Адреса"
              required
              {...form.register('shippingAddress.street')}
              error={
                (form.formState.errors.shippingAddress as any)?.street?.message as string | undefined
              }
            />
          </Grid.Col>
        )}
      </Grid>
    </Card>
  );
};
