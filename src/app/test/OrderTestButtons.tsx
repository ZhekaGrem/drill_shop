'use client';

import React from 'react';

const OrderTestButtons = () => {
  const orderData = {
    id: 'ORD-677365484',
    clientName: 'тест тест',
    phone: '+380938187709',
    total: 550,
    items: ['Ковбаса домашня x1 - 550 грн'],
    payment: 'Готівка при доставці',
    delivery: 'Нова Пошта: Київ, Відділення №1: вул. Пирогівський шлях, 135',
  };

  const generateMessage = () => {
    const itemsList = orderData.items.map((item) => `• ${item}`).join('\n');

    return `ЗАМОВЛЕННЯ: ${orderData.id}
Клієнт: ${orderData.clientName}
Телефон: ${orderData.phone}
Сума: ${orderData.total} грн
Оплата: ${orderData.payment}
Доставка: ${orderData.delivery}

Товари:
${itemsList}

Час: ${new Date().toLocaleString('uk-UA')}`;
  };

  const handleOrderClick = (messenger: 'viber' | 'whatsapp' | 'telegram') => {
    const text = generateMessage();
    const encodedText = encodeURIComponent(text);
    const managerPhone = '380938187709';

    let url = '';

    if (messenger === 'viber') {
      url = `viber://chat?number=%2B${managerPhone}&draft=${encodedText}`;
    } else if (messenger === 'whatsapp') {
      url = `https://wa.me/${managerPhone}?text=${encodedText}`;
    } else if (messenger === 'telegram') {
      url = `https://t.me/+${managerPhone}?text=${encodedText}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px dashed red',
        margin: '20px 0',
        background: '#fff0f0',
        borderRadius: '8px',
      }}>
      <h3 style={{ marginTop: 0, color: '#c00' }}>ТЕСТОВА ПАНЕЛЬ (PROD TEST)</h3>
      <p style={{ fontSize: '14px', marginBottom: '15px' }}>
        Натисніть, щоб перевірити передачу тексту замовлення в месенджер.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleOrderClick('viber')}
          style={{
            backgroundColor: '#7360f2',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
          }}>
          Замовити через Viber
        </button>

        <button
          onClick={() => handleOrderClick('whatsapp')}
          style={{
            backgroundColor: '#25D366',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
          }}>
          Замовити через WhatsApp
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        *Примітка: Якщо Viber не відкривається на ПК, значить він не встановлений. Якщо на iPhone відкрився
        пустий чат — це обмеження iOS.
      </p>
    </div>
  );
};

export default OrderTestButtons;
