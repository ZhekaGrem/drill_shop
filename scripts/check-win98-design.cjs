const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require(process.cwd() + '/node_modules/typescript');
const cache = new Map();
// Windows 98 — дизайн локального перегляду (NEXT_PUBLIC_DESIGN_PREVIEW=win98); без змінної — продакшн із ротацією
let env = { NEXT_PUBLIC_DESIGN_PREVIEW: 'win98' };
const document = { documentElement: { getAttribute: () => 'win98' } };
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename);
  const result = {};
  cache.set(filename, result);
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports: result,
      document,
      process: { env },
      window: { matchMedia: () => ({ matches: true }) },
      require: (relative) => load(path.resolve(path.dirname(filename), relative + '.ts')),
    }
  );
  return result;
}
const design = load('src/shared/config/design.ts');
const rotation = load('src/shared/config/design-rotation.ts');
const theme = load('src/shared/config/theme.ts');
const animation = load('src/shared/config/animation.ts');
assert.ok(design.DESIGN_IDS.includes('win98'), 'Windows 95/98 must be a selectable design');
assert.equal(design.resolveDesign('auto', Date.now()), 'win98', 'Auto starts in the requested design');
assert.equal(design.resolveDesign('diia', Date.now()), 'diia', 'Explicit choices still work');
assert.equal(animation.animationForDesign('win98'), 'showcase');
assert.equal(theme.autoTheme(), 'light', 'Classic desktop defaults to its original light controls');
const boot = { ds: 'diia' };
vm.runInNewContext(rotation.rotationSnippet(), boot);
assert.equal(boot.ds, 'win98', 'First paint and React must resolve to the same design');
cache.clear();
env = {};
const prodRotation = load('src/shared/config/design-rotation.ts');
const prodDesign = load('src/shared/config/design.ts');
assert.equal(prodRotation.ROTATION_ENABLED, true, 'Production rotates the pre-Windows designs');
assert.notEqual(
  prodDesign.resolveDesign('auto', Date.now()),
  'win98',
  'Production does not start in Windows 98'
);
const prodBoot = { ds: 'diia' };
vm.runInNewContext(prodRotation.rotationSnippet(), prodBoot);
assert.ok(
  prodRotation.ROTATION_ORDER.includes(prodBoot.ds),
  'Production first paint picks a rotation design'
);
console.log(
  'PASS: Windows 95/98 registered, local preview auto, explicit choices, first paint, animation, theme; production rotation'
);
