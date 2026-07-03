export function placeholderImage({ width = 400, height = 300, text, bg = 'cccccc', fg = '969696' } = {}) {
  const label = text ? `&text=${encodeURIComponent(text)}` : '';
  return {
    width, height,
    url: `https://placehold.co/${width}x${height}/${bg}/${fg}.png${label ? '?' + label.slice(1) : ''}`,
  };
}

export function picsumImage({ width = 400, height = 300, seed, grayscale = false, blur = 0 } = {}) {
  const base = seed ? `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}` : `https://picsum.photos/${width}/${height}`;
  const params = [];
  if (grayscale) params.push('grayscale');
  if (blur) params.push(`blur=${blur}`);
  const url = params.length ? `${base}?${params.join('&')}` : base;
  return { width, height, seed: seed || null, url };
}

export function avatarUrl({ name, size = 128, background, color = 'fff', rounded = true } = {}) {
  const params = new URLSearchParams({ name, size: String(size), color, rounded: String(rounded) });
  if (background) params.set('background', background);
  return { name, url: `https://ui-avatars.com/api/?${params.toString()}` };
}

export function dicebearAvatar({ seed = 'bemora', style = 'identicon' } = {}) {
  return { seed, style, url: `https://api.dicebear.com/9.x/${encodeURIComponent(style)}/svg?seed=${encodeURIComponent(seed)}` };
}
