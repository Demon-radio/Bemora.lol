#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { Bemora } from './index.js';

const program = new Command();
const api = new Bemora({}, { logLevel: 'silent' });

function print(data) {
  console.log(JSON.stringify(data, null, 2));
}

function fail(err) {
  console.error(chalk.red('Error: ' + err.message));
  process.exit(1);
}

program
  .name('bemora')
  .description('Bemora CLI — access all APIs from the terminal')
  .version('1.0.0');

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

program
  .command('news [country]')
  .description('Get top news headlines')
  .option('-c, --category <category>', 'news category')
  .option('-q, --query <query>', 'search query')
  .action(async (country = 'us', opts) => {
    try { print(await api.news.headlines({ country, category: opts.category, q: opts.query })); }
    catch (e) { fail(e); }
  });

program
  .command('images <query>')
  .description('Search photos on Unsplash')
  .option('-n, --count <n>', 'number of results', '10')
  .action(async (query, opts) => {
    try { print(await api.images.search({ query, perPage: parseInt(opts.count) })); }
    catch (e) { fail(e); }
  });

program
  .command('football')
  .description('Get live football fixtures')
  .option('-d, --date <date>', 'YYYY-MM-DD')
  .option('-l, --league <id>', 'league ID')
  .action(async (opts) => {
    try { print(await api.football.fixtures({ date: opts.date, league: opts.league ? parseInt(opts.league) : undefined })); }
    catch (e) { fail(e); }
  });

program
  .command('crypto <coins...>')
  .description('Get crypto price(s) (e.g. bemora crypto bitcoin ethereum)')
  .option('-c, --currency <currency>', 'target currency', 'usd')
  .action(async (coins, opts) => {
    try { print(await api.crypto.price({ coins, currency: opts.currency })); }
    catch (e) { fail(e); }
  });

program
  .command('gold')
  .description('Get gold price')
  .option('-c, --currency <currency>', 'currency code', 'USD')
  .action(async (opts) => {
    try { print(await api.gold.price({ currency: opts.currency })); }
    catch (e) { fail(e); }
  });

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
