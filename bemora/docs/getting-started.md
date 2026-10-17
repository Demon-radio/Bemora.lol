# Getting started

```bash
npm install bemora
```

Copy `.env.example` to `.env` and fill in the keys you need (most providers are free, many need no key at all):

```bash
cp .env.example .env
```

```js
import Bemora from 'bemora';
const api = new Bemora(); // auto-reads BEMORA_*_KEY from .env

const weather = await api.weather.current({ city: 'Cairo' });
console.log(`${weather.city}: ${weather.temperature}°C`);

// No-key providers work with zero setup:
const iss = await api.space.issPosition();
const meal = await api.food.random();
```

Next: [installation](installation.md) · [configuration](configuration.md) · [providers](providers.md)
