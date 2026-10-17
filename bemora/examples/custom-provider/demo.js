/**
 * Demo: install the template provider and use it like a built-in.
 *
 * Run: node examples/custom-provider/demo.js
 * No network, no API keys — always passes.
 */
import Bemora from '../../src/index.js';
import helloProvider from './my-provider.js';

const api = new Bemora({}, { logLevel: 'silent' });

// Object form…
api.use(helloProvider);
// …function form works too (same contract, see docs/plugins.md):
async function ping(api) {
  api.ping = { pong: () => ({ pong: true }) };
}
api.use(ping);

console.log('plugins:', api.plugins());
console.log(await api.hello.greet({ name: 'Cairo' }));
console.log(await api.hello.stats({ numbers: [3, 1, 2] }));
console.log(await api.ping.pong());

// Validation is part of the contract — bad input fails loudly, not silently:
try {
  await api.hello.greet({});
} catch (err) {
  console.log('validation:', err.code, '—', err.message);
}
