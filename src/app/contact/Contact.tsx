// src/app/contact/Contact.tsx
'use client';

import { useState } from 'react';
import { showNotification } from '@/shared/utils/notifications';
import { useForm } from '@mantine/form';
import { sendContactMessage } from '@/shared/api/contact';
import { IconTelegram, IconInstagram, IconPhone } from '@/shared/components/Svg';
import { IconClock, IconMail } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { Input, PhoneInput, TextareaField } from '@/shared/components/Input';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import styles from './contact.module.scss';
import { siteConfig } from '@/shared/config/site';
import Image from 'next/image';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Явний генерик: без нього Mantine не виводить тип полів і `value` у validate
  // стає implicit any — це ламало `npm run build` (ignoreBuildErrors: false)
  const form = useForm<{ name: string; phone: string; message: string }>({
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
    <Page>
      <PageHeader
        title="Зворотний зв'язок"
        description="Напишіть нам про замовлення, наявність або розміри — відповідаємо в робочі години."
      />

      {/* Картинка і форма — дві білі поверхні поруч, без внутрішніх меж */}
      <section className={styles.mainSection}>
        <div className={styles.imageContainer}>
          <Image
            src="/assets/img/bg/contact.png"
            alt="Контакти"
            fill
            className={styles.contactImage}
            priority
          />
        </div>

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
              <div className={styles.fields}>
                <Input label="Ім'я" placeholder="Ваше ім'я" {...form.getInputProps('name')} />

                {/* PhoneInput сам тримає префікс +380: раніше та сама логіка
                    жила ще й тут трьома локальними хендлерами. */}
                <PhoneInput
                  label="Телефон"
                  value={form.values.phone}
                  onChange={(value) => form.setFieldValue('phone', value)}
                  error={form.errors.phone as string}
                />

                <TextareaField
                  label="Повідомлення"
                  placeholder="Опишіть питання"
                  rows={6}
                  {...form.getInputProps('message')}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} fullWidth>
                {isSubmitting ? 'Надсилання...' : 'Відправити'}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Канали звʼязку — список Дії замість сітки з nth-child і !important */}
      <Section title="Інші канали">
        <ListGroup>
          <ListRow
            external
            href={siteConfig.socials.instagram}
            media={<IconInstagram />}
            title="Instagram"
            hint="Нові дропи, бекстейдж і анонси"
          />
          <ListRow
            external
            href={siteConfig.socials.telegram}
            media={<IconTelegram />}
            title="Telegram"
            hint="Найшвидша відповідь щодо замовлення"
          />
          <ListRow
            href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`}
            media={<IconPhone />}
            title="Телефон"
            hint={siteConfig.contacts.phone}
          />
          <ListRow
            href={`mailto:${siteConfig.contacts.email}`}
            media={<IconMail stroke={1.5} />}
            title="Пошта"
            hint={siteConfig.contacts.email}
          />
          <ListRow media={<IconClock stroke={1.5} />} title="Графік" hint={siteConfig.workingHours} />
        </ListGroup>
      </Section>
    </Page>
  );
};

export default Contact;
