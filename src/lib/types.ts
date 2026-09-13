export type SvgFile = {
  name: string;
  key: string;
  body: string;
  light?: string;
  dark?: string;
};

export type SvgSetMetadata = {
  name: string;
  category: string;
  authorName?: string;
  authorUrl?: string;
  licenseName?: string;
  licenseUrl?: string;
  samples?: string[];
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
  files: SvgFile[];
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
