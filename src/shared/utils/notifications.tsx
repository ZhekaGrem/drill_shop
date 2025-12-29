// src/shared/utils/notifications.tsx
import { notifications, NotificationData } from '@mantine/notifications';
import { IconX } from '@/shared/components/Svg';

/**
 * Обгортка для notifications.show з автоматичним додаванням IconX
 * Використовуйте замість прямого виклику notifications.show
 */
export const showNotification = (data: Omit<NotificationData, 'closeButtonProps'> & {
  closeButtonProps?: NotificationData['closeButtonProps'];
}) => {
  notifications.show({
    withCloseButton: true,
    autoClose: 3000,
    color: 'rgba(255, 255, 255, 0)',
    ...data,
    closeButtonProps: {
      icon: <IconX />,
      ...data.closeButtonProps,
    },
  });
};

// Re-export інших методів з notifications для зручності
export const hideNotification = notifications.hide;
export const cleanNotifications = notifications.clean;
export const updateNotification = notifications.update;
