---
name: Fandom Wiki MediaWiki API pattern (bemora gaming provider)
description: How bemora sources game data (CrossFire, and any other Fandom-hosted game wiki) with no official API, via the generic MediaWiki API
---

CrossFire (and many other games) have no official public API. Fandom wikis (`<game>.fandom.com`) expose the standard **MediaWiki Action API** at `https://<game>.fandom.com/api.php`, which works generically for any Fandom wiki, not just CrossFire.

Key actions used:
- `list=categorymembers` — list pages in a category (weapons, maps, characters), paginated via `cmlimit`.
- `action=parse` + `prop=wikitext` or `images` — get a single page's infobox/wikitext for structured fields (damage, rate of fire, etc.) and image URLs.
- `list=search` — free-text search across the wiki (used for `crossfireSearch` / generic `searchGameWiki`).
- `list=recentchanges` — used as a proxy for "events" since Fandom wikis don't have a dedicated events/news endpoint; recent edits to event-related pages double as a live events feed.

**Why:** Fandom-hosted community wikis are often the *only* structured data source for games without official APIs, and the API shape is identical across every Fandom wiki — so the same client code generalizes to Valorant, Apex, Overwatch, etc. by just swapping the subdomain.

**How to apply:** when a user asks for data on a game with no official API, check `<gamename>.fandom.com/api.php` before giving up — build category listing + infobox parsing + search against it rather than scraping HTML.

## Related provider quirks (anime/quotes/tech providers)
- Jikan API (MyAnimeList, `api.jikan.moe/v4`) has a strict ~3 req/sec limit — rapid
  sequential calls (including in test scripts) get 429s; add ~500ms delay between calls.
- `api.animechan.io/v1` (not animechan.xyz/.io) is the alive anime-quotes endpoint;
  `yurippe.vercel.app/api/quotes` works as a fallback and for character-based search.
- GitHub's Markdown render API (`api.github.com/markdown`) requires POST, not GET.
- `restful-api.dev/objects` only has ~13 demo device records — usable as a lightweight
  device/spec lookup, not a real GSMArena-scale catalog; don't oversell scope to users.

## Host-injection risk
Both Fandom subdomains (`{wiki}.fandom.com`) and Wikipedia's `{language}.wikipedia.org`
are built by interpolating a user-supplied string directly into the URL host — always
validate that param against a strict subdomain/locale regex before use.

Wikipedia's MediaWiki API also now rejects requests with no `User-Agent` header (403,
"set a user-agent and respect our robot policy") — always send an explicit UA string on
every Wikipedia call (search and health-check pings included).
