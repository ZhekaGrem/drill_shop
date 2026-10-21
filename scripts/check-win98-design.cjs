const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require(process.cwd() + '/node_modules/typescript');
const cache = new Map();
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
console.log('PASS: Windows 95/98 registered, default auto, explicit choices, first paint, animation, theme');
