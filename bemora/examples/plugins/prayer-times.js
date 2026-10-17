/**
 * Complete example plugin: prayer times via the free Aladhan API (no key).
 *
 * Run: node examples/plugins/prayer-times.js
 *
 * Demonstrates the full plugin contract (object form — a bare install
 * function also works, see docs/plugins.md):
 * - { name, install(api) } accepted by api.use()
 * - optional beforeRequest / afterResponse / onError hooks
 * - publishable as `bemora-plugin-prayer-times` on npm
 */
import Bemora from '../../src/index.js';

const prayerTimesPlugin = {
  name: 'prayer-times',

  install(api) {
    api.prayerTimes = {
      async today({ city, country = 'EG', method = 5 }) {
        if (!city) throw new Error('prayerTimes.today({ city }) requires a city');
        const url =
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}` +
          `&country=${encodeURIComponent(country)}&method=${method}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Aladhan ${res.status}`);
        const { data } = await res.json();
        return data.timings;
      },
    };
  },

  // Log every provider call this instance makes (hooks never break the host —
  // PluginSystem swallows hook errors by design).
  async beforeRequest({ provider }) {
    console.log(`[plugin] requesting ${provider}`);
  },
  async afterResponse({ provider }) {
    console.log(`[plugin] received ${provider}`);
  },
  async onError({ provider, error }) {
    console.warn(`[plugin] ${provider} failed: ${error.message}`);
  },
};

const api = new Bemora({}, { logLevel: 'silent' });
api.use(prayerTimesPlugin);
console.log('installed plugins:', api.plugins());

const timings = await api.prayerTimes.today({ city: 'Cairo' });
console.log('Cairo today:', {
  Fajr: timings.Fajr,
  Dhuhr: timings.Dhuhr,
  Asr: timings.Asr,
  Maghrib: timings.Maghrib,
  Isha: timings.Isha,
});
