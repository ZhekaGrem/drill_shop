import PublicOffer from './PublicOffer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Договір публічної оферти | Selo ta Salo',
  description:
    'Договір публічної оферти інтернет-магазину Selo ta Salo. Умови продажу товарів, оплати, доставки та повернення.',
  openGraph: {
    title: 'Договір публічної оферти | Selo ta Salo',
    description:
      'Договір публічної оферти інтернет-магазину Selo ta Salo. Умови продажу товарів, оплати, доставки та повернення.',
  },
};

const page = () => {
  return (
    <>
      <PublicOffer />
    </>
  );
};

export default page;
