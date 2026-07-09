#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import Bemora from './index.js';

const program = new Command();
const api = new Bemora({}, { logLevel: 'silent' });

function print(data) {
  console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
}

function fail(err) {
  console.error(chalk.red('Error: ' + err.message));
  process.exit(1);
}

program
  .name('bemora')
  .description('Bemora CLI — access all APIs & utilities from the terminal')
  .version('1.4.0');

// --- Weather Commands ---
program
  .command('weather <city>')
  .description('Get current weather for a city')
  .option('-u, --units <units>', 'metric or imperial', 'metric')
  .action(async (city, opts) => {
    try { print(await api.weather.current({ city, units: opts.units })); }
    catch (e) { fail(e); }
  });

program
  .command('forecast <city>')
  .description('Get 5-day weather forecast')
  .action(async (city) => {
    try { print(await api.weather.forecast({ city })); }
    catch (e) { fail(e); }
  });

// --- Currency Commands ---
program
  .command('convert <amount> <from> <to>')
  .description('Convert currency (e.g. bemora convert 100 USD EGP)')
  .action(async (amount, from, to) => {
    try { print(await api.currency.convert({ from, to, amount: parseFloat(amount) })); }
    catch (e) { fail(e); }
  });

program
  .command('rates [base]')
  .description('Get exchange rates (default base: USD)')
  .action(async (base = 'USD') => {
    try { print(await api.currency.rates({ base })); }
    catch (e) { fail(e); }
  });

// --- News Commands ---
program
  .command('news [country]')
  .description('Get top news headlines')
  .option('-c, --category <category>', 'news category')
  .option('-q, --query <query>', 'search query')
  .action(async (country = 'us', opts) => {
    try { print(await api.news.headlines({ country, category: opts.category, q: opts.query })); }
    catch (e) { fail(e); }
  });

// --- Crypto Commands ---
program
  .command('crypto <coins...>')
  .description('Get crypto price(s) (e.g. bemora crypto bitcoin ethereum)')
  .option('-c, --currency <currency>', 'target currency', 'usd')
  .action(async (coins, opts) => {
    try { print(await api.crypto.price({ coins, currency: opts.currency })); }
    catch (e) { fail(e); }
  });

// --- Utility Commands ---
const utils = program.command('utils').description('Powerful utility functions');

utils
  .command('uuid')
  .description('Generate a random UUID v4')
  .action(() => {
    print(api.utils.uuid());
  });

utils
  .command('password-strength <password>')
  .description('Check password strength')
  .action((password) => {
    print(api.utils.passwordStrength({ password }));
  });

utils
  .command('hash <text>')
  .description('Hash text (md5, sha1, sha256, sha512)')
  .option('-a, --algorithm <algorithm>', 'hash algorithm', 'sha256')
  .action((text, opts) => {
    print(api.utils.hash({ text, algorithm: opts.algorithm }));
  });

utils
  .command('base64-encode <text>')
  .description('Encode text to Base64')
  .action((text) => {
    print(api.utils.base64Encode({ text }));
  });

utils
  .command('base64-decode <encoded>')
  .description('Decode Base64 text')
  .action((encoded) => {
    print(api.utils.base64Decode({ encoded }));
  });

utils
  .command('lorem')
  .description('Generate Lorem Ipsum text')
  .option('-t, --type <type>', 'words, sentences, or paragraphs', 'words')
  .option('-c, --count <number>', 'count', '5')
  .action((opts) => {
    print(api.utils.loremIpsum({ type: opts.type, count: parseInt(opts.count) }));
  });

utils
  .command('emoji-search [query]')
  .description('Search emojis')
  .option('-c, --category <category>', 'filter by category')
  .option('-l, --limit <number>', 'limit results', '10')
  .action((query, opts) => {
    print(api.utils.emojiSearch({ query, category: opts.category, limit: parseInt(opts.limit) }));
  });

utils
  .command('random-emoji')
  .description('Get a random emoji')
  .option('-c, --category <category>', 'filter by category')
  .action((opts) => {
    print(api.utils.randomEmoji({ category: opts.category }));
  });

utils
  .command('hex-to-rgb <hex>')
  .description('Convert HEX color to RGB')
  .action((hex) => {
    print(api.utils.hexToRgb({ hex }));
  });

utils
  .command('rgb-to-hex <r> <g> <b>')
  .description('Convert RGB to HEX color')
  .action((r, g, b) => {
    print(api.utils.rgbToHex({ r: parseInt(r), g: parseInt(g), b: parseInt(b) }));
  });

utils
  .command('http-status <code>')
  .description('Get HTTP status code info')
  .action((code) => {
    print(api.utils.httpStatus({ code: parseInt(code) }));
  });

// --- Research Commands ---
program
  .command('wikipedia <query>')
  .description('Search Wikipedia')
  .option('-l, --lang <language>', 'language code', 'en')
  .action(async (query, opts) => {
    try { print(await api.research.wikipedia({ query, language: opts.lang })); }
    catch (e) { fail(e); }
  });

program
  .command('books <query>')
  .description('Search books via Open Library')
  .action(async (query) => {
    try { print(await api.research.books({ query })); }
    catch (e) { fail(e); }
  });

program.parse();
