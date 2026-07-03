import axios from 'axios';

/**
 * Render Markdown to HTML using GitHub's Markdown API (free, no key needed for basic mode)
 * @param {{ text: string, mode?: 'markdown'|'gfm', context?: string }} params
 */
export async function render({ text, mode = 'gfm', context } = {}) {
  if (!text) throw new Error('text is required');
  const body = { text, mode };
  if (context) body.context = context;

  const { data } = await axios.post('https://api.github.com/markdown', body, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  return { html: data, mode };
}

/**
 * Render raw text as GitHub-Flavored Markdown (shortcut for GFM auto-linking of issues/mentions)
 * @param {{ text: string }} params
 */
export async function renderGfm({ text }) {
  const { data } = await axios.post(
    'https://api.github.com/markdown/raw',
    text,
    { headers: { 'Content-Type': 'text/plain', Accept: 'application/vnd.github+json' } }
  );
  return { html: data };
}

/**
 * Basic markdown document stats — word count, heading count, link count, code block count
 * @param {{ text: string }} params
 */
export function analyze({ text }) {
  if (!text) throw new Error('text is required');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const headings = (text.match(/^#{1,6}\s.+$/gm) || []).length;
  const links = (text.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
  const images = (text.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
  const readingTimeMinutes = Math.max(1, Math.round(words / 200));

  return { words, headings, links, images, codeBlocks, readingTimeMinutes };
}
