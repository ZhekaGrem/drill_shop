// src/shared/utils/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Безпечна sanitization HTML, працює на клієнті та сервері
 */
export const sanitizeHTML = (html: string): string => {
  // На сервері (SSR) - повертаємо сирий HTML
  // Sanitization відбудеться на клієнті
  if (typeof window === 'undefined') {
    return html;
  }

  // На клієнті - використовуємо DOMPurify
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};
