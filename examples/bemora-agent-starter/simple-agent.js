// bemora-agent-starter — your AI agent with 100+ tools!
import Bemora from 'bemora';
import { readFileSync } from 'node:fs';

// Initialize bemora
const api = new Bemora({
  // Load your .env file or pass keys here
});

console.log('🤖 Bemora Agent Started!');
console.log('Type "help" for commands, "exit" to quit\n');

// Command-line interface
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', async (input) => {
  const command = input.trim().toLowerCase();
  if (command === 'exit' || command === 'quit') {
    console.log('👋 Goodbye!');
    process.exit(0);
  } else if (command === 'help') {
    printHelp();
  } else if (command === 'weather') {
    await getWeather();
  } else if (command === 'crypto') {
    await getCrypto();
  } else if (command.startsWith('translate')) {
    await translate(command);
  } else {
    console.log(`❓ Unknown command: ${command}`);
    printHelp();
  }
});

function printHelp() {
  console.log('\n📋 Available commands:');
  console.log('  weather    - Get current weather in Cairo');
  console.log('  crypto     - Get Bitcoin price');
  console.log('  translate [text] [to-lang] - Translate text');
  console.log('  exit       - Quit');
}

async function getWeather() {
  try {
    const data = await api.weather.current({ city: 'Cairo' });
    console.log(`\n☀️ Weather in Cairo: ${data.temperature}°C, ${data.description}`);
  } catch (e) {
    console.error(`❌ Weather error: ${e.message}`);
  }
}

async function getCrypto() {
  try {
    const data = await api.crypto.price({ coins: 'bitcoin' });
    console.log(`\n₿ Bitcoin price: $${data.prices[0].price}`);
  } catch (e) {
    console.error(`❌ Crypto error: ${e.message}`);
  }
}

async function translate(command) {
  const parts = command.split(' ');
  const text = parts.slice(1, -1).join(' ');
  const to = parts[parts.length - 1];
  if (!text || !to) {
    console.log('Usage: translate [text] [to-lang] (e.g. translate "hello world" fr)');
    return;
  }
  try {
    const result = await api.translate.text({ text, to });
    console.log(`\n🔤 Translation: ${result.translated}`);
  } catch (e) {
    console.error(`❌ Translation error: ${e.message}`);
  }
}
