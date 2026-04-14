// src/app/faq/FAQ.tsx
'use client';

import {
  Container,
  Title,
  Text,
  Accordion,
  TextInput,
  Stack,
  Paper,
  Group,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import { IconSearch, IconQuestionMark, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { faqData } from './faq-data';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter questions based on search
  const filteredFAQ = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <Container size="md" py="xl">
      <Stack align="center" mb="xl">
        <ThemeIcon size="xl" color="blue" variant="light">
          <IconQuestionMark size={32} />
        </ThemeIcon>

        <Title order={1} ta="center">
          Часті питання
        </Title>

        <Text size="lg" c="dimmed" ta="center" maw={600}>
          Знайдіть відповіді на найпопуляріші питання про наші послуги
        </Text>

        <TextInput
          placeholder="Пошук по питанням..."
          leftSection={<IconSearch size={16} />}
          size="md"
          style={{ width: '100%', maxWidth: 400 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Stack>

      {filteredFAQ.length > 0 ? (
        <Stack gap="xl">
          {filteredFAQ.map((category, categoryIndex) => (
            <Paper key={categoryIndex} p="lg" withBorder radius="md">
              <Title order={3} mb="md" c="blue">
                {category.category}
              </Title>

              <Accordion variant="contained" radius="md">
                {category.questions.map((item, index) => (
                  <Accordion.Item key={index} value={`${categoryIndex}-${index}`}>
                    <Accordion.Control>
                      <Text fw={500}>{item.question}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text>{item.answer}</Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Alert color="orange" variant="light" icon={<IconInfoCircle size={16} />}>
          <Text>За вашим запитом нічого не знайдено. Спробуйте інші ключові слова.</Text>
        </Alert>
      )}

      {/* Contact section */}
      <Paper p="xl" withBorder radius="md" mt="xl" bg="blue.0">
        <Stack align="center" gap="md">
          <Title order={3}>Не знайшли відповідь?</Title>

          <Text ta="center" c="dimmed">
            Наша служба підтримки працює щодня з 8:00 до 20:00
          </Text>

          <Group>
            <Text fw={500}>📞 +380 (67) 123-45-67</Text>
            <Text fw={500}>✉️ support@meatshop.ua</Text>
          </Group>

          <Text size="sm" c="dimmed" ta="center">
            Середній час відповіді: 15 хвилин
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
};

export default FAQ;
