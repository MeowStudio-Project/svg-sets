export type SvgFile = {
  name: string;
  key: string;
  body: string;
  light?: string;
  dark?: string;
  width?: number;
  height?: number;
};

export type SvgSet = {
  id: string;
  name: string;
  category: string;
  authorName?: string;
  authorUrl?: string;
  licenseName?: string;
  licenseUrl?: string;
  samples: string[];
  sampleFiles: SvgFile[];
  /** All icon keys in this set (for search, no bodies) */
  iconKeys: string[];
  source: string;
  iconCount: number;
  archive?: {
    name: string;
    url: string;
  };
};

export type SvgManifest = {
  generatedAt: string;
  categories: Array<{
    name: string;
    sets: SvgSet[];
  }>;
};

/** A set matched by icon-name search, with which keys matched */
export type IconSearchHit = {
  set: SvgSet;
  matchedKeys: string[];
};

export type Theme = 'light' | 'dark';
