import Image from 'next/image';
import styles from './productGallery.module.scss';

interface ImageNavigationProps {
  imagesCount: number;
  selectedIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
}

export const ImageNavigation = ({
  imagesCount,
  selectedIndex,
  onPrevious,
  onNext,
  onDotClick,
}: ImageNavigationProps) => {
  if (imagesCount <= 1) return null;

  return (
    <>
      {/* Стрілочки навігації */}
      <button
        className={`${styles.productGallery__arrow} ${styles.productGallery__arrowLeft}`}
        onClick={onPrevious}
        aria-label="Попереднє зображення">
        <Image src="/svg/pixelarticons_arrow-left-box.svg" alt="Попереднє" width={24} height={24} />
      </button>
      <button
        className={`${styles.productGallery__arrow} ${styles.productGallery__arrowRight}`}
        onClick={onNext}
        aria-label="Наступне зображення">
        <Image src="/svg/pixelarticons_arrow-right-box.svg" alt="Наступне" width={24} height={24} />
      </button>

      {/* Dots для навігації */}
      <div className={styles.productGallery__dots}>
        {Array.from({ length: imagesCount }).map((_, index) => (
          <button
            key={index}
            className={`${styles.productGallery__dot} ${
              index === selectedIndex ? styles.productGallery__dotActive : ''
            }`}
            onClick={() => onDotClick(index)}
            aria-label={`Зображення ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
};
