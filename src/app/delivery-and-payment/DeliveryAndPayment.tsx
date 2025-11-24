// src/app/delivery-and-payment/DeliveryAndPayment.tsx
'use client';

import {
  Container,
  Title,
  Text,
  Paper,
  Grid,
  Stack,
  Divider,
  List,
  ThemeIcon,
  Group,
  Badge,
  Card,
  ListItem,
} from '@mantine/core';
import {
  IconTruck,
  IconCreditCard,
  IconClock,
  IconMapPin,
  IconCheck,
  IconCurrency,
  IconShield,
} from '@tabler/icons-react';
import styles from './deliveryPayment.module.scss';

const DeliveryAndPayment = () => {
  const deliveryMethods = [
    {
      icon: IconTruck,
      title: 'Нова Пошта',
      description: 'Доставка на відділення або поштомат',
      price: 'від 50 ₴',
      time: '1-3 дні',
      features: [
        'Понад 5000 відділень по всій Україні',
        'Автоматичні поштомати 24/7',
        'СМС-повідомлення про доставку',
        'Можливість зміни адреси доставки',
      ],
    },
    {
      icon: IconMapPin,
      title: "Нова Пошта кур'єр",
      description: "Доставка кур'єром за вашою адресою",
      price: 'від 80 ₴',
      time: '1-2 дні',
      features: [
        'Доставка до квартири/офісу',
        'Попереднє узгодження часу',
        'Доставка у зручний для вас час',
        'Підйом на поверх включено',
      ],
    },
    {
      icon: IconTruck,
      title: 'Укрпошта',
      description: 'Економічна доставка на відділення',
      price: 'від 30 ₴',
      time: '3-7 днів',
      features: [
        'Найбільша мережа відділень',
        'Доступні ціни на доставку',
        'Можливість наложеного платежу',
        'Страхування посилки',
      ],
    },
    {
      icon: IconMapPin,
      title: 'Самовивіз',
      description: 'Забрати товар з нашого магазину',
      price: 'Безкоштовно',
      time: 'Сьогодні',
      features: [
        'Економія на доставці',
        'Миттєве отримання товару',
        'Можливість огляду перед покупкою',
        'Консультація спеціаліста',
      ],
    },
  ];

  const paymentMethods = [
    {
      icon: IconCreditCard,
      title: 'Онлайн картою',
      description: 'Visa, MasterCard, Apple Pay, Google Pay',
      features: [
        '3D Secure захист',
        'Миттєва обробка платежу',
        'Електронний чек на email',
        'Повернення коштів протягом 14 днів',
      ],
      badge: 'Рекомендовано',
    },
    {
      icon: IconCurrency,
      title: 'Готівкою при отриманні',
      description: "Оплата готівкою кур'єру або на пошті",
      features: [
        'Без передоплати',
        'Огляд товару перед оплатою',
        'Без додаткових комісій',
        'Зручно для всіх віковых категорій',
      ],
    },
    {
      icon: IconShield,
      title: 'Банківський переказ',
      description: 'Переказ на рахунок ФОП',
      features: [
        'Для юридичних осіб',
        'Документи для звітності',
        'Безготівковий розрахунок',
        'ПДВ включений у вартість',
      ],
    },
  ];

  return (
    <div className={styles.page}>
      <Container size="lg" py="xl">
        {/* Header */}
        <Stack align="center" mb="xl">
          <Title order={1} ta="center" className={styles.title}>
            Доставка та оплата
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Вибирайте зручний спосіб доставки та оплати. Ми працюємо по всій Україні та гарантуємо безпеку
            ваших покупок.
          </Text>
        </Stack>

        {/* Delivery Section */}
        <Paper p="xl" withBorder radius="md" mb="xl">
          <Group align="center" mb="lg">
            <ThemeIcon size="xl" color="blue" variant="light">
              <IconTruck size={24} />
            </ThemeIcon>
            <Title order={2}>Способи доставки</Title>
          </Group>

          <Grid>
            {deliveryMethods.map((method, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 6 }}>
                <Card withBorder radius="md" h="100%" p="lg">
                  <Group align="flex-start" mb="md">
                    <ThemeIcon size="lg" color="blue" variant="light">
                      <method.icon size={20} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Title order={4}>{method.title}</Title>
                        <Badge color="green" variant="light">
                          {method.price}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed" mb="xs">
                        {method.description}
                      </Text>
                      <Badge color="blue" variant="outline" size="sm">
                        {method.time}
                      </Badge>
                    </div>
                  </Group>

                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon size="sm" color="green" variant="light">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }>
                    {method.features.map((feature, idx) => (
                      <ListItem key={idx}>{feature}</ListItem>
                    ))}
                  </List>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          <Divider my="xl" />

          {/* Delivery Terms */}
          <Stack gap="md">
            <Title order={3}>Умови доставки</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <List
                  spacing="sm"
                  icon={
                    <ThemeIcon size="sm" color="blue" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }>
                  {/* <ListItem>
                    <Text fw={500}>Безкоштовна доставка</Text>
                    <Text size="sm" c="dimmed">
                      при замовленні від 1000 ₴
                    </Text>
                  </ListItem> */}
                  <ListItem>
                    <Text fw={500}>Холодовий ланцюг</Text>
                    <Text size="sm" c="dimmed">
                      збереження свіжості продуктів
                    </Text>
                  </ListItem>
                  {/* <ListItem>
                    <Text fw={500}>СМС-повідомлення</Text>
                    <Text size="sm" c="dimmed">
                      про відправку та надходження
                    </Text>
                  </ListItem> */}
                </List>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <List
                  spacing="sm"
                  icon={
                    <ThemeIcon size="sm" color="blue" variant="light">
                      <IconClock size={12} />
                    </ThemeIcon>
                  }>
                  {/* <ListItem>
                    <Text fw={500}>Відправка замовлень</Text>
                    <Text size="sm" c="dimmed">
                      щодня до 16:00
                    </Text>
                  </ListItem> */}
                  <ListItem>
                    <Text fw={500}>Зберігання на пошті</Text>
                    <Text size="sm" c="dimmed">
                      до 5 робочих днів
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text fw={500}>Гарантія якості</Text>
                    <Text size="sm" c="dimmed">
                      при дотриманні умов зберігання
                    </Text>
                  </ListItem>
                </List>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>

        {/* Payment Section */}
        <Paper p="xl" withBorder radius="md">
          {/* <Group align="center" mb="lg">
            <ThemeIcon size="xl" color="green" variant="light">
              <IconCreditCard size={24} />
            </ThemeIcon>
            <Title order={2}>Способи оплати</Title>
          </Group> */}

          {/* <Grid>
            {paymentMethods.map((method, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                <Card withBorder radius="md" h="100%" p="lg">
                  <Group align="flex-start" mb="md">
                    <ThemeIcon size="lg" color="green" variant="light">
                      <method.icon size={20} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Title order={4}>{method.title}</Title>
                        {method.badge && (
                          <Badge color="orange" variant="light" size="sm">
                            {method.badge}
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed" mb="md">
                        {method.description}
                      </Text>
                    </div>
                  </Group>

                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon size="sm" color="green" variant="light">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }>
                    {method.features.map((feature, idx) => (
                      <ListItem key={idx}>{feature}</ListItem>
                    ))}
                  </List>
                </Card>
              </Grid.Col>
            ))}
          </Grid> */}

          <Divider my="xl" />

          {/* Payment Security */}
          <Paper p="md" withBorder radius="md" bg="blue.0">
            <Group align="center" mb="md">
              <ThemeIcon color="blue" variant="light">
                <IconShield size={20} />
              </ThemeIcon>
              <Title order={4}>Безпека платежів</Title>
            </Group>
            <Text size="sm" c="dimmed">
              Всі онлайн-платежі захищені протоколом SSL та 3D Secure технологією. Ваші дані карти не
              зберігаються на наших серверах та передаються в зашифрованому вигляді безпосередньо до банку.
            </Text>
          </Paper>

          {/* Additional Info */}
          {/* <Stack gap="md" mt="xl">
            <Title order={3}>Додаткова інформація</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" withBorder radius="md">
                  <Title order={5} mb="sm">
                    Повернення товару
                  </Title>
                  <Text size="sm" c="dimmed">
                    Якщо товар не підійшов, ви можете повернути його протягом 14 днів з моменту отримання.
                    Товар має бути у оригінальній упаковці та не пошкодженим.
                  </Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" withBorder radius="md">
                  <Title order={5} mb="sm">
                    Гарантія якості
                  </Title>
                  <Text size="sm" c="dimmed">
                    Ми гарантуємо якість наших продуктів. У випадку отримання неякісного товару, ми повністю
                    компенсуємо витрати та замінимо товар.
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack> */}
        </Paper>

        {/* Contact Info */}
        {/* <Paper p="lg" withBorder radius="md" mt="xl" bg="gray.0">
          <Stack align="center" gap="sm">
            <Title order={4}>Маєте питання?</Title>
            <Text ta="center" c="dimmed">
              Наша служба підтримки працює щодня з 8:00 до 20:00
            </Text>
            <Group>
              <Text fw={500}>📞 +380 (67) 123-45-67</Text>
              <Text fw={500}>✉️ info@meatshop.ua</Text>
            </Group>
          </Stack>
        </Paper> */}
      </Container>
    </div>
  );
};

export default DeliveryAndPayment;
