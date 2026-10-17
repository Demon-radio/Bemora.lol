import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();
const BASE_PUBMED = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

function mapArticle(uid, r) {
  return {
    pmid: uid,
    title: r.title,
    pubdate: r.pubdate,
    source: r.source,
    authors: (r.authors || []).map((a) => a.name),
  };
}

/**
 * Search PubMed articles.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 */
export async function pubmedSearch({ query, limit = 10 }) {
  const cacheKey = `biomed:pubmed:search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_PUBMED}/esearch.fcgi`, {
      params: { db: 'pubmed', term: query, retmode: 'json', retmax: limit },
    });
    const ids = data.esearchresult?.idlist || [];
    let articles = [];
    if (ids.length) {
      const { data: summary } = await http.get(`${BASE_PUBMED}/esummary.fcgi`, {
        params: { db: 'pubmed', id: ids.join(','), retmode: 'json' },
      });
      articles = ids.map((uid) => mapArticle(uid, summary.result?.[uid] || {}));
    }
    const result = { query, count: parseInt(data.esearchresult?.count, 10), articles, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'biomed');
  }
}

/**
 * Fetch PubMed article summaries by id(s).
 * @param {Object} params
 * @param {(string|string[])} params.ids
 */
export async function pubmedSummary({ ids }) {
  const idList = Array.isArray(ids) ? ids : String(ids).split(',');
  const cacheKey = `biomed:pubmed:summary:${idList.join(',')}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(`${BASE_PUBMED}/esummary.fcgi`, {
      params: { db: 'pubmed', id: idList.join(','), retmode: 'json' },
    });
    const articles = idList.map((uid) => mapArticle(uid, data.result?.[uid] || {}));
    const result = { articles, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'biomed');
  }
}

/**
 * Search ClinicalTrials.gov studies.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 */
export async function clinicalTrials({ query, limit = 10 }) {
  const cacheKey = `biomed:clinicaltrials:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://clinicaltrials.gov/api/v2/studies', {
      params: {
        'query.term': query,
        pageSize: limit,
        fields: 'NCTId,BriefTitle,OverallStatus,Phase,LeadSponsorName,StartDate',
      },
    });
    const studies = data.studies || [];
    const trials = studies.map((s) => ({
      nct_id: s.protocolSection?.identificationModule?.nctId,
      title: s.protocolSection?.identificationModule?.briefTitle,
      status: s.protocolSection?.statusModule?.overallStatus,
      phase: s.protocolSection?.designModule?.phases,
      sponsor: s.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name,
      start_date: s.protocolSection?.statusModule?.startDateStruct?.date,
    }));
    const result = { query, count: studies.length, trials, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'biomed');
  }
}

/**
 * Search Europe PMC articles.
 * @param {Object} params
 * @param {string} params.query
 * @param {number} [params.limit]
 */
export async function europePmc({ query, limit = 10 }) {
  const cacheKey = `biomed:europepmc:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get('https://www.ebi.ac.uk/europepmc/webservices/rest/search', {
      params: { query, format: 'json', pageSize: limit },
    });
    const list = data.resultList?.result || [];
    const articles = list.map((a) => ({
      id: a.id,
      source: a.source,
      title: a.title,
      authorString: a.authorString,
      pubYear: a.pubYear,
      journalTitle: a.journalTitle,
      doi: a.doi,
      abstractText: a.abstractText,
    }));
    const result = { query, count: data.hitCount, articles, _cached: false };
    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'biomed');
  }
}
