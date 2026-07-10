import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import { USER_AGENT } from '../core/headers.js';

const http = httpClient();
const HEADERS = { Accept: 'application/json', 'User-Agent': USER_AGENT };

export async function getRandomDadJoke() {
  try {
    const { data } = await http.get('https://icanhazdadjoke.com/', { headers: HEADERS });
    return { id: data.id, joke: data.joke };
  } catch (err) {
    throw wrapProviderError(err, 'dadjokes');
  }
}

export async function searchDadJokes({ query, limit = 10 }) {
  try {
    const { data } = await http.get('https://icanhazdadjoke.com/search', {
      headers: HEADERS,
      params: { term: query, limit },
    });
    return {
      query,
      count: data.results?.length || 0,
      results: (data.results || []).map((r) => ({ id: r.id, joke: r.joke })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'dadjokes');
  }
}
