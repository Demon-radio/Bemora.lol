import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';
import * as cache from '../core/cache.js';

const http = httpClient();

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

/**
 * Fetch compound properties by name from PubChem.
 * @param {Object} params
 * @param {string} params.name - compound name
 * @returns {Promise<Object>} compound properties
 */
export async function compound({ name } = {}) {
  const cacheKey = `pubchem:compound:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON`
    );
    const p = data.PropertyTable?.Properties?.[0] || {};
    const result = {
      name,
      cid: p.CID,
      formula: p.MolecularFormula,
      molecularWeight: p.MolecularWeight,
      smiles: p.CanonicalSMILES,
      iupacName: p.IUPACName,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'pubchem');
  }
}

/**
 * Fetch compound properties by CID from PubChem.
 * @param {Object} params
 * @param {string|number} params.cid - PubChem compound id
 * @returns {Promise<Object>} compound properties
 */
export async function compoundByCid({ cid } = {}) {
  const cacheKey = `pubchem:compoundByCid:${cid}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/compound/cid/${encodeURIComponent(cid)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON`
    );
    const p = data.PropertyTable?.Properties?.[0] || {};
    const result = {
      cid,
      formula: p.MolecularFormula,
      molecularWeight: p.MolecularWeight,
      smiles: p.CanonicalSMILES,
      iupacName: p.IUPACName,
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'pubchem');
  }
}

/**
 * Fetch synonyms for a compound name from PubChem.
 * @param {Object} params
 * @param {string} params.name - compound name
 * @returns {Promise<Object>} name plus synonyms array
 */
export async function synonyms({ name } = {}) {
  const cacheKey = `pubchem:synonyms:${name}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, _cached: true };
  try {
    const { data } = await http.get(
      `${BASE}/compound/name/${encodeURIComponent(name)}/synonyms/JSON`
    );
    const result = {
      name,
      synonyms: (data.InformationList?.Information?.[0]?.Synonym || []).slice(0, 20),
      _cached: false,
    };
    cache.set(cacheKey, result, 86400);
    return result;
  } catch (err) {
    throw wrapProviderError(err, 'pubchem');
  }
}
