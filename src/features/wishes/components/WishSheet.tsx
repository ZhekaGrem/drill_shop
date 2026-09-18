// src/features/wishes/components/WishSheet.tsx
// Шторка «Що нам ще розробити?» (спека 2026-09-17-wishes-chat-slot-design).
// Стани: idle → sending → sent | error. Уся реакція — всередині шторки,
// тостів нема. Єдина клієнтська перевірка — непорожній текст; решту лімітів
// тримає сервер. Закриття в будь-якому стані очищає форму: при наступному
// відкритті — знову idle (чернетки поза межами).
// Автофокусу на текстове поле нема: на телефоні він одразу підіймає
// клавіатуру і смикає шторку.
'use client';

import { FormEvent, useState } from 'react';
import { Sheet } from '@/shared/components/Sheet';
import { Input, TextareaField } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button/Button';
import { content } from '@/shared/config/content';
import { wishesApi } from '../api/wishes-api';
import { WishError, WishSent } from './WishSheetResult';
import styles from './WishSheet.module.scss';

interface WishSheetProps {
  opened: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const MESSAGE_MIN = 3;
const MESSAGE_MAX = 1000;
const CONTACT_MAX = 100;

export function WishSheet({ opened, onClose }: WishSheetProps) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [messageError, setMessageError] = useState<string | null>(null);

  const close = () => {
    setMessage('');
    setContact('');
    setWebsite('');
    setStatus('idle');
    setMessageError(null);
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (text.length < MESSAGE_MIN) {
      setMessageError(content.wishes.messageError);
      return;
    }
    setMessageError(null);
    setStatus('sending');
    try {
      await wishesApi.sendWish({
        message: text,
        contact: contact.trim() || undefined,
        page: window.location.pathname,
        website,
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const busy = status === 'sending';

  return (
    <Sheet opened={opened} onClose={close} title={content.wishes.title}>
      {status === 'sent' ? (
        <WishSent onDone={close} />
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          <p className={styles.hint}>{content.wishes.hint}</p>
          <TextareaField
            label={content.wishes.messageLabel}
            placeholder={content.wishes.messagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            error={messageError}
            autosize
            minRows={3}
            maxRows={6}
            maxLength={MESSAGE_MAX}
            disabled={busy}
          />
          <Input
            label={content.wishes.contactLabel}
            placeholder={content.wishes.contactPlaceholder}
            value={contact}
            onChange={(e) => setContact(e.currentTarget.value)}
            maxLength={CONTACT_MAX}
            autoComplete="tel"
            disabled={busy}
          />
          {/* Honeypot: людина його не бачить (.sr-only з globals.css) і не
              дістає табом; бот заповнює — роут відповідає «успіх» і мовчить */}
          <input
            className="sr-only"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.currentTarget.value)}
          />
          <Button type="submit" variant="primary" fullWidth loading={busy}>
            {content.wishes.submit}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={close} disabled={busy}>
            {content.wishes.close}
          </Button>
          {status === 'error' && <WishError />}
        </form>
      )}
    </Sheet>
  );
}
