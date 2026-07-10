import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

export async function getRandomAdvice() {
  try {
    const { data } = await http.get('https://api.adviceslip.com/advice');
    return { id: data.slip?.id, advice: data.slip?.advice };
  } catch (err) {
    throw wrapProviderError(err, 'advice');
  }
}

export async function searchAdvice({ query }) {
  try {
    const { data } = await http.get('https://api.adviceslip.com/advice/search/' + encodeURIComponent(query));
    const slips = data.slips || [];
    return { query, count: slips.length, results: slips.map((s) => ({ id: s.id, advice: s.advice })) };
  } catch (err) {
    throw wrapProviderError(err, 'advice');
  }
}
