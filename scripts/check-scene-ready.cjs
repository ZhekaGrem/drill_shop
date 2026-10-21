const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = process.cwd();
const ts = require(path.join(root, 'node_modules/typescript'));
const source = path.join(root, 'src/widgets/HeroVisual/useSceneReady.ts');
assert.ok(fs.existsSync(source), 'A frame-based readiness hook must exist');
let frame;
const refs = [];
let cursor = 0;
const hookExports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } })
    .outputText,
  {
    exports: hookExports,
    require(name) {
      if (name === 'react')
        return {
          useRef(initial) {
            const i = cursor++;
            return refs[i] ?? (refs[i] = { current: initial });
          },
        };
      if (name === '@react-three/fiber')
        return {
          useFrame(fn) {
            frame = fn;
          },
        };
      throw new Error(name);
    },
  }
);
const render = (ready, callback) => {
  cursor = 0;
  hookExports.useSceneReady(ready, callback);
};
let a = 0,
  b = 0;
const onA = () => a++;
const onB = () => b++;
render(false, onA);
frame();
frame();
assert.equal(a, 0, 'No ready event before texture applies');
render(true, onA);
frame();
assert.equal(a, 0, 'First frame must render before ready');
frame();
assert.equal(a, 1);
frame();
assert.equal(a, 1, 'Only one notification');
render(false, onB);
frame();
assert.equal(b, 0);
render(true, onB);
frame();
assert.equal(b, 0);
frame();
assert.equal(b, 1);
render(true, onA);
frame();
assert.equal(a, 1, 'Returning to A still waits for its own frame');
frame();
assert.equal(a, 2);
console.log('PASS: waits for texture + rendered frame; switching and A→B→A; single callback');

// Exercise the actual texture hook with deferred loader responses.
const three = require(path.join(root, 'node_modules/three'));
const pending = new Map();
let hookState = null,
  effect,
  cleanup,
  previousDeps;
const textureRefs = [];
let textureCursor = 0;
const mapExports = {};
const gl = { capabilities: { getMaxAnisotropy: () => 8 } };
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync(path.join(root, 'src/widgets/HeroVisual/useDesignMap.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  {
    exports: mapExports,
    require(name) {
      if (name === 'react')
        return {
          useRef(initial) {
            const i = textureCursor++;
            return textureRefs[i] ?? (textureRefs[i] = { current: initial });
          },
          useState() {
            return [
              hookState,
              (next) => {
                hookState = next;
              },
            ];
          },
          useEffect(fn, deps) {
            if (!previousDeps || deps.some((d, i) => d !== previousDeps[i])) {
              effect = fn;
              previousDeps = deps;
            }
          },
        };
      if (name === '@react-three/fiber') return { useThree: (select) => select({ gl }) };
      if (name === 'three')
        return {
          ...three,
          TextureLoader: class {
            load(url, ok, progress, error) {
              pending.set(url, { ok, error });
            }
          },
        };
      throw new Error(name);
    },
  }
);
const scene = new three.Group();
const base = new three.Texture();
base.repeat.set(15, 15);
const material = new three.MeshStandardMaterial({ map: base });
scene.add(new three.Mesh(new three.BoxGeometry(), material));
const renderMap = (url) => {
  textureCursor = 0;
  const ready = mapExports.useDesignMap(scene, url);
  if (effect) {
    cleanup?.();
    cleanup = effect();
    effect = null;
  }
  return ready;
};
assert.equal(renderMap('A'), false);
assert.equal(renderMap('B'), false);
pending.get('A').ok(new three.Texture());
assert.equal(material.map, base, 'A must not overwrite B while B loads');
assert.equal(renderMap('B'), false);
const textureB = new three.Texture();
pending.get('B').ok(textureB);
assert.equal(renderMap('B'), true);
assert.equal(material.map, textureB);
assert.equal(textureB.repeat.x, 15, 'Preserve GLB UV transform');
assert.equal(renderMap('A'), false);
assert.equal(renderMap('A'), true, 'Cached texture applies before readiness');
assert.equal(renderMap(undefined), false);
assert.equal(renderMap(undefined), true);
assert.equal(material.map, base);
renderMap('broken');
pending.get('broken').error();
assert.throws(() => renderMap('broken'), /3D/, 'Texture failures reach the error boundary');
assert.equal(renderMap('B'), false);
assert.equal(renderMap('B'), true, 'Switching away recovers from failure');
console.log('PASS: texture races, cache, baked map, UV transform, failure and recovery');
