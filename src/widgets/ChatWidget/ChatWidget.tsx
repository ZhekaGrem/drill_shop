// src/widgets/ChatWidget/ChatWidget.tsx
'use client';
import { IconMessageCircle, IconBrandTelegram, IconBrandInstagram, IconPhone } from '@tabler/icons-react';
import { ActionIcon, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import styles from './chatWidget.module.scss';

// Contact links - replace with real ones
const contactLinks = {
  telegram: 'https://t.me/yourusername',
  instagram: 'https://instagram.com/yourusername',
  phone: '+380123456789',
  email: 'info@yourstore.com',
};

export function ChatWidget() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {/* Floating chat button */}
      <ActionIcon
        className={styles.chatButton}
        size="xl"
        radius="50%"
        color="yellow"
        onClick={open}
        aria-label="Зв'язатися з консультантом">
        <IconMessageCircle size={28} />
      </ActionIcon>

      {/* Contact modal */}
      <Modal opened={opened} onClose={close} title="Зв'язатися з консультантом" centered size="sm">
        <Stack gap="md">
          <a href={contactLinks.telegram} rel="noopener noreferrer" target="_blank" className={styles.link}>
            <IconBrandTelegram size={20} /> Telegram
          </a>

          {/* Instagram */}

          <a href={contactLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <IconBrandInstagram size={20} /> Instagram
          </a>

          <a href={`tel:${contactLinks.phone}`} className={styles.link}>
            <IconPhone size={20} /> Зателефонувати
          </a>

          {/* Email */}
          {/* <Button
            component={Anchor}
            href={`mailto:${contactLinks.email}`}
            leftSection={<IconMail size={20} />}
            variant="outline"
            color="gray"
            fullWidth
          >
            Написати на пошту
          </Button> */}
        </Stack>
      </Modal>
    </>
  );
}
