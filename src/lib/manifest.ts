import type { SvgFile, SvgManifest, SvgSet } from './types';
import { jsonUrl } from './dataBase';
import manifestData from '../data/manifest.json';

export const manifest = manifestData as SvgManifest;

export function getAllSets(): SvgSet[] {
  return manifest.categories.flatMap((c) => c.sets);
}

export function getSetById(id: string): SvgSet | undefined {
  return getAllSets().find((s) => s.id === id);
}

export function searchSets(query: string): SvgManifest['categories'] {
  const q = query.trim().toLowerCase();
  if (!q) return manifest.categories;

  const result: SvgManifest['categories'] = [];
  for (const cat of manifest.categories) {
    const matched = cat.sets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.authorName && s.authorName.toLowerCase().includes(q))
    );
    if (matched.length > 0) {
      result.push({ name: cat.name, sets: matched });
    }
  }
  return result;
}

type RawIcon = {
  body?: string;
  light?: string;
  dark?: string;
  width?: number;
  height?: number;
};

/** Fetch full icon list for a set from /json/{source} */
export async function loadSetFiles(set: SvgSet): Promise<SvgFile[]> {
  const url = jsonUrl(set.source);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load set: ${res.status}`);
  }
  const raw = await res.json();
  const icons = raw.icons;
  if (!icons || typeof icons !== 'object') return [];

  const defaultH =
    (typeof raw.height === 'number' && raw.height > 0 && raw.height) ||
    (typeof raw.info?.height === 'number' && raw.info.height > 0 && raw.info.height) ||
    24;
  const defaultW =
    (typeof raw.width === 'number' && raw.width > 0 && raw.width) ||
    (typeof raw.info?.width === 'number' && raw.info.width > 0 && raw.info.width) ||
    defaultH;

  const files: SvgFile[] = [];
  for (const [key, data] of Object.entries(icons as Record<string, RawIcon>)) {
    if (!data || typeof data !== 'object') continue;
    const body = typeof data.body === 'string' ? data.body : undefined;
    const light = typeof data.light === 'string' ? data.light : undefined;
    const dark = typeof data.dark === 'string' ? data.dark : undefined;
    if (!body && !light && !dark) continue;
    const w = (typeof data.width === 'number' && data.width > 0 && data.width) || defaultW;
    const h = (typeof data.height === 'number' && data.height > 0 && data.height) || defaultH;
    files.push({
      name: key,
      key,
      body: body ?? light ?? dark ?? '',
      light,
      dark,
      width: w,
      height: h,
    });
  }
  files.sort((a, b) => a.key.localeCompare(b.key));
  return files;
}
