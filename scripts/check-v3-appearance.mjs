// Regression checks: first-paint script and runtime preferences must agree.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import vm from 'node:vm';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.includes('/shared/config/') &&
      specifier.startsWith('./') &&
      !specifier.endsWith('.ts')
    ) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
const { appearanceBootScript } = await import('../src/shared/config/appearance-boot.ts');
const design = await import('../src/shared/config/design.ts');
const { autoTheme } = await import('../src/shared/config/theme.ts');
let checked = 0;
for (const savedDesign of [null, 'invalid', ...design.DESIGN_IDS]) {
  for (const savedTheme of [null, 'invalid', 'light', 'dark']) {
    for (const systemDark of [false, true]) {
      const attrs = new Map([['data-design', design.DESIGN_FALLBACK]]);
      const document = {
        documentElement: {
          setAttribute: (name, value) => attrs.set(name, value),
          removeAttribute: (name) => attrs.delete(name),
          getAttribute: (name) => attrs.get(name) ?? null,
        },
      };
      const localStorage = { getItem: (key) => (key === 'design' ? savedDesign : savedTheme) };
      const matchMedia = () => ({ matches: systemDark });
      const context = { document, localStorage, matchMedia, Date };
      vm.runInNewContext(appearanceBootScript, context);
      globalThis.document = document;
      globalThis.localStorage = localStorage;
      globalThis.window = { matchMedia };
      const expectedDesign = design.resolveDesign(design.readDesignChoice(), Date.now());
      assert.equal(design.readDesignAttr(), expectedDesign);
      const expectedTheme = ['light', 'dark'].includes(savedTheme) ? savedTheme : autoTheme();
      assert.equal(attrs.get('data-theme'), expectedTheme);
      assert.equal(attrs.get('data-mantine-color-scheme'), expectedTheme);
      design.applyDesign('diia');
      assert.equal(design.readDesignAttr(), 'diia');
      design.applyDesign('editorial');
      assert.equal(design.readDesignAttr(), 'editorial');
      checked++;
    }
  }
}
// Restricted storage must leave the SSR default usable, not throw.
vm.runInNewContext(appearanceBootScript, {
  document: { documentElement: {} },
  localStorage: {
    getItem() {
      throw new Error('Storage unavailable');
    },
  },
});
// Check contrast of the authored text/surface pairs in both palettes.
const css = readFileSync(new URL('../src/app/v3.css', import.meta.url), 'utf8');
function luminance(hex) {
  const rgb = hex.match(/[a-f0-9]{2}/gi).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
for (const block of css.matchAll(
  /html\[data-design='editorial'\](?:\[data-theme='dark'\])?\s*\{([^}]+)\}/g
)) {
  const tokens = Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+): (#[a-f0-9]{6});/g)].map((match) => [match[1], match[2]])
  );
  if (!tokens['surface-card']) continue;
  for (const foreground of ['text-primary', 'text-secondary', 'text-tertiary', 'accent']) {
    for (const background of ['background-base', 'surface-card']) {
      const values = [luminance(tokens[foreground]), luminance(tokens[background])].sort((a, b) => b - a);
      assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, `${foreground}/${background} contrast`);
    }
  }
  const values = [luminance(tokens['btn-primary']), luminance(tokens['btn-primary-fg'])].sort(
    (a, b) => b - a
  );
  assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, 'Primary CTA contrast');
}
console.log(`ok - ${checked} appearance combinations, legacy switching, blocked storage, palette contrast`);
