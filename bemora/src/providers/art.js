import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

/**
 * Art Institute of Chicago — Free, no key
 * 100,000+ artworks
 */
const AIC = 'https://api.artic.edu/api/v1';

/**
 * Search artworks at the Art Institute of Chicago (Free, no key)
 * @param {{ query: string, limit?: number, page?: number }} params
 */
export async function searchArtworks({ query, limit = 10, page = 1 }) {
  const cacheKey = `art:aic:${query}:${limit}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${AIC}/artworks/search`, {
      params: {
        q: query,
        limit,
        page,
        fields: 'id,title,artist_display,date_display,medium_display,dimensions,place_of_origin,style_title,image_id,department_title,artwork_type_title',
      },
    });

    const result = {
      total: data.pagination?.total,
      artworks: data.data.map((a) => ({
        id: a.id,
        title: a.title,
        artist: a.artist_display,
        date: a.date_display,
        medium: a.medium_display,
        dimensions: a.dimensions,
        origin: a.place_of_origin,
        style: a.style_title,
        type: a.artwork_type_title,
        department: a.department_title,
        image: a.image_id ? `https://www.artic.edu/iiif/2/${a.image_id}/full/843,/0/default.jpg` : null,
        url: `https://www.artic.edu/artworks/${a.id}`,
      })),
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'art');
  }
}

/**
 * Get artwork details by ID
 * @param {{ id: number }} params
 */
export async function getArtwork({ id }) {
  const cacheKey = `art:aic:detail:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  try {
    const { data } = await http.get(`${AIC}/artworks/${id}`);
    const a = data.data;

    const result = {
      id: a.id, title: a.title, artist: a.artist_display,
      date: a.date_display, medium: a.medium_display,
      dimensions: a.dimensions, origin: a.place_of_origin,
      style: a.style_title, description: a.description,
      image: a.image_id ? `https://www.artic.edu/iiif/2/${a.image_id}/full/843,/0/default.jpg` : null,
      url: `https://www.artic.edu/artworks/${a.id}`,
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'art');
  }
}

/**
 * Metropolitan Museum of Art — Free, no key
 * 400,000+ artworks
 */
const MET = 'https://collectionapi.metmuseum.org/public/collection/v1';

/**
 * Search the Metropolitan Museum of Art collection (Free, no key)
 * @param {{ query: string, isHighlight?: boolean, hasImages?: boolean }} params
 */
export async function searchMet({ query, isHighlight = false, hasImages = true }) {
  const cacheKey = `art:met:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const params = { q: query };
  if (isHighlight) params.isHighlight = true;
  if (hasImages) params.hasImages = true;

  try {
    const { data } = await http.get(`${MET}/search`, { params });

    if (!data.total) return { total: 0, artworks: [], _cached: false };

    const ids = data.objectIDs.slice(0, 10);
    const artworks = await Promise.allSettled(ids.map((id) => getMetArtwork({ id })));

    const result = {
      total: data.total,
      artworks: artworks
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value),
      _cached: false,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'art');
  }
}

/**
 * Get Met artwork by ID
 * @param {{ id: number }} params
 */
export async function getMetArtwork({ id }) {
  const cacheKey = `art:met:object:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await http.get(`${MET}/objects/${id}`);

    const result = {
      id: data.objectID,
      title: data.title,
      artist: data.artistDisplayName,
      date: data.objectDate,
      medium: data.medium,
      classification: data.classification,
      department: data.department,
      country: data.country,
      period: data.period,
      image: data.primaryImageSmall || data.primaryImage,
      url: data.objectURL,
      is_highlight: data.isHighlight,
      is_public_domain: data.isPublicDomain,
    };

    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'art');
  }
}
