import Link from 'next/link';
import styles from '../../../../shared/styles/productDetails.module.scss';

interface ProductHeaderProps {
  productName: string;
}

export const ProductHeader = ({ productName }: ProductHeaderProps) => {
  return (
    <>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadcrumbs__link}>
          Головна
        </Link>
        <span className={styles.breadcrumbs__separator}>›</span>
        <Link href="/catalog" className={styles.breadcrumbs__link}>
          Каталог
        </Link>
        <span className={styles.breadcrumbs__separator}>›</span>
        <span className={styles.breadcrumbs__current}>{productName}</span>
      </nav>

      {/* Product Title */}
      <h1 className={styles.productDetails__title}>{productName}</h1>
    </>
  );
};
