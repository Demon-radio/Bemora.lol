
import axios from 'axios';
import * as cache from '../core/cache.js';
import crypto from 'crypto';

// ─── QR Code ──────────────────────────────────────────────────────────────────

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

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ─── Password Strength Checker ────────────────────────────────────────────────

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

export function hash({ text, algorithm = 'sha256' }) {
  return { hash: crypto.createHash(algorithm).update(text).digest('hex'), algorithm };
}

// ─── Base64 Encode/Decode ─────────────────────────────────────────────────────

export function base64Encode({ text }) { return { encoded: Buffer.from(text).toString('base64') }; }
export function base64Decode({ encoded }) { return { text: Buffer.from(encoded, 'base64').toString('utf8') }; }

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

export function loremIpsum({ type = 'words', count = 5 }) {
  const words = [];
  for (let i = 0; i < count * 20; i++) words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
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

export function emojiSearch({ query, category, limit = 10 }) {
  let results = [...EMOJIS];
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.category.toLowerCase().includes(q)
    );
  }
  if (category) results = results.filter(e => e.category.toLowerCase() === category.toLowerCase());
  return { count: results.length, emojis: results.slice(0, limit) };
}

export function randomEmoji({ category }) {
  let pool = [...EMOJIS];
  if (category) pool = pool.filter(e => e.category === category);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Color Conversion ───────────────────────────────────────────────────────

export function hexToRgb({ hex }) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ─── HTTP Status Codes ─────────────────────────────────────────────────────

const HTTP_STATUS_CODES = {
  200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content',
  301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
  405: 'Method Not Allowed', 409: 'Conflict', 429: 'Too Many Requests',
  500: 'Internal Server Error', 501: 'Not Implemented', 502: 'Bad Gateway',
  503: 'Service Unavailable'
};

export function httpStatus({ code }) { return { code, message: HTTP_STATUS_CODES[code] || 'Unknown' }; }

// ─── URL Shortener ─────────────────────────────────────────────────────────

export async function shortenURL({ url }) {
  const { data } = await axios.get('https://is.gd/create.php', { params: { format: 'json', url } });
  if (data.errorcode) throw new Error(data.errormessage);
  return { original: url, short: data.shorturl };
}

// ─── Timezone ───────────────────────────────────────────────────────────────

export async function getTime({ timezone }) {
  // Primary: WorldTimeAPI (known to ECONNRESET intermittently)
  try {
    const { data } = await axios.get(
      `https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`,
      { timeout: 8000 },
    );
    return {
      timezone: data.timezone,
      datetime: data.datetime,
      utc_offset: data.utc_offset,
      day_of_week: data.day_of_week,
      week_number: data.week_number,
      dst: data.dst,
      unixtime: data.unixtime,
      _provider: 'worldtimeapi',
    };
  } catch {
    // Fallback 1: timeapi.io
    try {
      const { data } = await axios.get(
        `https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(timezone)}`,
        { timeout: 8000 },
      );
      return {
        timezone: data.timeZone,
        datetime: data.dateTime,
        utc_offset: data.utcOffset,
        day_of_week: new Date(data.dateTime).getDay(),
        week_number: null,
        dst: data.dstActive,
        unixtime: Math.floor(new Date(data.dateTime).getTime() / 1000),
        _provider: 'timeapi.io',
      };
    } catch {
      // Ultimate fallback: Intl API — always available, zero network needed
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('sv-SE', {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });
      const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
      return {
        timezone,
        datetime: `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`,
        utc_offset: null,
        day_of_week: now.getDay(),
        week_number: null,
        dst: null,
        unixtime: Math.floor(now.getTime() / 1000),
        _provider: 'Intl',
      };
    }
  }
}

export async function listTimezones() {
  const cacheKey = 'utils:timezones';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Primary: WorldTimeAPI
  try {
    const { data } = await axios.get('https://worldtimeapi.org/api/timezone', { timeout: 8000 });
    cache.set(cacheKey, data, 86400);
    return data;
  } catch {
    // Fallback: timeapi.io available timezones list
    try {
      const { data } = await axios.get('https://timeapi.io/api/timezone/availabletimezones', { timeout: 8000 });
      cache.set(cacheKey, data, 86400);
      return data;
    } catch {
      // Ultimate fallback: IANA tz subset guaranteed by Intl
      const zones = Intl.supportedValuesOf
        ? Intl.supportedValuesOf('timeZone')
        : ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
           'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
           'Asia/Dubai', 'Asia/Cairo', 'Africa/Johannesburg', 'Australia/Sydney', 'Pacific/Auckland'];
      cache.set(cacheKey, zones, 86400);
      return zones;
    }
  }
}

// ─── Public Holidays ─────────────────────────────────────────────────────────

export async function getHolidays({ country, year }) {
  const y = year || new Date().getFullYear();
  const cacheKey = `utils:holidays:${country}:${y}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${y}/${country.toUpperCase()}`);
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

// ─── Quotes ───────────────────────────────────────────────────────────────────

const FALLBACK_QUOTES = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", tags: ["inspirational", "work"] },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon", tags: ["life", "wisdom"] },
  { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", tags: ["inspirational", "wisdom"] },
  { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", tags: ["inspirational", "wisdom"] },
  { content: "Stay hungry, stay foolish.", author: "Steve Jobs", tags: ["inspirational"] },
];

export async function getQuote({ tag } = {}) {
  const params = tag ? { tags: tag } : {};
  try {
    const { data } = await axios.get('https://api.quotable.io/random', { params });
    return { content: data.content, author: data.author, tags: data.tags, length: data.length };
  } catch (e) {
    // Fallback if quotable is down
    const quote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    return { ...quote, length: quote.content.length, _cached: false };
  }
}

export async function getQuotes({ limit = 5, tag } = {}) {
  const params = { limit };
  if (tag) params.tags = tag;
  try {
    const { data } = await axios.get('https://api.quotable.io/quotes', { params });
    return { total: data.totalCount, quotes: data.results.map((q) => ({ content: q.content, author: q.author, tags: q.tags })) };
  } catch (e) {
    // Fallback to built-in quotes
    const shuffled = [...FALLBACK_QUOTES].sort(() => 0.5 - Math.random());
    const quotes = shuffled.slice(0, limit);
    return { total: FALLBACK_QUOTES.length, quotes };
  }
}

// ─── Dictionary ───────────────────────────────────────────────────────────────

export async function define({ word, language = 'en' }) {
  const cacheKey = `utils:define:${language}:${word}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word)}`);
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

// ─── Trivia ─────────────────────────────────────────────────────────────────

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

// ─── Color Info ───────────────────────────────────────────────────────────────

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

// ─── Additional Awesome Utilities ─────────────────────────────────────────────

export function randomNumber({ min = 0, max = 100 }) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatDate({ date = new Date(), format = 'short' }) {
  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error('Invalid date');
  if (format === 'iso') return d.toISOString();
  if (format === 'relative') {
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }
  if (format === 'long') return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return d.toLocaleDateString();
}

export function validateJSON({ json }) {
  try {
    const parsed = JSON.parse(json);
    return { valid: true, parsed };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

export function parseURL({ url }) {
  const u = new URL(url);
  return {
    protocol: u.protocol,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
  };
}

export function slugify({ text }) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

