import axios from 'axios';
import * as cache from '../core/cache.js';
import crypto from 'crypto';

// ─── QR Code ──────────────────────────────────────────────────────────────────

/**
 * Generate a QR code URL for any text/URL (Free, no key)
 * @param {{ text: string, size?: number, format?: 'png'|'svg' }} params
 * @returns {{ url: string, text: string }}
 */
export function generateQR({ text, size = 200, format = 'png' }) {
  const encoded = encodeURIComponent(text);
  return {
    text,
    qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=${format}&data=${encoded}`,
    size: `${size}x${size}`,
    format,
  };
}

// ─── UUID Generator ───────────────────────────────────────────────────────────

/**
 * Generate a UUID v4 (no API needed)
 * @returns {string}
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ─── Password Strength Checker ────────────────────────────────────────────────

/**
 * Check password strength (no API needed)
 * @param {{ password: string }} params
 * @returns {{ score: number, label: string, suggestions: string[] }}
 */
export function passwordStrength({ password }) {
  let score = 0;
  const suggestions = [];

  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else suggestions.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else suggestions.push('Add special characters (!@#$%^&*)');

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  return { score, label: labels[score], suggestions };
}

// ─── Hash Functions ───────────────────────────────────────────────────────────

/**
 * Generate hash of a string (no API needed)
 * @param {{ text: string, algorithm?: 'md5'|'sha1'|'sha256'|'sha512' }} params
 * @returns {{ hash: string, algorithm: string }}
 */
export function hash({ text, algorithm = 'sha256' }) {
  return {
    hash: crypto.createHash(algorithm).update(text).digest('hex'),
    algorithm,
  };
}

// ─── Base64 Encode/Decode ─────────────────────────────────────────────────────

/**
 * Base64 encode string (no API needed)
 * @param {{ text: string }} params
 * @returns {{ encoded: string }}
 */
export function base64Encode({ text }) {
  return { encoded: Buffer.from(text).toString('base64') };
}

/**
 * Base64 decode string (no API needed)
 * @param {{ encoded: string }} params
 * @returns {{ text: string }}
 */
export function base64Decode({ encoded }) {
  return { text: Buffer.from(encoded, 'base64').toString('utf8') };
}

// ─── Lorem Ipsum Generator ────────────────────────────────────────────────────

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum'
];

/**
 * Generate Lorem Ipsum text (no API needed)
 * @param {{ type?: 'words'|'sentences'|'paragraphs', count?: number }} params
 */
export function loremIpsum({ type = 'words', count = 5 }) {
  const words = [];
  for (let i = 0; i < count * 20; i++) {
    words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  }

  let result;
  if (type === 'words') {
    result = words.slice(0, count).join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);
  } else if (type === 'sentences') {
    const sentences = [];
    for (let i = 0; i < count; i++) {
      const len = Math.floor(Math.random() * 10) + 5;
      let sentence = words.slice(i * 20, i * 20 + len).join(' ') + '.';
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      sentences.push(sentence);
    }
    result = sentences.join(' ');
  } else {
    const paragraphs = [];
    for (let i = 0; i < count; i++) {
      const len = Math.floor(Math.random() * 5) + 3;
      const sentences = [];
      for (let j = 0; j < len; j++) {
        const slen = Math.floor(Math.random() * 10) + 5;
        let sentence = words.slice((i*20) + j*10, (i*20) + j*10 + slen).join(' ') + '.';
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        sentences.push(sentence);
      }
      paragraphs.push(sentences.join(' '));
    }
    result = paragraphs.join('\n\n');
  }

  return { type, count, text: result };
}

// ─── Emoji Search ─────────────────────────────────────────────────────────────

const EMOJIS = [
  { emoji: '😀', name: 'grinning face', category: 'smileys' },
  { emoji: '😂', name: 'face with tears of joy', category: 'smileys' },
  { emoji: '😍', name: 'smiling face with heart-eyes', category: 'smileys' },
  { emoji: '🤔', name: 'thinking face', category: 'smileys' },
  { emoji: '😎', name: 'smiling face with sunglasses', category: 'smileys' },
  { emoji: '❤️', name: 'red heart', category: 'love' },
  { emoji: '🔥', name: 'fire', category: 'nature' },
  { emoji: '⭐', name: 'star', category: 'nature' },
  { emoji: '🎉', name: 'party popper', category: 'celebration' },
  { emoji: '👍', name: 'thumbs up', category: 'gestures' },
  { emoji: '👋', name: 'waving hand', category: 'gestures' },
  { emoji: '🙏', name: 'folded hands', category: 'gestures' },
  { emoji: '💻', name: 'laptop', category: 'tech' },
  { emoji: '📱', name: 'mobile phone', category: 'tech' },
  { emoji: '🚀', name: 'rocket', category: 'transport' },
  { emoji: '☕', name: 'coffee', category: 'food' },
  { emoji: '🍕', name: 'pizza', category: 'food' },
  { emoji: '🎵', name: 'musical note', category: 'music' },
  { emoji: '🎮', name: 'video game', category: 'games' },
  { emoji: '📚', name: 'books', category: 'education' },
];

/**
 * Search emojis (no API needed)
 * @param {{ query?: string, category?: string, limit?: number }} params
 */
export function emojiSearch({ query, category, limit = 10 }) {
  let results = [...EMOJIS];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.category.toLowerCase().includes(q)
    );
  }

  if (category) {
    results = results.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  return { 
    count: results.length, 
    emojis: results.slice(0, limit) 
  };
}

/**
 * Get random emoji (no API needed)
 * @param {{ category?: string }} params
 */
export function randomEmoji({ category }) {
  let pool = [...EMOJIS];
  if (category) pool = pool.filter(e => e.category === category);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Color Conversion (No API needed) ─────────────────────────────────────────

/**
 * Convert HEX to RGB (no API needed)
 * @param {{ hex: string }} params
 */
export function hexToRgb({ hex }) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Convert RGB to HEX (no API needed)
 * @param {{ r: number, g: number, b: number }} params
 */
export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ─── HTTP Status Codes (No API needed) ────────────────────────────────────────

const HTTP_STATUS_CODES = {
  200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content',
  301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
  405: 'Method Not Allowed', 409: 'Conflict', 429: 'Too Many Requests',
  500: 'Internal Server Error', 501: 'Not Implemented', 502: 'Bad Gateway',
  503: 'Service Unavailable'
};

export function httpStatus({ code }) {
  return { code, message: HTTP_STATUS_CODES[code] || 'Unknown' };
}

// ─── URL Shortener ────────────────────────────────────────────────────────────

/**
 * Shorten a URL using is.gd (Free, no key)
 * @param {{ url: string }} params
 */
export async function shortenURL({ url }) {
  const { data } = await axios.get('https://is.gd/create.php', {
    params: { format: 'json', url },
  });
  if (data.errorcode) throw new Error(data.errormessage);
  return { original: url, short: data.shorturl };
}

// ─── Timezone ─────────────────────────────────────────────────────────────────

/**
 * Get current time for a timezone (Free, no key)
 * @param {{ timezone: string }} params — e.g. 'Africa/Cairo', 'America/New_York'
 */
export async function getTime({ timezone }) {
  const cacheKey = `utils:time:${timezone}`;
  const { data } = await axios.get(
    `https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`
  );
  return {
    timezone: data.timezone,
    datetime: data.datetime,
    utc_offset: data.utc_offset,
    day_of_week: data.day_of_week,
    week_number: data.week_number,
    dst: data.dst,
    unixtime: data.unixtime,
  };
}

/**
 * List all available timezones
 */
export async function listTimezones() {
  const cacheKey = 'utils:timezones';
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const { data } = await axios.get('https://worldtimeapi.org/api/timezone');
  cache.set(cacheKey, data, 86400);
  return data;
}

// ─── Public Holidays ──────────────────────────────────────────────────────────

/**
 * Get public holidays for a country and year (Free, no key)
 * @param {{ country: string, year?: number }} params — country: ISO 2-letter code
 */
export async function getHolidays({ country, year }) {
  const y = year || new Date().getFullYear();
  const cacheKey = `utils:holidays:${country}:${y}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(
    `https://date.nager.at/api/v3/PublicHolidays/${y}/${country.toUpperCase()}`
  );

  const result = {
    country,
    year: y,
    holidays: data.map((h) => ({
      date: h.date,
      name: h.name,
      local_name: h.localName,
      type: h.types?.[0],
      global: h.global,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

/**
 * Get a random quote (Free, no key)
 * @param {{ tag?: string }} params
 */
export async function getQuote({ tag } = {}) {
  const params = tag ? { tags: tag } : {};
  const { data } = await axios.get('https://api.quotable.io/random', { params });
  return {
    content: data.content,
    author: data.author,
    tags: data.tags,
    length: data.length,
  };
}

/**
 * Get multiple quotes
 * @param {{ limit?: number, tag?: string }} params
 */
export async function getQuotes({ limit = 5, tag } = {}) {
  const params = { limit };
  if (tag) params.tags = tag;
  const { data } = await axios.get('https://api.quotable.io/quotes', { params });
  return {
    total: data.totalCount,
    quotes: data.results.map((q) => ({ content: q.content, author: q.author, tags: q.tags })),
  };
}

// ─── Dictionary ──────────────────────────────────────────────────────────────

/**
 * Look up a word definition (Free, no key)
 * @param {{ word: string, language?: string }} params
 */
export async function define({ word, language = 'en' }) {
  const cacheKey = `utils:define:${language}:${word}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(
    `https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word)}`
  );

  const entry = data[0];
  const result = {
    word: entry.word,
    phonetic: entry.phonetic,
    audio: entry.phonetics?.find((p) => p.audio)?.audio || null,
    meanings: entry.meanings.map((m) => ({
      part_of_speech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 3).map((d) => ({
        definition: d.definition,
        example: d.example,
        synonyms: d.synonyms?.slice(0, 5),
        antonyms: d.antonyms?.slice(0, 5),
      })),
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}

// ─── Trivia ──────────────────────────────────────────────────────────────────

/**
 * Get trivia questions (Free, no key)
 * @param {{ amount?: number, category?: number, difficulty?: 'easy'|'medium'|'hard', type?: 'multiple'|'boolean' }} params
 */
export async function getTrivia({ amount = 10, category, difficulty, type } = {}) {
  const params = { amount };
  if (category) params.category = category;
  if (difficulty) params.difficulty = difficulty;
  if (type) params.type = type;

  const { data } = await axios.get('https://opentdb.com/api.php', { params });

  if (data.response_code !== 0) throw new Error('Trivia API failed');

  return {
    questions: data.results.map((q) => ({
      question: q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
      correct_answer: q.correct_answer,
      incorrect_answers: q.incorrect_answers,
      category: q.category,
      difficulty: q.difficulty,
      type: q.type,
    })),
  };
}

// ─── Color ────────────────────────────────────────────────────────────────────

/**
 * Get color info from HEX (Free, no key)
 * @param {{ hex: string }} params — e.g. 'ff5733' or '#ff5733'
 */
export async function getColor({ hex }) {
  const clean = hex.replace('#', '');
  const cacheKey = `utils:color:${clean}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://www.thecolorapi.com/id?hex=${clean}&format=json`);

  const result = {
    hex: data.hex.value,
    name: data.name.value,
    rgb: data.rgb.value,
    hsl: data.hsl.value,
    cmyk: data.cmyk.value,
    image: `https://www.thecolorapi.com/id?hex=${clean}&format=svg`,
    _cached: false,
  };

  cache.set(cacheKey, result, 86400);
  return result;
}
