/**
 * CrossFire data via the CrossFire Fandom wiki (no key, no scraping).
 *
 * Run: node examples/gaming-crossfire.js
 *
 * CrossFire has no official public API, so bemora reads the community wiki's
 * standard MediaWiki API (category listing + infobox parse + search +
 * recent-changes-as-events). The same client generalizes to any Fandom wiki
 * via gaming.searchGameWiki({ wiki: 'valorant', query: 'Jett' }).
 */
import Bemora from '../src/index.js';

const api = new Bemora({}, { logLevel: 'silent' });

const weapons = await api.gaming.crossfireWeapons({ limit: 5 });
console.log('weapons:', weapons.weapons?.map((w) => w.name) ?? weapons);

const ak = await api.gaming.crossfireWeapon({ name: 'AK-47' });
console.log('AK-47:', { name: ak.name, image: ak.image?.slice(0, 80), wiki: ak.wiki });

const maps = await api.gaming.crossfireMaps({ limit: 5 });
console.log('maps:', maps.maps?.map((m) => m.name) ?? maps);

const events = await api.gaming.crossfireEvents({ limit: 5 });
console.log('recent wiki events:', events.events?.length ?? events);

const search = await api.gaming.crossfireSearch({ query: 'Desert Eagle' });
console.log('search hits:', search.results?.length ?? search);
