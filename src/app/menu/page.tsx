import { Metadata } from 'next';
import MenuScreen from './MenuScreen';

export const metadata: Metadata = {
  title: 'Кабінет',
  description: 'Профіль, замовлення, доставка, повернення та звʼязок з магазином Є.Дріл.',
  alternates: {
    canonical: 'https://www.ye-dril.com/menu',
  },
  // Службовий екран навігації — дублює розділи, які вже є в індексі
  robots: { index: false, follow: true },
};

const page = () => <MenuScreen />;

export default page;
