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

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      category: 'Замовлення',
      questions: [
        {
          question: 'Як оформити замовлення?',
          answer:
            'Додайте товари до кошика, перейдіть до оформлення, заповніть контактні дані та оберіть спосіб доставки і оплати. Підтвердіть замовлення.',
        },
        {
          question: 'Чи можна змінити замовлення після оформлення?',
          answer:
            'Так, ви можете змінити замовлення протягом 2 годин після оформлення, зателефонувавши до нашої служби підтримки за номером +380 (67) 123-45-67.',
        },
        {
          question: 'Мінімальна сума замовлення?',
          answer: 'Мінімальна сума замовлення становить 300 грн. ',
        },
        {
          question: 'Чи можна замовляти без реєстрації?',
          answer: 'Так, ви можете оформити замовлення як гість, вказавши лише необхідні контактні дані.',
        },
      ],
    },
    {
      category: 'Доставка',
      questions: [
        {
          question: 'Які способи доставки доступні?',
          answer:
            "Доставка Новою Поштою на відділення або кур'єром, Укрпоштою, а також самовивіз з нашого магазину.",
        },
        {
          question: 'Скільки коштує доставка?',
          answer:
            "Вартість доставки залежить від способу: Нова Пошта від 50 грн, кур'єр від 80 грн, Укрпошта від 30 грн. Безкоштовна доставка від 1000 грн.",
        },
        {
          question: 'Як швидко доставляють замовлення?',
          answer:
            "Самовивіз - в день замовлення, Нова Пошта - 1-3 дні, кур'єр - 1-2 дні, Укрпошта - 3-7 днів.",
        },
        {
          question: 'Чи зберігається холодовий ланцюг?',
          answer:
            'Так, ми гарантуємо дотримання холодового ланцюга протягом всього шляху від нашого складу до вас.',
        },
      ],
    },
    {
      category: 'Оплата',
      questions: [
        {
          question: 'Які способи оплати приймаєте?',
          answer:
            'Онлайн картою (Visa, MasterCard), готівкою при отриманні, банківським переказом для юридичних осіб.',
        },
        {
          question: 'Чи безпечна онлайн оплата?',
          answer:
            'Так, всі платежі захищені 3D Secure технологією та SSL шифруванням. Ми не зберігаємо дані вашої карти.',
        },
        {
          question: 'Коли списуються кошти з карти?',
          answer: 'Кошти списуються після підтвердження замовлення менеджером, зазвичай протягом 1-2 годин.',
        },
        {
          question: 'Чи можна оплатити частинами?',
          answer:
            'На даний момент оплата частинами не доступна. Ви можете оплатити повну суму при замовленні або готівкою при отриманні.',
        },
      ],
    },
    {
      category: 'Якість та свіжість',
      questions: [
        {
          question: 'Як ви гарантуєте свіжість продукції?',
          answer:
            'Ми працюємо тільки з перевіреними постачальниками, дотримуємося умов зберігання та доставляємо продукцію з актуальними термінами придатності.',
        },
        {
          question: 'Що робити, якщо товар виявився неякісним?',
          answer:
            "Зв'яжіться з нами протягом 24 годин після отримання. Ми замінимо товар або повернемо кошти.",
        },
        {
          question: 'Чи можна переглянути товар перед оплатою?',
          answer:
            'При оплаті готівкою ви можете оглянути упаковку та перевірити терміни придатності перед оплатою.',
        },
        {
          question: 'Де ви зберігаете продукцію?',
          answer:
            'Продукція зберігається на сертифікованих холодильних складах з дотриманням всіх санітарних норм.',
        },
      ],
    },
    {
      category: 'Повернення та обмін',
      questions: [
        {
          question: 'Чи можна повернути харчові продукти?',
          answer:
            'Повернення можливе лише у випадку неналежної якості товару протягом 24 годин після доставки.',
        },
        {
          question: 'Як повернути кошти?',
          answer:
            'Кошти повертаються тим же способом, яким була здійснена оплата: на карту протягом 5-10 днів, готівкою при наступній доставці.',
        },
        {
          question: 'Що робити з товаром при поверненні?',
          answer:
            "Товар має залишатися в оригінальній упаковці. Наш кур'єр забере його при доставці заміни або повернення коштів.",
        },
      ],
    },
    {
      category: 'Акаунт та особисті дані',
      questions: [
        {
          question: 'Навіщо потрібна реєстрація?',
          answer:
            'Реєстрація дозволяє швидше оформляти замовлення, відстежувати історію покупок, зберігати адреси доставки.',
        },
        {
          question: 'Як захищені мої особисті дані?',
          answer:
            'Ми використовуємо сучасні методи шифрування та не передаємо ваші дані третім особам без вашої згоди.',
        },
        {
          question: 'Як видалити акаунт?',
          answer: "Зв'яжіться з нашою службою підтримки, і ми видалимо ваш акаунт протягом 30 днів.",
        },
      ],
    },
  ];

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
