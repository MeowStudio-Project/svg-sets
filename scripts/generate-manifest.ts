import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT, 'json');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');
const ARCHIVES_DIR = path.join(ROOT, 'public', 'archives');

type IconData = {
  body?: string;
  light?: string;
  dark?: string;
};

type RawJson = {
  name?: string;
  category?: string;
  author?: { name?: string; url?: string };
  license?: { name?: string; title?: string; spdx?: string; url?: string };
  info?: {
    name?: string;
    category?: string;
    author?: { name?: string; url?: string };
    license?: { name?: string; title?: string; spdx?: string; url?: string };
  };
  icons?: Record<string, IconData>;
  samples?: string[];
};

type SvgFile = {
  name: string;
  key: string;
  body: string;
  light?: string;
  dark?: string;
};

type SvgSet = {
  id: string;
  name: string;
  category: string;
  authorName?: string;
  authorUrl?: string;
  licenseName?: string;
  licenseUrl?: string;
  samples: string[];
  files: SvgFile[];
  archive?: { name: string; url: string };
};

function walkJsonFiles(dir: string, base = dir): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkJsonFiles(full, base));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

function resolveName(raw: RawJson, filename: string): string {
  if (raw.name && typeof raw.name === 'string') return raw.name.trim();
  if (raw.info?.name && typeof raw.info.name === 'string') return raw.info.name.trim();
  return path.basename(filename, '.json');
}

function resolveCategory(raw: RawJson): string {
  if (raw.category && typeof raw.category === 'string') return raw.category.trim() || 'Uncategorized';
  if (raw.info?.category && typeof raw.info.category === 'string') return raw.info.category.trim() || 'Uncategorized';
  return 'Uncategorized';
}

function resolveAuthorName(raw: RawJson): string | undefined {
  const n = raw.author?.name ?? raw.info?.author?.name;
  return n && typeof n === 'string' ? n.trim() : undefined;
}

function resolveAuthorUrl(raw: RawJson): string | undefined {
  const u = raw.author?.url ?? raw.info?.author?.url;
  return u && typeof u === 'string' ? u.trim() : undefined;
}

function resolveLicenseName(raw: RawJson): string | undefined {
  const l =
    raw.license?.name ??
    raw.license?.title ??
    raw.license?.spdx ??
    raw.info?.license?.name ??
    raw.info?.license?.title ??
    raw.info?.license?.spdx;
  return l && typeof l === 'string' ? l.trim() : undefined;
}

function resolveLicenseUrl(raw: RawJson): string | undefined {
  const u = raw.license?.url ?? raw.info?.license?.url;
  return u && typeof u === 'string' ? u.trim() : undefined;
}

function stableId(relPath: string): string {
  const hash = createHash('sha256').update(relPath).digest('hex').slice(0, 12);
  const base = path.basename(relPath, '.json').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${base}-${hash}`;
}

function processFile(relPath: string): SvgSet | null {
  const fullPath = path.join(SVG_DIR, relPath);
  let raw: RawJson;
  try {
    const text = fs.readFileSync(fullPath, 'utf-8');
    raw = JSON.parse(text) as RawJson;
  } catch (err) {
    console.warn(`[warn] Invalid JSON, skipping: ${relPath}`, err);
    return null;
  }

  const icons = raw.icons;
  if (!icons || typeof icons !== 'object') {
    console.warn(`[warn] No icons object, skipping: ${relPath}`);
    return null;
  }

  const files: SvgFile[] = [];
  for (const [key, data] of Object.entries(icons)) {
    if (!data || typeof data !== 'object') continue;
    const body = typeof data.body === 'string' ? data.body : undefined;
    const light = typeof data.light === 'string' ? data.light : undefined;
    const dark = typeof data.dark === 'string' ? data.dark : undefined;
    if (!body && !light && !dark) continue;
    files.push({
      name: key,
      key,
      body: body ?? light ?? dark ?? '',
      light,
      dark,
    });
  }

  if (files.length === 0) {
    console.warn(`[warn] No valid icons, skipping: ${relPath}`);
    return null;
  }

  // Deterministic order for files
  files.sort((a, b) => a.key.localeCompare(b.key));

  const sampleKeys = Array.isArray(raw.samples) ? raw.samples : [];
  const validSampleKeys = sampleKeys
    .filter((s): s is string => typeof s === 'string')
    .filter((s) => files.some((f) => f.key === s));

  let samples: string[];
  if (validSampleKeys.length > 0) {
    samples = validSampleKeys.slice(0, 6);
  } else {
    samples = files.slice(0, 6).map((f) => f.key);
  }

  const name = resolveName(raw, relPath);
  const category = resolveCategory(raw);
  const authorName = resolveAuthorName(raw) ?? 'Unknown author';
  const authorUrl = resolveAuthorUrl(raw);
  const licenseName = resolveLicenseName(raw);
  const licenseUrl = resolveLicenseUrl(raw);
  const id = stableId(relPath);

  const archiveName = `${id}.zip`;
  const archiveUrl = `/archives/${archiveName}`;

  return {
    id,
    name,
    category,
    authorName,
    authorUrl,
    licenseName,
    licenseUrl,
    samples,
    files,
    archive: {
      name: archiveName,
      url: archiveUrl,
    },
  };
}

async function generateZips(sets: SvgSet[]) {
  // Dynamic import to avoid hard dep if missing
  let JSZip: typeof import('jszip').default | null = null;
  try {
    const mod = await import('jszip');
    JSZip = mod.default;
  } catch {
    console.warn('[warn] jszip not available, skipping ZIP generation');
    return;
  }

  if (!fs.existsSync(ARCHIVES_DIR)) {
    fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
  }

  for (const set of sets) {
    const zip = new JSZip();
    for (const file of set.files) {
      const content = file.body;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n  ${content}\n</svg>\n`;
      zip.file(`${file.key}.svg`, svg);
    }
    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const outPath = path.join(ARCHIVES_DIR, set.archive!.name);
    fs.writeFileSync(outPath, buf);
  }
  console.log(`[info] Generated ${sets.length} ZIP archives`);
}

function main() {
  console.log('[info] Scanning public/svg for JSON files...');
  const relFiles = walkJsonFiles(SVG_DIR).sort();
  console.log(`[info] Found ${relFiles.length} JSON file(s)`);

  const sets: SvgSet[] = [];
  for (const rel of relFiles) {
    const set = processFile(rel);
    if (set) sets.push(set);
  }

  // Group by category
  const categoryMap = new Map<string, SvgSet[]>();
  for (const set of sets) {
    const list = categoryMap.get(set.category) ?? [];
    list.push(set);
    categoryMap.set(set.category, list);
  }

  // Sort categories and sets
  const categories = Array.from(categoryMap.entries())
    .map(([name, sets]) => ({
      name,
      sets: sets.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    generatedAt: new Date().toISOString(),
    categories,
  };

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`[info] Wrote manifest with ${sets.length} set(s) in ${categories.length} categor(y/ies)`);

  // Generate ZIPs
  generateZips(sets).catch((err) => {
    console.warn('[warn] ZIP generation failed:', err);
  });
}

main();
