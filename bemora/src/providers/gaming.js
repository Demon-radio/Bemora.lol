import { httpClient } from '../core/http.js';
import { ValidationError, wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const CF_WIKI = 'https://crossfirefps.fandom.com/api.php';

async function cfCategory(category, limit = 30) {
  try {
    const { data } = await http.get(CF_WIKI, {
      params: { action: 'query', list: 'categorymembers', cmtitle: `Category:${category}`, cmlimit: limit, format: 'json' },
    });
    return (data.query?.categorymembers || []).map((p) => ({ pageId: p.pageid, title: p.title }));
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

async function cfThumbnails(titles) {
  if (!titles.length) return {};
  try {
    const { data } = await http.get(CF_WIKI, {
      params: { action: 'query', prop: 'pageimages', titles: titles.join('|'), format: 'json', pithumbsize: 400 },
    });
    const pages = data.query?.pages || {};
    const map = {};
    for (const key of Object.keys(pages)) {
      const p = pages[key];
      map[p.title] = p.thumbnail?.source || null;
    }
    return map;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getCrossfireWeapons({ limit = 40 } = {}) {
  const cacheKey = `gaming:crossfire:weapons:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const items = await cfCategory('Weapons', limit);
  const thumbs = await cfThumbnails(items.map((i) => i.title));
  const result = {
    count: items.length,
    weapons: items.map((i) => ({ name: i.title, image: thumbs[i.title] || null, wiki: `https://crossfirefps.fandom.com/wiki/${encodeURIComponent(i.title.replace(/ /g, '_'))}` })),
    source: 'CrossFire Fandom Wiki',
    _cached: false,
  };
  cache.set(cacheKey, result, 21600);
  return result;
}

export async function getCrossfireWeapon({ name }) {
  const cacheKey = `gaming:crossfire:weapon:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(CF_WIKI, {
      params: { action: 'query', list: 'search', srsearch: name, srlimit: 1, format: 'json' },
    });
    const hit = data.query?.search?.[0];
    if (!hit) return { found: false, name, _cached: false };

    const { data: pageData } = await http.get(CF_WIKI, {
      params: { action: 'parse', page: hit.title, prop: 'wikitext|images', format: 'json' },
    });
    const wikitext = pageData.parse?.wikitext?.['*'] || '';
    const infobox = {};
    const infoboxMatch = wikitext.match(/\{\{Infobox[\s\S]*?\n\}\}/i);
    if (infoboxMatch) {
      const lines = infoboxMatch[0].split('\n');
      for (const line of lines) {
        const m = line.match(/^\|\s*([\w\s]+?)\s*=\s*(.+)$/);
        if (m) infobox[m[1].trim()] = m[2].trim().replace(/\[\[|\]\]/g, '');
      }
    }
    const thumbs = await cfThumbnails([hit.title]);
    const result = {
      found: true,
      name: hit.title,
      image: thumbs[hit.title] || null,
      infobox,
      wiki: `https://crossfirefps.fandom.com/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`,
      _cached: false,
    };
    cache.set(cacheKey, result, 21600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getCrossfireMaps({ limit = 40 } = {}) {
  const cacheKey = `gaming:crossfire:maps:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const items = await cfCategory('Maps', limit);
  const thumbs = await cfThumbnails(items.map((i) => i.title));
  const result = {
    count: items.length,
    maps: items.map((i) => ({ name: i.title, image: thumbs[i.title] || null, wiki: `https://crossfirefps.fandom.com/wiki/${encodeURIComponent(i.title.replace(/ /g, '_'))}` })),
    source: 'CrossFire Fandom Wiki',
    _cached: false,
  };
  cache.set(cacheKey, result, 21600);
  return result;
}

export async function getCrossfireCharacters({ limit = 40 } = {}) {
  const cacheKey = `gaming:crossfire:characters:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const items = await cfCategory('Characters', limit);
  const thumbs = await cfThumbnails(items.map((i) => i.title));
  const result = {
    count: items.length,
    characters: items.map((i) => ({ name: i.title, image: thumbs[i.title] || null, wiki: `https://crossfirefps.fandom.com/wiki/${encodeURIComponent(i.title.replace(/ /g, '_'))}` })),
    source: 'CrossFire Fandom Wiki',
    _cached: false,
  };
  cache.set(cacheKey, result, 21600);
  return result;
}

export async function getCrossfireGameModes({ limit = 40 } = {}) {
  const cacheKey = `gaming:crossfire:modes:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const items = await cfCategory('Game Modes', limit);
  const result = {
    count: items.length,
    modes: items.map((i) => ({ name: i.title, wiki: `https://crossfirefps.fandom.com/wiki/${encodeURIComponent(i.title.replace(/ /g, '_'))}` })),
    source: 'CrossFire Fandom Wiki',
    _cached: false,
  };
  cache.set(cacheKey, result, 21600);
  return result;
}

export async function getCrossfireEvents({ limit = 15 } = {}) {
  const cacheKey = `gaming:crossfire:events:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(CF_WIKI, {
      params: { action: 'query', list: 'recentchanges', rcnamespace: 0, rclimit: limit, rcprop: 'title|timestamp|ids', format: 'json' },
    });
    const changes = data.query?.recentchanges || [];
    const result = {
      count: changes.length,
      events: changes.map((c) => ({
        title: c.title,
        timestamp: c.timestamp,
        wiki: `https://crossfirefps.fandom.com/wiki/${encodeURIComponent(c.title.replace(/ /g, '_'))}`,
      })),
      source: 'CrossFire Fandom Wiki (recent changes)',
      _cached: false,
    };
    cache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function searchCrossfireWiki({ query, limit = 10 }) {
  try {
    const { data } = await http.get(CF_WIKI, {
      params: { action: 'query', list: 'search', srsearch: query, srlimit: limit, format: 'json' },
    });
    const results = data.query?.search || [];
    return {
      query,
      count: results.length,
      results: results.map((r) => ({
        title: r.title,
        snippet: r.snippet.replace(/<[^>]+>/g, ''),
        wiki: `https://crossfirefps.fandom.com/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function searchFortniteCosmetic({ name }) {
  const cacheKey = `gaming:fortnite:cosmetic:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://fortnite-api.com/v2/cosmetics/br/search', { params: { name } });
    const item = data.data;
    const result = {
      found: !!item,
      name: item?.name,
      description: item?.description,
      type: item?.type?.displayValue,
      rarity: item?.rarity?.displayValue,
      image: item?.images?.icon,
      introduction: item?.introduction?.text,
      _cached: false,
    };
    cache.set(cacheKey, result, 21600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getFortniteShop() {
  const cacheKey = 'gaming:fortnite:shop';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://fortnite-api.com/v2/shop');
    const entries = data.data?.entries || [];
    const result = {
      date: data.data?.date,
      count: entries.length,
      items: entries.slice(0, 40).map((e) => ({
        name: e.brItems?.[0]?.name || e.tracks?.[0]?.title || 'Unknown',
        price: e.finalPrice,
        image: e.brItems?.[0]?.images?.icon || e.tracks?.[0]?.albumArt,
        rarity: e.brItems?.[0]?.rarity?.displayValue,
      })),
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getLolChampions() {
  const cacheKey = 'gaming:lol:champions';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data: versions } = await http.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versions[0];
    const { data } = await http.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    const champions = Object.values(data.data).map((c) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      tags: c.tags,
      image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
    }));
    const result = { version, count: champions.length, champions, _cached: false };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getLolChampion({ name }) {
  const cacheKey = `gaming:lol:champion:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data: versions } = await http.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versions[0];
    const id = name.charAt(0).toUpperCase() + name.slice(1);
    const { data } = await http.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${id}.json`);
    const c = Object.values(data.data)[0];
    if (!c) return { found: false, name, _cached: false };
    const result = {
      found: true,
      id: c.id,
      name: c.name,
      title: c.title,
      lore: c.lore,
      tags: c.tags,
      stats: c.stats,
      spells: c.spells?.map((s) => ({ name: s.name, description: s.description })),
      image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getMinecraftPlayer({ username }) {
  try {
    const { data } = await http.get(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);
    if (!data?.id) return { found: false, username };
    return {
      found: true,
      username: data.name,
      uuid: data.id,
      avatar: `https://crafatar.com/avatars/${data.id}`,
      skin: `https://crafatar.com/skins/${data.id}`,
      render: `https://crafatar.com/renders/body/${data.id}`,
    };
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getMinecraftServerStatus({ host }) {
  try {
    const { data } = await http.get(`https://api.mcsrvstat.us/3/${encodeURIComponent(host)}`);
    return {
      host,
      online: data.online,
      players: data.players ? { online: data.players.online, max: data.players.max } : null,
      version: data.version,
      motd: data.motd?.clean?.join(' '),
    };
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getChessPlayer({ username }) {
  try {
    const [{ data: profile }, statsRes] = await Promise.all([
      http.get(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`),
      http.get(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`).catch(() => ({ data: {} })),
    ]);
    const stats = statsRes.data;
    return {
      username: profile.username,
      name: profile.name,
      title: profile.title,
      avatar: profile.avatar,
      country: profile.country,
      followers: profile.followers,
      joined: profile.joined,
      rapid: stats.chess_rapid?.last?.rating,
      blitz: stats.chess_blitz?.last?.rating,
      bullet: stats.chess_bullet?.last?.rating,
    };
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function getChessDailyPuzzle() {
  const cacheKey = 'gaming:chess:daily-puzzle';
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://lichess.org/api/puzzle/daily');
    const result = {
      id: data.puzzle?.id,
      rating: data.puzzle?.rating,
      themes: data.puzzle?.themes,
      solution: data.puzzle?.solution,
      gameId: data.game?.id,
      pgn: data.game?.pgn,
      _cached: false,
    };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

export async function searchGameWiki({ wiki, query, limit = 10 }) {
  if (!/^[a-z0-9][a-z0-9-]{0,60}$/i.test(wiki)) {
    throw new ValidationError(`Invalid wiki name: "${wiki}". Must be a plain subdomain (letters, numbers, hyphens only).`, { provider: 'gaming' });
  }
  try {
    const { data } = await http.get(`https://${wiki}.fandom.com/api.php`, {
      params: { action: 'query', list: 'search', srsearch: query, srlimit: limit, format: 'json' },
    });
    const results = data.query?.search || [];
    return {
      wiki,
      query,
      count: results.length,
      results: results.map((r) => ({
        title: r.title,
        snippet: r.snippet.replace(/<[^>]+>/g, ''),
        url: `https://${wiki}.fandom.com/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
      })),
    };
  } catch (err) {
    throw wrapProviderError(err, 'gaming');
  }
}

// --- Legacy stubs kept for backward compatibility ---

export async function getFreeFirePlayer({ playerId }) {
  return { playerId, stats: { level: 'N/A', matches: 0 }, note: 'Garena does not expose a public Free Fire stats API.' };
}

export async function getPubgPlayer({ playerName, platform = 'steam' }) {
  return { playerName, platform, stats: {}, note: 'PUBG official API requires a partner key not available for free.' };
}

export async function getCrossfireNews() {
  return getCrossfireEvents({ limit: 15 });
}

export async function getFreeFireNews() {
  return { news: [], note: 'No public Free Fire news feed available.' };
}

export async function getPubgPatchNotes() {
  return { patches: [], note: 'No public PUBG patch notes API available.' };
}
