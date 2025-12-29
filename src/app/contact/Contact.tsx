// src/app/contact/Contact.tsx
'use client';

import { useState } from 'react';
import { showNotification } from '@/shared/utils/notifications';
import { useForm } from '@mantine/form';
import { sendContactMessage } from '@/shared/api/contact';
import { IconTelegram, IconInstagram, IconPhone } from '@/shared/components/Svg';
import { Button } from '@/shared/components/Button/Button';
import styles from './contact.module.scss';
import { siteConfig } from '@/shared/config/site';
import Image from 'next/image';
import { Container } from '@mantine/core';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      message: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Ім'я повинно містити мінімум 2 символи" : null),
      message: (value) =>
        value.trim().length < 10 ? 'Повідомлення повинно містити мінімум 10 символів' : null,
    },
  });

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!form.values.phone || form.values.phone.trim() === '') {
      form.setFieldValue('phone', '+380');
      setTimeout(() => {
        if (e.target) {
          e.target.setSelectionRange(4, 4);
        }
      }, 0);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+380')) {
      value = '+380';
    }
    form.setFieldValue('phone', value);
  };

  const handlePhoneBlur = () => {
    if (form.values.phone === '+380') {
      form.setFieldValue('phone', '');
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);

    try {
      const result = await sendContactMessage(values);

      if (result.success) {
        setIsSubmitted(true);
        form.reset();

        showNotification({
          title: 'Повідомлення надіслано!',
          message: 'Ми отримали ваше звернення і відповімо найближчим часом.',
          color: 'green',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Помилка відправлення',
        message: error instanceof Error ? error.message : 'Спробуйте пізніше',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Заголовок */}
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>ЗВОРОТНІЙ ЗВ'ЯЗОК</h1>
      </div>

      {/* Зелена полоска */}
      <div className={styles.greenDivider} />

      {/* Секція: верх - картинка + форма, низ - 3 значки */}
      <section className={styles.mainSection}>
        {/* Картинка */}
        <div className={styles.imageContainer}>
          <Image
            src="/assets/img/bg/contact.png"
            alt="Контакти"
            fill
            className={styles.contactImage}
            priority
          />
        </div>

        {/* Форма */}
        <div className={styles.formContainer}>
          {isSubmitted ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <h3>Дякуємо!</h3>
              <p>Ми відповімо найближчим часом</p>
              <Button onClick={() => setIsSubmitted(false)}>Написати ще</Button>
            </div>
          ) : (
            <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
              <div className={styles.field}>
                <label>Ім'я</label>
                <input type="text" placeholder="Ваше ім'я" {...form.getInputProps('name')} />
                {form.errors.name && <span className={styles.error}>{form.errors.name}</span>}
              </div>

              <div className={styles.field}>
                <label>Телефон</label>
                <input
                  type="tel"
                  placeholder="+380 (XX) XXX XX XX"
                  value={form.values.phone}
                  onChange={handlePhoneChange}
                  onFocus={handlePhoneFocus}
                  onBlur={handlePhoneBlur}
                />
                {form.errors.phone && <span className={styles.error}>{form.errors.phone}</span>}
              </div>

              <div className={styles.field}>
                <label>Повідомлення</label>
                <textarea rows={6} placeholder="Опишіть питання" {...form.getInputProps('message')} />
                {form.errors.message && <span className={styles.error}>{form.errors.message}</span>}
              </div>

              <Button type="submit" disabled={isSubmitting} fullWidth>
                {isSubmitting ? 'Надсилання...' : 'ВІДПРАВити'}
              </Button>
            </form>
          )}
        </div>

        {/* Значки внизу */}
        <a
          href={siteConfig.socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactCard}>
          <IconInstagram size={25} />
          <span>Instagram</span>
        </a>

        <a
          href={siteConfig.socials.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactCard}>
          <IconTelegram size={25} />
          <span>Telegram</span>
        </a>

        <a href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`} className={styles.contactCard}>
          <IconPhone size={25} />
          <span>{siteConfig.contacts.phone}</span>
        </a>
      </section>
    </>
  );
};

export default Contact;
