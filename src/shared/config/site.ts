// src/config/site.ts
import { assets } from './assets';

export const siteConfig = {
  name: 'Selo ta Salo',
  fullName: "Магазин м'ясних виробів Selo ta Salo",
  description: "Найкраща якість м'ясних продуктів від ферми до вашого столу.",
  url: 'https://selotasalo.com.ua',
  contacts: {
    phone: '+380 (93) 046 58 11',
    phone2: '+380 (93) 396 74 59',
    email: 'info@meatshop.ua',
    address: "вул. М'ясна, 123, м. Львів, 79000",
    city: 'Львів',
    country: 'Україна',
  },
  socials: {
    tiktok: 'https://www.tiktok.com/@selo_ta_salo',
    instagram: 'https://www.instagram.com/selo_ta_salo',
    youtube: 'https://www.youtube.com/@selotasalo',
    threads: 'https://www.threads.com/@selo_ta_salo?xmt=AQF0LiblIcaHHQNzKwSFpAJd1OK7xv_-fJlIuxKkpSLFzK4',
    telegram: 'https://t.me/selo_ta_salo',
  },
  workingHours: 'Пн-Пт: 08:00 - 20:00 | Сб-Нд: 09:00 - 18:00',
  logo: assets.logo.main,
};

export const footerLinks = [
  { link: '/contact', label: 'Контакти' },
  { link: '/public-offer', label: 'Публічна оферта' },
  { link: '/privacy-policy', label: 'Конфіденційність' },
  { link: '/delivery-and-payment', label: 'Доставка і оплата' },
  // { link: '/returns-exchanges', label: 'Повернення' },
  { link: '/faq', label: 'FAQ' },
];

// Категорії для футера
export const footerCategories = [
  { link: '/catalog?categoryId=cmf5vl97x0005jh2ex97db97l', label: 'Сало' },
  { link: '/catalog?categoryId=cmf6y0qoy0007eu1xoo58ecb5', label: 'Птиця' },
  { link: '/catalog?categoryId=cmf5vk71r0001jh2eyhkyt1bw', label: 'Ковбасні вироби' },
  { link: '/catalog?categoryId=cmgqwczj20008kv8ujp98ysfc', label: 'Соуси' },
];
