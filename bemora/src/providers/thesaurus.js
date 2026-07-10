import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();

export async function getSynonyms({ word }) {
  try {
    const { data } = await http.get('https://api.datamuse.com/words', { params: { rel_syn: word, max: 15 } });
    return { word, synonyms: data.map((d) => d.word) };
  } catch (err) {
    throw wrapProviderError(err, 'thesaurus');
  }
}

export async function getAntonyms({ word }) {
  try {
    const { data } = await http.get('https://api.datamuse.com/words', { params: { rel_ant: word, max: 15 } });
    return { word, antonyms: data.map((d) => d.word) };
  } catch (err) {
    throw wrapProviderError(err, 'thesaurus');
  }
}

export async function getRhymes({ word }) {
  try {
    const { data } = await http.get('https://api.datamuse.com/words', { params: { rel_rhy: word, max: 15 } });
    return { word, rhymes: data.map((d) => d.word) };
  } catch (err) {
    throw wrapProviderError(err, 'thesaurus');
  }
}

export async function suggest({ text }) {
  try {
    const { data } = await http.get('https://api.datamuse.com/sug', { params: { s: text, max: 10 } });
    return { text, suggestions: data.map((d) => d.word) };
  } catch (err) {
    throw wrapProviderError(err, 'thesaurus');
  }
}
