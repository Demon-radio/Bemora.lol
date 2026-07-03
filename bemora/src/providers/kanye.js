import axios from 'axios';

export async function getRandomQuote() {
  const { data } = await axios.get('https://api.kanye.rest');
  return { quote: data.quote };
}
