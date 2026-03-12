import { Metadata } from 'next';
import DeliveryAndPayment from './DeliveryAndPayment';

export const metadata: Metadata = {
  title: 'Доставка та оплата',
  description: 'Умови доставки Новою Поштою та способи оплати в Drill shop. Доставка 1-2 робочі дні по Україні.',
  alternates: {
    canonical: 'https://www.shchilnuidrill.com/delivery-and-payment',
  },
};

const page = () => {
  return <DeliveryAndPayment />;
};

export default page;
