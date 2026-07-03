import axios from 'axios';

const HEADERS = { Accept: 'application/json', 'User-Agent': 'bemora (https://github.com/Demon-radio/Bemora.lol)' };

export async function getRandomDadJoke() {
  const { data } = await axios.get('https://icanhazdadjoke.com/', { headers: HEADERS });
  return { id: data.id, joke: data.joke };
}

export async function searchDadJokes({ query, limit = 10 }) {
  const { data } = await axios.get('https://icanhazdadjoke.com/search', {
    headers: HEADERS,
    params: { term: query, limit },
  });
  return {
    query,
    count: data.results?.length || 0,
    results: (data.results || []).map((r) => ({ id: r.id, joke: r.joke })),
  };
}
