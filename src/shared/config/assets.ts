// src/shared/config/assets.ts
// Централізоване сховище посилань на зображення

export const assets = {
  // ===== ЛОГОТИПИ =====
  logo: {
    main: '/logo/logo2.webp',
    og: '/logo/logo.jpg', // для Open Graph
    favicon: '/assets/favicon/favicon.ico',
    appleTouchIcon: '/assets/favicon/apple-touch-icon.png',
  },

  // ===== ІКОНКИ СОЦІАЛЬНИХ МЕРЕЖ =====
  social: {
    youtube: '/svg/youtube.svg',
    tiktok: '/svg/tiktok.svg',
    instagram: '/svg/instagram.svg',
    threads: '/svg/threads.svg',
  },

  // ===== ГОЛОВНА СТОРІНКА =====
  home: {
    sections: {
      sausages: '/assets/img/sausages.png',
      ribs: '/assets/img/ribs.png',
    },
  },

  // ===== СТОРІНКА "ПРО НАС" =====
  about: {
    sections: {
      section1: '/assets/img/about/section-1.png',
      section2: '/assets/img/about/section-2.png',
      section3: '/assets/img/about/section-3.png',
      section4: '/assets/img/about/section-4.png',
      section5: '/assets/img/about/section-5.png',
    },
  },

  // ===== ПЛЕЙСХОЛДЕРИ =====
  placeholders: {
    product: '/assets/img/placeholder-product.jpg',
    user: '/assets/img/placeholder-user.png',
    noImage: '/assets/img/placeholder-product.jpg',
  },
};

export type Assets = typeof assets;
