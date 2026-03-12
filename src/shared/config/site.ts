// src/config/site.ts
import { assets } from './assets';

export const siteConfig = {
  name: 'shchilnui Drill',
  fullName: 'Магазин мерчу топових музиків shchilnui Drill',
  description: 'Офіційний магазин мерчу. Футболки, худі та аксесуари з доставкою по Україні.',
  url: 'https://www.shchilnuidrill.com',
  contacts: {
    phone: '+38 (093) 000000000',
    phone2: '+380 (093) 0000000',
    email: 'team@shchilnuidrill.com',
    address: 'вул. Дрілл, 123, м. Львів, 79000',
    city: 'Львів',
    country: 'Україна',
  },
  socials: {
    instagram: 'https://www.instagram.com/r4zyob',
    telegram: 'https://t.me/makaron_gang?direct',
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
  { link: '/catalog?category=t-shirt', label: 'Футболки' },
  { link: '/catalog?category=buba', label: 'Худі' },
  { link: '/catalog?category=size', label: 'Аксесуари' },
];
