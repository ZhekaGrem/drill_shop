import { Metadata } from 'next';
import PrivacyPolicy from './PrivacyPolicy';

export const metadata: Metadata = {
  title: 'Політика конфіденційності',
  description: 'Політика конфіденційності та обробки персональних даних Drill shop.',
  alternates: {
    canonical: 'https://www.shchilnuidrill.com/privacy-policy',
  },
};

const page = () => {
  return (
    <>
      <PrivacyPolicy />
    </>
  );
};

export default page;
