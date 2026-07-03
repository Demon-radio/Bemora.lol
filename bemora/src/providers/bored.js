import axios from 'axios';

const FALLBACK_ACTIVITIES = [
  { activity: 'Learn a new programming language', type: 'education' },
  { activity: 'Go for a 20-minute walk', type: 'recreational' },
  { activity: 'Read a chapter of a book', type: 'education' },
  { activity: 'Call an old friend', type: 'social' },
  { activity: 'Declutter your workspace', type: 'busywork' },
  { activity: 'Try a new recipe', type: 'cooking' },
  { activity: 'Meditate for 10 minutes', type: 'relaxation' },
  { activity: 'Write down three things you are grateful for', type: 'relaxation' },
];

export async function getActivity({ type } = {}) {
  try {
    const params = type ? { type } : {};
    const { data } = await axios.get('https://bored-api.appbrewery.com/random', { params, timeout: 5000 });
    return { activity: data.activity, type: data.type, participants: data.participants, price: data.price, _source: 'bored-api' };
  } catch (e) {
    const pool = type ? FALLBACK_ACTIVITIES.filter((a) => a.type === type) : FALLBACK_ACTIVITIES;
    const list = pool.length ? pool : FALLBACK_ACTIVITIES;
    const pick = list[Math.floor(Math.random() * list.length)];
    return { ...pick, _source: 'fallback' };
  }
}
