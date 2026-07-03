import axios from 'axios';
import * as cache from '../core/cache.js';

// ─── Jokes ────────────────────────────────────────────────────────────────────

/**
 * Get a random joke (Free, no key)
 * @param {{ category?: string, type?: 'single'|'twopart', lang?: string, blacklist?: string[] }} params
 * categories: Any, Misc, Programming, Dark, Pun, Spooky, Christmas
 */
export async function getJoke({ category = 'Any', type, lang = 'en', blacklist = [] } = {}) {
  const params = { lang };
  if (type) params.type = type;
  if (blacklist.length) params.blacklistFlags = blacklist.join(',');

  const { data } = await axios.get(`https://v2.jokeapi.dev/joke/${category}`, { params });

  if (data.error) throw new Error(data.message);

  return {
    category: data.category,
    type: data.type,
    joke: data.type === 'single' ? data.joke : null,
    setup: data.type === 'twopart' ? data.setup : null,
    punchline: data.type === 'twopart' ? data.delivery : null,
    lang: data.lang,
    safe: data.safe,
  };
}

/**
 * Get multiple jokes at once
 * @param {{ category?: string, amount?: number }} params
 */
export async function getJokes({ category = 'Any', amount = 5 } = {}) {
  const { data } = await axios.get(`https://v2.jokeapi.dev/joke/${category}`, {
    params: { amount: Math.min(amount, 10) },
  });
  return {
    jokes: (data.jokes || [data]).map((j) => ({
      setup: j.setup || j.joke,
      punchline: j.delivery,
      category: j.category,
    })),
  };
}

// ─── Cat & Dog ────────────────────────────────────────────────────────────────

/**
 * Get a random cat fact (Free, no key)
 */
export async function catFact() {
  const { data } = await axios.get('https://catfact.ninja/fact');
  return { fact: data.fact, length: data.length };
}

/**
 * Get multiple cat facts
 * @param {{ limit?: number }} params
 */
export async function catFacts({ limit = 5 } = {}) {
  const { data } = await axios.get('https://catfact.ninja/facts', { params: { limit } });
  return { facts: data.data.map((f) => f.fact) };
}

/**
 * Random cat image (Free, no key)
 */
export async function catImage() {
  const { data } = await axios.get('https://api.thecatapi.com/v1/images/search');
  return { url: data[0]?.url, id: data[0]?.id };
}

/**
 * Random dog image (Free, no key)
 */
export async function dogImage() {
  const { data } = await axios.get('https://dog.ceo/api/breeds/image/random');
  return { url: data.message, status: data.status };
}

/**
 * Dog breeds list (Free, no key)
 */
export async function dogBreeds() {
  const cacheKey = 'fun:dog:breeds';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://dog.ceo/api/breeds/list/all');
  const breeds = Object.keys(data.message);
  cache.set(cacheKey, breeds, 86400);
  return breeds;
}

// ─── Fun Facts ────────────────────────────────────────────────────────────────

/**
 * Get a fact about a number (Free, no key)
 * @param {{ number?: number|'random', type?: 'trivia'|'math'|'date'|'year' }} params
 */
export async function numberFact({ number = 'random', type = 'trivia' } = {}) {
  const { data } = await axios.get(`http://numbersapi.com/${number}/${type}`, {
    params: { json: true },
    headers: { 'Content-Type': 'application/json' },
  });
  return { number: data.number, fact: data.text, type: data.type, found: data.found };
}

/**
 * Get a random "useless" fact (Free, no key)
 */
export async function uselessFact() {
  const { data } = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random', {
    params: { language: 'en' },
  });
  return { fact: data.text, source: data.source_url };
}

// ─── Random User ──────────────────────────────────────────────────────────────

/**
 * Generate random fake user(s) (Free, no key)
 * Great for testing & demos.
 * @param {{ count?: number, nationality?: string, gender?: 'male'|'female' }} params
 */
export async function randomUser({ count = 1, nationality, gender } = {}) {
  const params = { results: count };
  if (nationality) params.nat = nationality;
  if (gender) params.gender = gender;

  const { data } = await axios.get('https://randomuser.me/api/', { params });

  return {
    users: data.results.map((u) => ({
      name: `${u.name.first} ${u.name.last}`,
      first: u.name.first,
      last: u.name.last,
      gender: u.gender,
      email: u.email,
      phone: u.phone,
      cell: u.cell,
      age: u.dob.age,
      birthday: u.dob.date,
      nationality: u.nat,
      country: u.location.country,
      city: u.location.city,
      address: `${u.location.street.number} ${u.location.street.name}`,
      postcode: u.location.postcode,
      picture: u.picture.large,
      username: u.login.username,
      uuid: u.login.uuid,
      timezone: u.location.timezone.description,
    })),
  };
}

// ─── Affirmations & Advice ────────────────────────────────────────────────────

/**
 * Get a random affirmation (Free, no key)
 */
export async function affirmation() {
  const { data } = await axios.get('https://www.affirmations.dev/');
  return { affirmation: data.affirmation };
}

/**
 * Get random life advice (Free, no key)
 */
export async function advice() {
  const { data } = await axios.get('https://api.adviceslip.com/advice');
  return { advice: data.slip.advice, id: data.slip.id };
}
