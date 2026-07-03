import axios from 'axios';

export async function getSynonyms({ word }) {
  const { data } = await axios.get('https://api.datamuse.com/words', { params: { rel_syn: word, max: 15 } });
  return { word, synonyms: data.map((d) => d.word) };
}

export async function getAntonyms({ word }) {
  const { data } = await axios.get('https://api.datamuse.com/words', { params: { rel_ant: word, max: 15 } });
  return { word, antonyms: data.map((d) => d.word) };
}

export async function getRhymes({ word }) {
  const { data } = await axios.get('https://api.datamuse.com/words', { params: { rel_rhy: word, max: 15 } });
  return { word, rhymes: data.map((d) => d.word) };
}

export async function suggest({ text }) {
  const { data } = await axios.get('https://api.datamuse.com/sug', { params: { s: text, max: 10 } });
  return { text, suggestions: data.map((d) => d.word) };
}
