const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the real cart's event handlers and effect cleanup without a browser
// or network. The cart API and React lifecycle are controlled test boundaries.
const source = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/app/cart/CartWin98.tsx'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }
).outputText;

function mountCart() {
  const scheduled = new Map();
  const cleanups = [];
  const writes = [];
  const item = {
    id: 'cart-item',
    quantity: 1,
    finalPrice: 100,
    product: { id: 'product', name: 'Футболка', slug: 'tee', availableQuantity: 5, options: {} },
  };
  let nextTimer = 0;
  const result = {};
  const cart = {
    items: [item],
    calculations: { itemsCount: 1, subtotal: 100, totalAmount: 100 },
    isLoading: false,
    error: null,
    addItem: () => {},
    removeItem: () => {},
    setItemQuantity: (_id, quantity) => {
      item.quantity = quantity;
    },
    updateItemQuantity: (id, quantity) => {
      writes.push({ id, quantity });
    },
  };
  vm.runInNewContext(source, {
    exports: result,
    setTimeout: (callback) => {
      scheduled.set(++nextTimer, callback);
      return nextTimer;
    },
    clearTimeout: (id) => scheduled.delete(id),
    require: (name) => {
      if (name === 'react')
        return {
          useState: (value) => [value, () => {}],
          useRef: (value) => ({ current: value }),
          useCallback: (callback) => callback,
          useEffect: (effect) => {
            cleanups.push(effect());
          },
        };
      if (name === 'react/jsx-runtime') return require(name);
      if (name === 'next/navigation') return { useRouter: () => ({ push: () => {} }) };
      if (name.includes('/hooks/useCart')) return { useCart: () => cart };
      if (name.includes('/utils/format')) return { formatPrice: String, formatProducts: String };
      if (name.includes('/utils/variant-display')) return { getVariantDisplayBadges: () => [] };
      return new Proxy({}, { get: (_target, key) => (key === '__esModule' ? true : 'span') });
    },
  });
  const tree = result.CartWin98({});
  function find(node, predicate) {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
    if (predicate(node)) return node;
    return find(node.props?.children, predicate);
  }
  return {
    writes,
    increase: () => find(tree, (node) => node.props?.['aria-label']?.startsWith('Збільшити')).props.onClick(),
    remove: () => find(tree, (node) => node.props?.children === 'Видалити').props.onClick(),
    unmount: () => cleanups.forEach((cleanup) => cleanup?.()),
    tick: () => {
      for (const [id, callback] of scheduled) {
        scheduled.delete(id);
        callback();
      }
    },
  };
}

test('leaving the Windows 98 cart saves the latest quantity before its debounce expires', () => {
  const cart = mountCart();
  cart.increase();
  assert.deepEqual(cart.writes, []);
  cart.unmount();
  assert.deepEqual(cart.writes, [{ id: 'cart-item', quantity: 2 }]);
  cart.tick();
  assert.equal(cart.writes.length, 1, 'Unmount also cancels the old timer');
});

test('removing a cart item cancels its pending quantity update', () => {
  const cart = mountCart();
  cart.increase();
  cart.remove();
  cart.tick();
  cart.unmount();
  assert.deepEqual(cart.writes, [], 'A removed item must not receive a later quantity request');
});

test('a quantity saved by the timer is not submitted again on navigation', () => {
  const cart = mountCart();
  cart.increase();
  cart.tick();
  cart.unmount();
  assert.deepEqual(cart.writes, [{ id: 'cart-item', quantity: 2 }]);
});
