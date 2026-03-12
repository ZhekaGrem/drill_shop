import { Metadata } from 'next';
import Contact from './Contact';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Контакти',
  description: 'Контакти Drill shop. Телефон, email, адреса та графік роботи магазину.',
  alternates: {
    canonical: 'https://www.shchilnuidrill.com/contact',
  },
};

const page = () => {
  return (
    <>
      <Contact />
    </>
  );
};

export default page;
