
import axios from 'axios';
import * as cache from '../core/cache.js';

export async function searchQuestions({ query, site = 'stackoverflow', limit = 20, sort = 'relevance' }) {
  const cacheKey = `stackexchange:search:${query}:${site}:${limit}:${sort}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://api.stackexchange.com/2.3/search', {
    params: { intitle: query, site, pagesize: limit, order: 'desc', sort, filter: 'withbody' },
  });

  const result = { questions: data.items, _cached: false };
  cache.set(cacheKey, result, 1800);
  return result;
}

export async function getQuestion({ id, site = 'stackoverflow' }) {
  const cacheKey = `stackexchange:question:${id}:${site}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://api.stackexchange.com/2.3/questions/${id}`, {
    params: { site, filter: 'withbody' },
  });

  const result = { question: data.items[0], _cached: false };
  cache.set(cacheKey, result, 3600);
  return result;
}

export async function getTopUsers({ site = 'stackoverflow', limit = 20 }) {
  const { data } = await axios.get('https://api.stackexchange.com/2.3/users', {
    params: { site, pagesize: limit, order: 'desc', sort: 'reputation' },
  });
  return { users: data.items };
}

