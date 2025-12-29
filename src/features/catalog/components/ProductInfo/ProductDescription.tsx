import { sanitizeHTML } from '@/shared/utils/sanitize';
import styles from '../../../../shared/styles/productDetails.module.scss';

interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  if (!description) return null;

  return (
    <div className={styles.productDescription}>
      <h2 className={styles.productDescription__title}>Опис </h2>
      <div className={styles.productDescription__content} dangerouslySetInnerHTML={{ __html: sanitizeHTML(description) }} />
    </div>
  );
};
