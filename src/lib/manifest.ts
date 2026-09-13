import type { SvgManifest, SvgSet } from './types';
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
