// ШАБЛОН сід-скрипта для БЕКЕНД-репозиторію (Express/Prisma/Cloudinary).
// Запускати ПІСЛЯ міграції з docs/superpowers/specs/2026-08-13-collections-db-design.md.
//
// Env: DATABASE_URL (як у бекенда), CLOUDINARY_URL (або трійка ключів),
//      FRONTEND_DIR — шлях до чекаута drill_shop (звідти беруться файли).
// Запуск: FRONTEND_DIR=/шлях/до/drill_shop node seed.template.cjs
//
// Скрипт ідемпотентний: колекції upsert-яться по slug, texture/render не
// перезаливаються, якщо поля вже заповнені (перезапуск безпечний).
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const FRONTEND_DIR = process.env.FRONTEND_DIR;
if (!FRONTEND_DIR) throw new Error('FRONTEND_DIR не заданий (шлях до drill_shop)');
const mapping = require(path.join(FRONTEND_DIR, 'seed/collections-3d/mapping.json'));

const prisma = new PrismaClient();

const upload = (file, folder) =>
  cloudinary.uploader.upload(path.join(FRONTEND_DIR, file), { folder, resource_type: 'image' });

(async () => {
  for (const col of mapping.collections) {
    const collection = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {
        title: col.title,
        description: col.description,
        sortOrder: col.sortOrder,
        heroEnabled: col.heroEnabled,
      },
      create: {
        slug: col.slug,
        title: col.title,
        description: col.description,
        sortOrder: col.sortOrder,
        heroEnabled: col.heroEnabled,
      },
    });
    console.log('колекція:', collection.slug);

    for (const item of col.products) {
      const product = await prisma.product.findUnique({
        where: { slug: item.productSlug },
        include: { images: true },
      });
      if (!product) {
        console.warn('  ПРОПУЩЕНО (нема товару):', item.productSlug);
        continue;
      }

      // Текстура: заливаємо лише якщо поле порожнє
      let textureFields = {};
      if (!product.texture3dUrl && item.textureFile) {
        const tex = await upload(item.textureFile, 'products/3d-textures');
        textureFields = { texture3dUrl: tex.secure_url, texture3dPublicId: tex.public_id };
        console.log('  текстура залита:', item.productSlug);
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          collectionId: collection.id,
          collectionOrder: item.collectionOrder,
          model3dPath: item.model3dPath,
          switcherSwatch: item.switcherSwatch,
          ...textureFields,
        },
      });

      // Рендер-мініатюра (kind='render3d'): одна на товар
      const hasRender = product.images.some((img) => img.kind === 'render3d');
      if (!hasRender && item.renderFile) {
        const render = await upload(item.renderFile, 'products/3d-renders');
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: render.secure_url,
            publicId: render.public_id,
            kind: 'render3d',
            sortOrder: 999,
            isPrimary: false,
            isSecondary: false,
          },
        });
        console.log('  рендер залитий:', item.productSlug);
      }
      console.log('  зв’язано:', item.productSlug, '→', col.slug, '#' + item.collectionOrder);
    }
  }
  await prisma.$disconnect();
  console.log('ГОТОВО');
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
