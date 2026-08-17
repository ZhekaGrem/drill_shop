// Фірмовий завантажувальний екран: «Є.ДРІЛ» з переливом бренд-градієнта,
// смужка-бігунок і «щільно вантажимось…». Обраний власником варіант
// «Градієнтний логотип» з галереї /v2/loaders (там він і показується —
// тим самим компонентом, щоб прев'ю ніколи не розходилось з продом).
import styles from './SiteLoader.module.scss';

// fill — режим «заповни батьківський контейнер» для прев'ю в /v2/loaders:
// без min-height повної сторінки. Варіант живе в цьому ж модулі, щоб
// перекриття не залежало від порядку CSS-чанків у бандлі.
export const SiteLoader = ({ fill }: { fill?: boolean }) => (
  <div className={fill ? `${styles.loader} ${styles.fill}` : styles.loader} role="status">
    <div className={styles.stack}>
      <span className={styles.logo}>Є.ДРІЛ</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.runner} />
      </span>
      <span className={styles.caption}>щільно вантажимось…</span>
    </div>
  </div>
);
