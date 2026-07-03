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
