import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

export async function getJoke({ category = 'Any', type, lang = 'en', blacklist = [] } = {}) {
  const params = { lang };
  if (type) params.type = type;
  if (blacklist.length) params.blacklistFlags = blacklist.join(',');

  try {
    const { data } = await http.get(`https://v2.jokeapi.dev/joke/${category}`, { params });

    if (data.error) throw new ValidationError(data.message, { provider: 'fun' });

    return {
      category: data.category,
      type: data.type,
      joke: data.type === 'single' ? data.joke : null,
      setup: data.type === 'twopart' ? data.setup : null,
      punchline: data.type === 'twopart' ? data.delivery : null,
      lang: data.lang,
      safe: data.safe,
    };
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw wrapProviderError(err, 'fun');
  }
}

export async function getJokes({ category = 'Any', amount = 5 } = {}) {
  try {
    const { data } = await http.get(`https://v2.jokeapi.dev/joke/${category}`, {
      params: { amount: Math.min(amount, 10) },
    });
    return {
      jokes: (data.jokes || [data]).map((j) => ({
        setup: j.setup || j.joke,
        punchline: j.delivery,
        category: j.category,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function catFact() {
  try {
    const { data } = await http.get('https://catfact.ninja/fact');
    return { fact: data.fact, length: data.length };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function catFacts({ limit = 5 } = {}) {
  try {
    const { data } = await http.get('https://catfact.ninja/facts', { params: { limit } });
    return { facts: data.data.map((f) => f.fact) };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function catImage() {
  try {
    const { data } = await http.get('https://api.thecatapi.com/v1/images/search');
    return { url: data[0]?.url, id: data[0]?.id };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function dogImage() {
  try {
    const { data } = await http.get('https://dog.ceo/api/breeds/image/random');
    return { url: data.message, status: data.status };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function dogBreeds() {
  const cacheKey = 'fun:dog:breeds';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await http.get('https://dog.ceo/api/breeds/list/all');
    const breeds = Object.keys(data.message);
    cache.set(cacheKey, breeds, 86400);
    return breeds;
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function numberFact({ number = 'random', type = 'trivia' } = {}) {
  try {
    const { data } = await http.get(`http://numbersapi.com/${number}/${type}`, {
      params: { json: true },
      headers: { 'Content-Type': 'application/json' },
    });
    return { number: data.number, fact: data.text, type: data.type, found: data.found };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function uselessFact() {
  try {
    const { data } = await http.get('https://uselessfacts.jsph.pl/api/v2/facts/random', {
      params: { language: 'en' },
    });
    return { fact: data.text, source: data.source_url };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function randomUser({ count = 1, nationality, gender } = {}) {
  const params = { results: count };
  if (nationality) params.nat = nationality;
  if (gender) params.gender = gender;

  try {
    const { data } = await http.get('https://randomuser.me/api/', { params });

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
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function affirmation() {
  try {
    const { data } = await http.get('https://www.affirmations.dev/');
    return { affirmation: data.affirmation };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}

export async function advice() {
  try {
    const { data } = await http.get('https://api.adviceslip.com/advice');
    return { advice: data.slip.advice, id: data.slip.id };
  } catch (err) {
    throw wrapProviderError(err, 'fun');
  }
}
