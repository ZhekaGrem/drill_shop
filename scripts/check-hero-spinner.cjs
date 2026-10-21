const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require(process.cwd() + '/node_modules/typescript');
const slots = [];
let cursor = 0;
const memo = (fn, deps) => {
  const i = cursor++;
  if (!slots[i] || deps.some((dep, j) => dep !== slots[i].deps[j])) slots[i] = { deps, value: fn() };
  return slots[i].value;
};
const react = {
  useMemo: memo,
  useCallback: (fn, deps) => memo(() => fn, deps),
  useEffect: () => {},
  useState: (initial) => {
    const i = cursor++;
    if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
    return [
      slots[i],
      (value) => {
        slots[i] = value;
      },
    ];
  },
  lazy: () => 'Scene',
  Suspense: 'Suspense',
};
const out = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/widgets/HeroVisual/HeroVisual.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText,
  {
    exports: out,
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime')
        return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (name.includes('useInView') || name === 'react-intersection-observer')
        return { useInView: () => ({ inView: true }) };
      if (name.includes('useDesign')) return { useDesign: () => 'test' };
      if (name.includes('animation')) return { animationForDesign: () => 'current' };
      if (name.includes('useDragRotation'))
        return { useDragRotation: () => ({ dragRef: { current: null }, handlers: {} }) };
      if (name.includes('module.scss')) return { default: new Proxy({}, { get: (_, key) => key }) };
      return {};
    },
  }
);
const designs = {
  a: { modelUrl: 'shirt', mapUrl: 'a' },
  b: { modelUrl: 'shirt', mapUrl: 'b' },
  c: { modelUrl: 'hoodie', mapUrl: 'c' },
};
function nodes(node) {
  return node && typeof node === 'object'
    ? [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)]
    : [];
}
const render = (value) => {
  cursor = 0;
  return nodes(out.HeroVisual({ designs, value }));
};
const loading = (tree) => tree.some((n) => n.props?.role === 'status');
const ready = (tree) => tree.find((n) => n.props?.onReady)?.props.onReady();
let tree = render('a');
assert.equal(loading(tree), true, 'Initial model shows spinner');
ready(tree);
assert.equal(loading(render('a')), false);
assert.equal(loading(render('b')), false, 'Changing print on rendered model must not show spinner');
assert.equal(loading(render('a')), false, 'Returning to previous print stays visible');
tree = render('c');
assert.equal(loading(tree), true, 'New model waits for first frame');
ready(tree);
assert.equal(loading(render('c')), false);
console.log('PASS: spinner only for initial model render, never for same-model print changes');
