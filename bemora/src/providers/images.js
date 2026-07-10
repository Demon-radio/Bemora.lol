import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';
import { logger } from '../core/logger.js';

const http = httpClient();

export async function searchPhotos({ query, perPage = 10, orientation }, apiKey) {
  const cacheKey = `images:search:${query}:${perPage}:${orientation}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: perPage, orientation },
      headers: { Authorization: `Client-ID ${apiKey}` },
    });

    const result = {
      total: data.total,
      photos: data.results.map((p) => ({
        id: p.id,
        description: p.alt_description,
        width: p.width,
        height: p.height,
        color: p.color,
        urls: {
          full: p.urls.full,
          regular: p.urls.regular,
          small: p.urls.small,
          thumb: p.urls.thumb,
        },
        author: p.user.name,
        author_link: p.user.links.html,
        download_link: p.links.download,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 1800);
    logger.info(`Photos searched: "${query}" (${result.total} results)`);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'images');
  }
}

export async function getRandomPhoto({ query, orientation } = {}, apiKey) {
  try {
    const { data } = await http.get('https://api.unsplash.com/photos/random', {
      params: { query, orientation },
      headers: { Authorization: `Client-ID ${apiKey}` },
    });

    return {
      id: data.id,
      description: data.alt_description,
      urls: {
        full: data.urls.full,
        regular: data.urls.regular,
        small: data.urls.small,
      },
      author: data.user.name,
      author_link: data.user.links.html,
      _cached: false,
    };
  } catch (err) {
    throw wrapProviderError(err, 'images');
  }
}

export async function searchPexels({ query, perPage = 10, orientation }, apiKey) {
  const cacheKey = `images:pexels:${query}:${perPage}:${orientation}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get('https://api.pexels.com/v1/search', {
      params: { query, per_page: perPage, orientation },
      headers: { Authorization: apiKey },
    });

    const result = {
      total: data.total_results,
      photos: data.photos.map((p) => ({
        id: p.id,
        width: p.width,
        height: p.height,
        photographer: p.photographer,
        photographer_url: p.photographer_url,
        src: {
          original: p.src.original,
          large: p.src.large,
          medium: p.src.medium,
          small: p.src.small,
          tiny: p.src.tiny,
        },
        alt: p.alt,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 1800);
    logger.info(`Pexels searched: "${query}" (${result.total} results)`);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'images');
  }
}
