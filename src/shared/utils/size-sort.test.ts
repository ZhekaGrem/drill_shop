// src/shared/utils/size-sort.test.ts
// Приклади використання функцій сортування розмірів

import { sortSizes, sortVariantsBySize, compareSizes } from './size-sort';

// Приклад 1: Сортування літерних розмірів
const letterSizes = ['L', 'XS', 'M', 'XXL', 'S', 'XL'];
console.log('Літерні розміри (до):', letterSizes);
console.log('Літерні розміри (після):', sortSizes(letterSizes));
// Очікуваний результат: ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Приклад 2: Сортування числових розмірів
const numberSizes = ['48', '46', '50', '47', '49'];
console.log('\nЧислові розміри (до):', numberSizes);
console.log('Числові розміри (після):', sortSizes(numberSizes));
// Очікуваний результат: ['46', '47', '48', '49', '50']

// Приклад 3: Сортування варіантів продукту
const mockVariants = [
  { id: '1', name: 'Розмір L', options: { size: 'L' } },
  { id: '2', name: 'Розмір XS', options: { size: 'XS' } },
  { id: '3', name: 'Розмір M', options: { size: 'M' } },
  { id: '4', name: 'Розмір XL', options: { size: 'XL' } },
];

console.log('\nВаріанти (до):');
mockVariants.forEach(v => console.log(`  - ${v.name}`));

const sorted = sortVariantsBySize(mockVariants);
console.log('Варіанти (після):');
sorted.forEach(v => console.log(`  - ${v.name}`));
// Очікуваний результат:
//   - Розмір XS
//   - Розмір M
//   - Розмір L
//   - Розмір XL
