export type Lang = 'zh-TW' | 'en';

export const translations = {
  'zh-TW': {
    noResults: '找不到相關 SVG Sets',
    relatedIcons: '相關圖示結果',
    relatedSets: '相關結果',
    back: '← 返回',
    loading: '載入中…',
    loadingIcons: '載入圖示中…',
    downloadZip: '下載 ZIP',
    unknownAuthor: '未知作者',
    license: '授權',
    showMore: '…',
    langLabel: '中文繁體',
    switchLang: '切換語言',
  },
  en: {
    noResults: 'No SVG Sets found',
    relatedIcons: 'Related icons',
    relatedSets: 'Related sets',
    back: '← Back',
    loading: 'Loading…',
    loadingIcons: 'Loading icons…',
    downloadZip: 'Download ZIP',
    unknownAuthor: 'Unknown author',
    license: 'License',
    showMore: '…',
    langLabel: 'English',
    switchLang: 'Switch language',
  },
} as const;

export type TranslationKey = keyof typeof translations['en'];

export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const list = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const l of list) {
    if (l.toLowerCase().startsWith('zh')) return 'zh-TW';
  }
  return 'en';
}
