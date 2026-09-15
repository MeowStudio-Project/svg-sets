import type { SvgFile, Theme } from './types';

export function getIconBody(file: SvgFile, theme: Theme): string {
  if (theme === 'light' && file.light) return file.light;
  if (theme === 'dark' && file.dark) return file.dark;
  return file.body;
}

/**
 * Resolve viewBox. Prefer explicit width/height from Iconify JSON.
 * Fallback 16 matches Iconify default (Codicons, etc.).
 * Sets like Akar (24) / Academicons (512) set dimensions on the file at load time.
 */
export function getViewBox(file: SvgFile): string {
  const w = file.width && file.width > 0 ? file.width : 16;
  const h = file.height && file.height > 0 ? file.height : 16;
  return `0 0 ${w} ${h}`;
}

export function buildSvgDocument(file: SvgFile, theme: Theme): string {
  const body = getIconBody(file, theme);
  const viewBox = getViewBox(file);
  const w = file.width && file.width > 0 ? file.width : 16;
  const h = file.height && file.height > 0 ? file.height : 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">\n  ${body}\n</svg>`;
}

export function downloadSvg(filename: string, content: string) {
  const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
