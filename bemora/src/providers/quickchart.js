import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://quickchart.io';

/**
 * Build a QuickChart render URL from a chart config.
 * @param {Object} params
 * @param {Object|string} params.chart
 * @param {number} [params.width]
 * @param {number} [params.height]
 * @param {string} [params.backgroundColor]
 * @returns {Object} url
 */
export async function render({ chart, width = 500, height = 300, backgroundColor = 'white' } = {}) {
  const params = {
    c: typeof chart === 'string' ? chart : JSON.stringify(chart),
    w: width,
    h: height,
    bkg: backgroundColor,
  };
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const url = `${BASE}/chart?${qs}`;
  return { url, _cached: false };
}

/**
 * Build a QuickChart bar chart URL.
 * @param {Object} params
 * @param {string[]} [params.labels]
 * @param {number[]} [params.data]
 * @param {string} [params.title]
 * @returns {Object} url plus config
 */
export async function bar({ labels, data, title } = {}) {
  const config = {
    type: 'bar',
    data: { labels, datasets: [{ label: title || 'data', data }] },
    options: title ? { plugins: { title: { display: true, text: title } } } : {},
  };
  const url = `${BASE}/chart?c=${encodeURIComponent(JSON.stringify(config))}`;
  return { url, config, _cached: false };
}

/**
 * Build a QuickChart line chart URL.
 * @param {Object} params
 * @param {string[]} [params.labels]
 * @param {number[]} [params.data]
 * @param {string} [params.title]
 * @returns {Object} url plus config
 */
export async function line({ labels, data, title } = {}) {
  const config = {
    type: 'line',
    data: { labels, datasets: [{ label: title || 'data', data }] },
    options: title ? { plugins: { title: { display: true, text: title } } } : {},
  };
  const url = `${BASE}/chart?c=${encodeURIComponent(JSON.stringify(config))}`;
  return { url, config, _cached: false };
}

/**
 * Build a QuickChart pie chart URL.
 * @param {Object} params
 * @param {string[]} [params.labels]
 * @param {number[]} [params.data]
 * @param {string} [params.title]
 * @returns {Object} url plus config
 */
export async function pie({ labels, data, title } = {}) {
  const config = {
    type: 'pie',
    data: { labels, datasets: [{ label: title || 'data', data }] },
    options: title ? { plugins: { title: { display: true, text: title } } } : {},
  };
  const url = `${BASE}/chart?c=${encodeURIComponent(JSON.stringify(config))}`;
  return { url, config, _cached: false };
}
