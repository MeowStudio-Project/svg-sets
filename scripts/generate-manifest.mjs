/**
 * Generate slim manifest + optional local ZIP archives.
 *
 * Data source priority:
 * 1. Local ./json/  (if any .json files exist)
 * 2. Remote GitHub data repo (DATA_REPO / DATA_BRANCH)
 *
 * So you only need to upload icon JSON to svg-sets-data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOCAL_JSON = path.join(ROOT, 'json');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');
const ARCHIVES_DIR = path.join(ROOT, 'archives');

const DATA_OWNER = process.env.DATA_OWNER || 'MeowStudio-Project';
const DATA_REPO = process.env.DATA_REPO || 'svg-sets-data';
const DATA_BRANCH = process.env.DATA_BRANCH || 'main';
const MAX_JSON_BYTES = 24 * 1024 * 1024;

function walkLocalJson(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walkLocalJson(full, base));
    else if (name.endsWith('.json')) out.push(path.relative(base, full).replace(/\\/g, '/'));
  }
  return out;
}

async function listRemoteJsonFiles() {
  const api = `https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/git/trees/${DATA_BRANCH}?recursive=1`;
  const res = await fetch(api, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'svg-sets-manifest-generator',
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const files = (data.tree || [])
    .filter((t) => t.type === 'blob' && t.path.startsWith('json/') && t.path.endsWith('.json'))
    .map((t) => t.path.slice('json/'.length));
  return files.sort();
}

async function fetchRemoteJson(relPath) {
  const url = `https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/${DATA_BRANCH}/json/${relPath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'svg-sets-manifest-generator' } });
  if (!res.ok) throw new Error(`Fetch ${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_JSON_BYTES) {
    const err = new Error(`too large ${(buf.length / 1024 / 1024).toFixed(1)} MiB`);
    err.code = 'TOO_LARGE';
    throw err;
  }
  return JSON.parse(buf.toString('utf8'));
}

function loadLocalJson(relPath) {
  const full = path.join(LOCAL_JSON, relPath);
  const st = fs.statSync(full);
  if (st.size > MAX_JSON_BYTES) {
    const err = new Error(`too large ${(st.size / 1024 / 1024).toFixed(1)} MiB`);
    err.code = 'TOO_LARGE';
    throw err;
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function basenameId(relPath) {
  return path.basename(relPath, '.json');
}

function processRaw(relPath, raw, usedIds) {
  const icons = raw.icons;
  if (!icons || typeof icons !== 'object') {
    console.warn(`[warn] No valid icons, skipping: ${relPath}`);
    return null;
  }

  const defaultH =
    (typeof raw.height === 'number' && raw.height > 0 && raw.height) ||
    (typeof raw.info?.height === 'number' && raw.info.height > 0 && raw.info.height) ||
    16;
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
  if (files.length === 0) {
    console.warn(`[warn] No valid icons, skipping: ${relPath}`);
    return null;
  }
  files.sort((a, b) => a.key.localeCompare(b.key));

  const info = raw.info || {};
  const name =
    (typeof info.name === 'string' && info.name) ||
    (typeof raw.prefix === 'string' && raw.prefix) ||
    basenameId(relPath);
  const category =
    (typeof info.category === 'string' && info.category) ||
    'Uncategorized';

  let authorName, authorUrl;
  if (info.author) {
    if (typeof info.author === 'string') authorName = info.author;
    else {
      authorName = info.author.name;
      authorUrl = info.author.url;
    }
  }
  let licenseName, licenseUrl;
  if (info.license) {
    if (typeof info.license === 'string') licenseName = info.license;
    else {
      licenseName = info.license.title || info.license.spdx;
      licenseUrl = info.license.url;
    }
  }

  let samples = Array.isArray(info.samples) ? info.samples.filter((s) => typeof s === 'string') : [];
  samples = samples.filter((k) => files.some((f) => f.key === k)).slice(0, 6);
  if (samples.length === 0) {
    samples = files.slice(0, 6).map((f) => f.key);
  }
  const sampleFiles = samples
    .map((key) => files.find((f) => f.key === key))
    .filter(Boolean);

  let id = basenameId(relPath);
  if (usedIds.has(id)) {
    const hash = createHash('sha256').update(relPath).digest('hex').slice(0, 12);
    id = `${id}-${hash}`;
  }
  usedIds.set(id, relPath);

  const archiveName = `${id}.zip`;

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
    iconKeys: files.map((f) => f.key),
    source: relPath.replace(/\\/g, '/'),
    iconCount: files.length,
    _files: files,
    archive: {
      name: archiveName,
      url: `/archives/${archiveName}`,
    },
  };
}

function createMinimalZip(files) {
  // Store-only ZIP (no compression) for speed
  const parts = [];
  const central = [];
  let offset = 0;

  function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
    return ~c >>> 0;
  }

  for (const file of files) {
    const name = `${file.key}.svg`;
    const nameBuf = Buffer.from(name, 'utf8');
    const w = file.width || 16;
    const h = file.height || 16;
    const body = file.body || '';
    const content = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`,
      'utf8'
    );
    const crc = crc32(content);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(content.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    const localOff = offset;
    parts.push(local, nameBuf, content);
    offset += local.length + nameBuf.length + content.length;

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0, 8);
    cen.writeUInt16LE(0, 10);
    cen.writeUInt16LE(0, 12);
    cen.writeUInt16LE(0, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(content.length, 20);
    cen.writeUInt32LE(content.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt16LE(0, 30);
    cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34);
    cen.writeUInt16LE(0, 36);
    cen.writeUInt32LE(0, 38);
    cen.writeUInt32LE(localOff, 42);
    central.push(cen, nameBuf);
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const p of central) {
    parts.push(p);
    centralSize += p.length;
    offset += p.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralStart, 16);
  end.writeUInt16LE(0, 20);
  parts.push(end);
  return Buffer.concat(parts);
}

function generateZips(sets) {
  if (!fs.existsSync(ARCHIVES_DIR)) fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
  for (const set of sets) {
    const buf = createMinimalZip(set._files || []);
    fs.writeFileSync(path.join(ARCHIVES_DIR, set.archive.name), buf);
  }
  console.log(`[info] Generated ${sets.length} ZIP archives`);
}

async function main() {
  let relFiles = walkLocalJson(LOCAL_JSON).sort();
  let mode = 'local';

  if (relFiles.length === 0) {
    mode = 'remote';
    console.log(`[info] No local json/; fetching from ${DATA_OWNER}/${DATA_REPO}@${DATA_BRANCH}...`);
    relFiles = await listRemoteJsonFiles();
  } else {
    console.log(`[info] Using local json/ (${relFiles.length} file(s))`);
  }

  console.log(`[info] Found ${relFiles.length} JSON file(s) [${mode}]`);

  const sets = [];
  const usedIds = new Map();

  const concurrency = mode === 'remote' ? 8 : 1;
  for (let i = 0; i < relFiles.length; i += concurrency) {
    const chunk = relFiles.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map(async (rel) => {
        try {
          const raw = mode === 'local' ? loadLocalJson(rel) : await fetchRemoteJson(rel);
          return processRaw(rel, raw, usedIds);
        } catch (err) {
          if (err.code === 'TOO_LARGE') {
            console.warn(`[warn] JSON too large for CF Pages (${err.message}), skipping: ${rel}`);
          } else {
            console.warn(`[warn] Skip ${rel}:`, err.message || err);
          }
          return null;
        }
      })
    );
    for (const set of results) {
      if (set) sets.push(set);
    }
  }

  sets.sort((a, b) => a.name.localeCompare(b.name));

  const catMap = new Map();
  for (const set of sets) {
    const list = catMap.get(set.category) ?? [];
    list.push(set);
    catMap.set(set.category, list);
  }
  const categories = [...catMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, list]) => ({
      name,
      sets: list.sort((a, b) => a.name.localeCompare(b.name)),
    }));

  // Local ZIP only when using local json (optional; runtime ZIP comes from data repo)
  if (mode === 'local') {
    try {
      generateZips(sets);
    } catch (e) {
      console.warn('[warn] ZIP generation failed:', e.message || e);
    }
  }

  for (const cat of categories) {
    for (const set of cat.sets) delete set._files;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    categories,
  };

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
  console.log(
    `[info] Wrote manifest with ${sets.length} set(s) in ${categories.length} categor(y/ies)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
