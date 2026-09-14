import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT, 'json');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');
const ARCHIVES_DIR = path.join(ROOT, 'archives');

function walkJsonFiles(dir, base = dir) {
  const results = [];
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

function resolveName(raw, filename) {
  if (raw.name && typeof raw.name === 'string') return raw.name.trim();
  if (raw.info?.name && typeof raw.info.name === 'string') return raw.info.name.trim();
  return path.basename(filename, '.json');
}

function resolveCategory(raw) {
  if (raw.category && typeof raw.category === 'string') return raw.category.trim() || 'Uncategorized';
  if (raw.info?.category && typeof raw.info.category === 'string') return raw.info.category.trim() || 'Uncategorized';
  return 'Uncategorized';
}

function resolveAuthorName(raw) {
  const n = raw.author?.name ?? raw.info?.author?.name;
  return n && typeof n === 'string' ? n.trim() : undefined;
}

function resolveAuthorUrl(raw) {
  const u = raw.author?.url ?? raw.info?.author?.url;
  return u && typeof u === 'string' ? u.trim() : undefined;
}

function resolveLicenseName(raw) {
  const l =
    raw.license?.name ??
    raw.license?.title ??
    raw.license?.spdx ??
    raw.info?.license?.name ??
    raw.info?.license?.title ??
    raw.info?.license?.spdx;
  return l && typeof l === 'string' ? l.trim() : undefined;
}

function resolveLicenseUrl(raw) {
  const u = raw.license?.url ?? raw.info?.license?.url;
  return u && typeof u === 'string' ? u.trim() : undefined;
}

function baseId(relPath) {
  return path.basename(relPath, '.json').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function processFile(relPath) {
  const fullPath = path.join(SVG_DIR, relPath);
  let raw;
  try {
    const text = fs.readFileSync(fullPath, 'utf-8');
    raw = JSON.parse(text);
  } catch (err) {
    console.warn(`[warn] Invalid JSON, skipping: ${relPath}`, err);
    return null;
  }

  const icons = raw.icons;
  if (!icons || typeof icons !== 'object') {
    console.warn(`[warn] No icons object, skipping: ${relPath}`);
    return null;
  }

  // Prefer root width/height (Iconify grid), then info.*, then 24.
  const defaultH =
    (typeof raw.height === 'number' && raw.height > 0 && raw.height) ||
    (typeof raw.info?.height === 'number' && raw.info.height > 0 && raw.info.height) ||
    24;
  const defaultW =
    (typeof raw.width === 'number' && raw.width > 0 && raw.width) ||
    (typeof raw.info?.width === 'number' && raw.info.width > 0 && raw.info.width) ||
    defaultH;

  const files = [];
  for (const [key, data] of Object.entries(icons)) {
    if (!data || typeof data !== 'object') continue;
    const body = typeof data.body === 'string' ? data.body : undefined;
    const light = typeof data.light === 'string' ? data.light : undefined;
    const dark = typeof data.dark === 'string' ? data.dark : undefined;
    if (!body && !light && !dark) continue;
    const w =
      (typeof data.width === 'number' && data.width > 0 && data.width) || defaultW;
    const h =
      (typeof data.height === 'number' && data.height > 0 && data.height) || defaultH;
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

  if (files.length === 0) {
    console.warn(`[warn] No valid icons, skipping: ${relPath}`);
    return null;
  }

  files.sort((a, b) => a.key.localeCompare(b.key));

  const sampleKeys = Array.isArray(raw.samples)
    ? raw.samples
    : Array.isArray(raw.info?.samples)
      ? raw.info.samples
      : [];
  const validSampleKeys = sampleKeys
    .filter((s) => typeof s === 'string')
    .filter((s) => files.some((f) => f.key === s));

  let samples;
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
  const id = baseId(relPath);

  const archiveName = `${id}.zip`;
  const archiveUrl = `/archives/${archiveName}`;

  // Only embed sample icons in the manifest (keeps file small)
  const sampleFiles = samples
    .map((key) => files.find((f) => f.key === key))
    .filter(Boolean);

  return {
    id,
    name,
    category,
    authorName,
    authorUrl,
    licenseName,
    licenseUrl,
    samples,
    sampleFiles,
    source: relPath.replace(/\\/g, '/'),
    iconCount: files.length,
    // full files kept only for ZIP generation (stripped before write)
    _files: files,
    archive: {
      name: archiveName,
      url: archiveUrl,
    },
  };
}

function createMinimalZip(files) {
  // Minimal uncompressed ZIP (store method) for SVG files
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;
  const parts = [];

  for (const file of files) {
    const name = `${file.key}.svg`;
    const content = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${file.width || 24} ${file.height || 24}">\n  ${file.body}\n</svg>\n`,
      'utf8'
    );
    const nameBuf = Buffer.from(name, 'utf8');

    // Local file header
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4); // version
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // method store
    local.writeUInt16LE(0, 10); // time
    local.writeUInt16LE(0, 12); // date
    local.writeUInt32LE(0, 14); // crc (0 for simplicity)
    local.writeUInt32LE(content.length, 18); // compressed size
    local.writeUInt32LE(content.length, 22); // uncompressed size
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra
    nameBuf.copy(local, 30);

    parts.push(local);
    parts.push(content);

    // Central directory header
    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(0, 16); // crc
    central.writeUInt32LE(content.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);

    centralHeaders.push(central);
    offset += local.length + content.length;
  }

  const centralStart = offset;
  for (const c of centralHeaders) {
    parts.push(c);
    offset += c.length;
  }

  // End of central directory
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(centralHeaders.length, 8);
  end.writeUInt16LE(centralHeaders.length, 10);
  end.writeUInt32LE(offset - centralStart, 12);
  end.writeUInt32LE(centralStart, 16);
  end.writeUInt16LE(0, 20);
  parts.push(end);

  return Buffer.concat(parts);
}

function generateZips(sets) {
  if (!fs.existsSync(ARCHIVES_DIR)) {
    fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
  }
  for (const set of sets) {
    const buf = createMinimalZip(set._files || []);
    const outPath = path.join(ARCHIVES_DIR, set.archive.name);
    fs.writeFileSync(outPath, buf);
  }
  console.log(`[info] Generated ${sets.length} ZIP archives`);
}

function main() {
  console.log('[info] Scanning json/ for JSON files...');
  const relFiles = walkJsonFiles(SVG_DIR).sort();
  console.log(`[info] Found ${relFiles.length} JSON file(s)`);

  const sets = [];
  const usedIds = new Map();
  for (const rel of relFiles) {
    const set = processFile(rel);
    if (!set) continue;
    // Keep clean IDs; only suffix on collision
    let id = set.id;
    if (usedIds.has(id)) {
      const n = usedIds.get(id) + 1;
      usedIds.set(id, n);
      id = `${id}-${n}`;
      set.id = id;
      set.archive = { name: `${id}.zip`, url: `/archives/${id}.zip` };
    } else {
      usedIds.set(id, 1);
    }
    sets.push(set);
  }

  const categoryMap = new Map();
  for (const set of sets) {
    const list = categoryMap.get(set.category) ?? [];
    list.push(set);
    categoryMap.set(set.category, list);
  }

  const categories = Array.from(categoryMap.entries())
    .map(([name, sets]) => ({
      name,
      sets: sets.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Strip internal _files before writing (manifest must stay small)
  for (const cat of categories) {
    for (const set of cat.sets) {
      delete set._files;
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    categories,
  };

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  // Compact JSON (no pretty-print) to keep size down
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
  console.log(`[info] Wrote manifest with ${sets.length} set(s) in ${categories.length} categor(y/ies)`);

  generateZips(sets);
}

main();
