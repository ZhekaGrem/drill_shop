// src/config/site.ts
import { assets } from './assets';

export const siteConfig = {
  name: 'shchilnui Drill',
  fullName: 'Магазин мерчу топових музиків shchilnui Drill',
  description: 'Найкраща якість мерчу вашого столу.',
  url: 'https://shchilnuidrill.com',
  contacts: {
    phone: '+38 (093) 000000000',
    phone2: '+380 (093) 0000000',
    email: 'info@meatshop.ua',
    address: 'вул. Дрілл, 123, м. Львів, 79000',
    city: 'Львів',
    country: 'Україна',
  },
  socials: {
    instagram: 'https://www.instagram.com/r4zyob',
    telegram: 'https://t.me/shchilnuidrill?direct',
  },
  workingHours: 'Пн-Пт: 08:00 - 20:00 | Сб-Нд: 09:00 - 18:00',
  logo: assets.logo.main,
};

export const footerLinks = [
  { link: '/contact', label: 'Контакти' },
  { link: '/public-offer', label: 'Публічна оферта' },
  { link: '/privacy-policy', label: 'Конфіденційність' },
  { link: '/delivery-and-payment', label: 'Доставка і оплата' },
  { link: '/returns-exchanges', label: 'Повернення' },
  { link: '/faq', label: 'FAQ' },
];

// Категорії для футера
export const footerCategories = [
  { link: '/catalog?categoryId=cmf5vl97x0005jh2ex97db97l', label: 'Сало' },
  { link: '/catalog?categoryId=cmf6y0qoy0007eu1xoo58ecb5', label: 'Птиця' },
  { link: '/catalog?categoryId=cmf5vk71r0001jh2eyhkyt1bw', label: 'Ковбасні вироби' },
  { link: '/catalog?categoryId=cmgqwczj20008kv8ujp98ysfc', label: 'Соуси' },
];
