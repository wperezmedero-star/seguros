/* Run the real shared script with a minimal DOM; no network or prospect data. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/growth.js'), 'utf8');
function fixture(pathname = '/') {
  const handlers = new Map(), events = [], window = {};
  const document = {
    querySelectorAll: () => [], querySelector: () => null, getElementById: () => null,
    addEventListener: (type, handler) => handlers.set(type, handler),
    dispatchEvent: event => events.push(event)
  };
  vm.runInNewContext(source, {
    window, document, location: { pathname, search: '' }, URLSearchParams,
    sessionStorage: { getItem: () => null, removeItem() {}, setItem() {} },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  });
  return {
    window, events,
    click(eventName) {
      const link = { dataset: { growthEvent: eventName }, matches: () => false };
      handlers.get('click')({ target: { closest: () => link } });
    }
  };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('the actual WhatsApp link handler emits exactly one anonymous event', () => {
  const f = fixture();
  f.click('whatsapp_lead');
  assert.equal(f.window.dataLayer?.length, 1);
  assert.deepEqual(plain(f.window.dataLayer[0]), { event: 'whatsapp_lead', surface: 'website' });
  assert.equal(f.events.length, 1);
  assert.equal(f.events[0].type, 'wps:analytics');
});

test('tracking ignores personal values, arbitrary events and unsupported properties', () => {
  const f = fixture('/tarjeta/');
  f.window.WPSGrowth.track('whatsapp_lead', { phone: 'TEST_ONLY', email: 'TEST_ONLY', method: 'unsupported' });
  f.click('not_allowlisted');
  assert.deepEqual(plain(f.window.dataLayer), [{ event: 'whatsapp_lead', surface: 'tarjeta' }]);
});

test('existing quote and contact events remain available', () => {
  const f = fixture();
  for (const event of ['ethos_quote', 'form_submitted', 'call_started']) f.click(event);
  assert.deepEqual(plain(f.window.dataLayer).map(row => row.event), ['ethos_quote', 'form_submitted', 'call_started']);
});
