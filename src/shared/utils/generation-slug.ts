export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[іїє]/g, 'i')
    .replace(/[ґ]/g, 'g')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};
