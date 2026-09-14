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
  /** Sample keys in display order */
  samples: string[];
  /** Only sample icons (for homepage cards) — not the full set */
  sampleFiles: SvgFile[];
  /** Relative path under /json/ to load the full set */
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

export type Theme = 'light' | 'dark';
