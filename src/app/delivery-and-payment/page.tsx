import { Metadata } from 'next';
import DeliveryAndPayment from './DeliveryAndPayment';

export const metadata: Metadata = {
  title: 'Доставка та оплата',
  description: 'Умови доставки Новою Поштою та способи оплати в Є.Дріл. Відправка за 3-7 днів по Україні.',
  alternates: {
    canonical: 'https://www.ye-dril.com/delivery-and-payment',
  },
};

const page = () => {
  return <DeliveryAndPayment />;
};

export default page;
