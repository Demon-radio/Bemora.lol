import axios from 'axios';
import * as cache from '../core/cache.js';

/**
 * GitHub user profile (Free, no key for public data)
 * @param {{ username: string }} params
 */
export async function githubUser({ username }) {
  const cacheKey = `social:github:user:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://api.github.com/users/${username}`, {
    headers: { 'User-Agent': 'bemora/3.2.0 (+https://github.com/bemora/bemora)' },
  });

  const result = {
    username: data.login,
    name: data.name,
    bio: data.bio,
    avatar: data.avatar_url,
    url: data.html_url,
    location: data.location,
    company: data.company,
    blog: data.blog,
    public_repos: data.public_repos,
    public_gists: data.public_gists,
    followers: data.followers,
    following: data.following,
    created_at: data.created_at,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * GitHub repo info
 * @param {{ owner: string, repo: string }} params
 */
export async function githubRepo({ owner, repo }) {
  const cacheKey = `social:github:repo:${owner}/${repo}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'bemora/3.2.0 (+https://github.com/bemora/bemora)' },
  });

  const result = {
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    url: data.html_url,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    language: data.language,
    topics: data.topics,
    open_issues: data.open_issues_count,
    size_kb: data.size,
    created_at: data.created_at,
    updated_at: data.updated_at,
    license: data.license?.name,
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * GitHub trending repos (via unofficial scraping-free endpoint)
 * @param {{ language?: string, since?: 'daily'|'weekly'|'monthly' }} params
 */
export async function githubTrending({ language = '', since = 'daily' } = {}) {
  const cacheKey = `social:github:trending:${language}:${since}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data } = await axios.get('https://gh-trending-api.herokuapp.com/repositories', {
    params: { language, since },
  });

  const result = {
    repos: (Array.isArray(data) ? data : []).slice(0, 25).map((r) => ({
      name: r.repository,
      author: r.username,
      url: r.url,
      description: r.description,
      language: r.language,
      stars: r.stars,
      forks: r.forks,
      stars_today: r.currentPeriodStars,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}

/**
 * Hacker News top stories (Free, no key)
 * @param {{ limit?: number }} params
 */
export async function hackerNewsTop({ limit = 10 } = {}) {
  const cacheKey = `social:hn:top:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const { data: ids } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');

  const stories = await Promise.all(
    ids.slice(0, limit).map((id) =>
      axios
        .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        .then((r) => r.data)
    )
  );

  const result = {
    stories: stories.map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      score: s.score,
      by: s.by,
      comments: s.descendants,
      time: new Date(s.time * 1000).toISOString(),
      hn_url: `https://news.ycombinator.com/item?id=${s.id}`,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 900);
  return result;
}

/**
 * Product Hunt top posts (requires no auth for basic access via public API)
 * Returns curated tech launches of the day.
 */
export async function productHuntToday() {
  const cacheKey = 'social:ph:today';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.post(
    'https://api.producthunt.com/v2/api/graphql',
    {
      query: `{ posts(first: 10, order: VOTES) { edges { node { name tagline votesCount website thumbnail { url } } } } }`,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const result = {
    posts: (data?.data?.posts?.edges || []).map((e) => ({
      name: e.node.name,
      tagline: e.node.tagline,
      votes: e.node.votesCount,
      website: e.node.website,
      thumbnail: e.node.thumbnail?.url,
    })),
    _cached: false,
  };

  cache.set(cacheKey, result, 3600);
  return result;
}
