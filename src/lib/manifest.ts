import type { IconSearchHit, SvgFile, SvgManifest, SvgSet } from './types';
import { jsonUrl } from './dataBase';
import manifestData from '../data/manifest.json';

export const manifest = manifestData as SvgManifest;

export function getAllSets(): SvgSet[] {
  return manifest.categories.flatMap((c) => c.sets);
}

export function getSetById(id: string): SvgSet | undefined {
  return getAllSets().find((s) => s.id === id);
}

/** Group sets by category (deterministic sort) */
export function groupByCategory(sets: SvgSet[]): SvgManifest['categories'] {
  const map = new Map<string, SvgSet[]>();
  for (const s of sets) {
    const list = map.get(s.category) ?? [];
    list.push(s);
    map.set(s.category, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, list]) => ({
      name,
      sets: list.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

/** Search by SVG Set name / category / author */
export function searchSetsByName(query: string): SvgSet[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllSets().filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.authorName && s.authorName.toLowerCase().includes(q))
  );
}

/** Search by icon key/name inside all sets */
export function searchIcons(query: string): IconSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: IconSearchHit[] = [];
  for (const set of getAllSets()) {
    const keys = set.iconKeys ?? [];
    const matchedKeys = keys.filter((k) => k.toLowerCase().includes(q));
    if (matchedKeys.length > 0) {
      hits.push({ set, matchedKeys });
    }
  }
  // Prefer sets with more matches, then name
  hits.sort((a, b) => {
    const d = b.matchedKeys.length - a.matchedKeys.length;
    if (d !== 0) return d;
    return a.set.name.localeCompare(b.set.name);
  });
  return hits;
}

type RawIcon = {
  body?: string;
  light?: string;
  dark?: string;
  width?: number;
  height?: number;
};

/** Fetch full icon list for a set from data repo */
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
    16;
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
