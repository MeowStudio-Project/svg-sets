/**
 * Icon JSON + ZIP hosted on the data repo (not on Cloudflare Pages).
 * Using GitHub raw — jsDelivr rejects repos/packages over 50 MB.
 */
export const DATA_BASE =
  'https://raw.githubusercontent.com/MeowStudio-Project/svg-sets-data/main';

export function jsonUrl(source: string): string {
  const path = source.split('/').map(encodeURIComponent).join('/');
  return `${DATA_BASE}/json/${path}`;
}

export function archiveUrl(name: string): string {
  return `${DATA_BASE}/archives/${encodeURIComponent(name)}`;
}
