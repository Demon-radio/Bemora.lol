import axios from 'axios';

export async function getRandomAdvice() {
  const { data } = await axios.get('https://api.adviceslip.com/advice');
  return { id: data.slip?.id, advice: data.slip?.advice };
}

export async function searchAdvice({ query }) {
  const { data } = await axios.get('https://api.adviceslip.com/advice/search/' + encodeURIComponent(query));
  const slips = data.slips || [];
  return { query, count: slips.length, results: slips.map((s) => ({ id: s.id, advice: s.advice })) };
}
