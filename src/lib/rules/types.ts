export interface RulesParseMetadata {
  sourceUrl: string;
  sourceSha256: string;
  generatedAt: string;
  version: string;
}

export interface ExtractedTextRun {
  text: string;
  x: number;
  y: number;
  page: number;
  fontSize?: number;
  fontName?: string;
  isBold?: boolean;
  isItalic?: boolean;
  internalHref?: string;
}

export interface RulesTextRun {
  text: string;
  href?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface RulesImageData {
  uri: string;
  width?: number;
  height?: number;
  caption?: string;
  page?: number;
  x?: number;
  y?: number;
  order?: number;
}

export interface RulesBlock {
  type: 'paragraph' | 'heading' | 'image';
  textRuns: RulesTextRun[];
  pageRef?: number;
  image?: RulesImageData;
  confidenceScore?: number;
  confidenceFlags?: string[];
}

export interface RulesSection {
  id: string;
  title: string;
  level: number;
  anchor: string;
  pageRef: number;
  blocks: RulesBlock[];
}

export interface TocEntry {
  title: string;
  anchor: string;
  level: number;
  order: number;
}

export interface PdfTocEntry {
  title: string;
  level: number;
  page: number;
}

export interface SearchPosting {
  sectionId: string;
  sectionIndex: number;
  blockIndex: number;
  tokenPosition: number;
}

export interface RulesSearchIndex {
  version: string;
  tokenMap: Record<string, SearchPosting[]>;
}

export interface RulesDocument {
  version: string;
  sourceUrl: string;
  sourceSha256: string;
  generatedAt: string;
  sections: RulesSection[];
  toc: TocEntry[];
}
