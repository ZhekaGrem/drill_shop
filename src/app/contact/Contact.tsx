// src/app/contact/Contact.tsx
'use client';

import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { sendContactMessage } from '@/shared/api/contact';
import { HeroImageContact } from '@/widgets/HeroImage/HeroImage';
import { IconPhone, IconBrandInstagram, IconClock } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import styles from './contact.module.scss';
import { siteConfig } from '@/shared/config/site';

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
        value.trim().length < 5 ? 'Повідомлення повинно містити мінімум 10 символів' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);

    try {
      const result = await sendContactMessage(values);

      if (result.success) {
        setIsSubmitted(true);
        form.reset();

        notifications.show({
          title: 'Повідомлення надіслано!',
          message: 'Ми отримали ваше звернення і відповімо найближчим часом.',
          color: 'green',
          autoClose: 5000,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Помилка відправлення',
        message: error instanceof Error ? error.message : 'Спробуйте пізніше',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: IconPhone,
      title: 'Телефон',
      content: siteConfig.contacts.phone,
      link: 'tel:+380671234567',
    },
    {
      icon: IconBrandInstagram,
      title: 'Instagram',
      content: 'selo_ta_salo',
      link: siteConfig.socials.instagram,
    },
    {
      icon: IconClock,
      title: 'Режим роботи',
      content: 'Пн-Пт: 08:00 - 20:00\nСб-Нд: 09:00 - 18:00',
    },
  ];

  return (
    <>
      {/* Hero section like About page */}
      <HeroImageContact />

      {/* Contact cards - styled like home sections */}
      <section className={styles.infoSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Зв'язатися нами</h2>
          <div className={styles.infoGrid}>
            {contactInfo.map((item, index) => (
              <div key={index} className={styles.infoCard}>
                <item.icon size={32} className={styles.icon} />
                <h3>{item.title}</h3>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.content}
                  </a>
                ) : (
                  <p>{item.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form section - styled like other wide sections */}
      <section className={styles.formSection}>
        <div className={styles.formGrid}>
          <div className={styles.formInfo}>
            <h2>Написати нам</h2>
            <p>Заповніть форму і ми відповімо протягом робочого дня</p>

            <ul className={styles.benefits}>
              <li>✓ Безкоштовна консультація</li>
              <li>✓ Доставка по всій Україні</li>
              <li>✓ Гарантія якості</li>
              <li>✓ Індивідуальний підхід</li>
            </ul>
          </div>

          <div className={styles.formContainer}>
            {isSubmitted ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>✓</div>
                <h3>Дякуємо!</h3>
                <p className={styles.textForm}>Ми відповімо найближчим часом</p>
                <Button onClick={() => setIsSubmitted(false)}>Написати ще</Button>
              </div>
            ) : (
              <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Ім'я</label>
                    <input type="text" {...form.getInputProps('name')} />
                    {form.errors.name && <span className={styles.error}>{form.errors.name}</span>}
                  </div>

                  <div className={styles.field}>
                    <label>Телефон</label>
                    <input type="text" {...form.getInputProps('phone')} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Повідомлення</label>
                  <textarea rows={5} {...form.getInputProps('message')} />
                  {form.errors.message && <span className={styles.error}>{form.errors.message}</span>}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Надсилання...' : 'Надіслати'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
