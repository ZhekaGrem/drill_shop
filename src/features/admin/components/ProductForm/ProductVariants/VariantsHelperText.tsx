import { Alert, Text } from '@mantine/core';

interface VariantsHelperTextProps {
  mainSku: string;
  variantsCount: number;
}

export const VariantsHelperText = ({ mainSku, variantsCount }: VariantsHelperTextProps) => {
  return (
    <>
      <Alert color="blue" variant="light" mt="md">
        <Text size="sm" fw={500} mb="xs">
          Поради щодо артикулів та характеристик:
        </Text>
        <Text size="sm">
          • Артикули повинні бути унікальними
          <br />• Використовуйте формат: {mainSku || 'ОСНОВНИЙ'}-1, {mainSku || 'ОСНОВНИЙ'}-2, тощо
          <br />
          • Артикул варіанту не може співпадати з основним артикулом
          <br />• Характеристики допомагають покупцям розрізняти варіанти (колір, розмір, смак тощо)
        </Text>
      </Alert>

      {variantsCount > 0 && (
        <Alert color="green" variant="light" mt="md">
          <Text size="sm">
            ✅ Додано {variantsCount} варіантів з характеристиками. Вони будуть збережені разом з товаром.
          </Text>
        </Alert>
      )}
    </>
  );
};
