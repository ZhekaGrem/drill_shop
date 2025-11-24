'use client';

import { ImageTextSection } from '@/shared/components/ImageTextSection/ImageTextSection';
import { content } from '@/shared/config/content';
import { assets } from '@/shared/config/assets';
const About = () => {
  return (
    <>
      <ImageTextSection
        imageSrc={assets.about.sections.section1}
        imageAlt="Про нас"
        imagePosition="left"
        title={content.about.sections.story.title}
        titleColor="secondary"
        description={content.about.sections.story.description}
      />

      <ImageTextSection
        imageSrc={assets.about.sections.section2}
        imageAlt="Доставка з ферми"
        imagePosition="right"
        title={content.about.sections.freshness.title}
        titleColor="green"
        description={content.about.sections.freshness.description}
      />

      <ImageTextSection
        imageSrc={assets.about.sections.section3}
        imageAlt="Гарантія якості"
        imagePosition="left"
        title={content.about.sections.quality.title}
        titleColor="primary"
        description={content.about.sections.quality.description}
      />

      <ImageTextSection
        imageSrc={assets.about.sections.section4}
        imageAlt="Сервіс з душею"
        imagePosition="right"
        title={content.about.sections.service.title}
        titleColor="yellow"
        description={content.about.sections.service.description}
      />

      <ImageTextSection
        imageSrc={assets.about.sections.section5}
        imageAlt="Досвід поколінь"
        imagePosition="left"
        title={content.about.sections.experience.title}
        titleColor="secondary"
        description={content.about.sections.experience.description}
        buttonText={content.about.sections.experience.buttonText}
        buttonHref="/contact"
      />
    </>
  );
};

export default About;
