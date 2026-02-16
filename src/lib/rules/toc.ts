import {slugifyAnchor} from './anchor';
import {PdfTocEntry, RulesSection, TocEntry} from './types';

interface AnchoredSection {
  anchor: string;
  pageRef: number;
  title: string;
}

function resolveAnchorByPage(
  page: number,
  anchoredSections: AnchoredSection[],
): string | null {
  if (!anchoredSections.length) {
    return null;
  }

  const exact = anchoredSections.find(section => section.pageRef === page);
  if (exact) {
    return exact.anchor;
  }

  const nextSection = anchoredSections.find(section => section.pageRef > page);
  if (nextSection) {
    return nextSection.anchor;
  }

  return anchoredSections[anchoredSections.length - 1].anchor;
}

export function resolveAnchorForPage(
  page: number,
  sections: RulesSection[],
): string | null {
  const anchoredSections: AnchoredSection[] = sections.map(section => ({
    title: section.title,
    anchor: section.anchor,
    pageRef: section.pageRef,
  }));

  return resolveAnchorByPage(page, anchoredSections);
}

export function mapPdfTocToAnchors(
  pdfToc: PdfTocEntry[],
  sections: RulesSection[],
): TocEntry[] {
  const anchoredSections: AnchoredSection[] = sections.map(section => ({
    title: section.title,
    anchor: section.anchor,
    pageRef: section.pageRef,
  }));

  const bySlug = anchoredSections.reduce((acc, section) => {
    const key = slugifyAnchor(section.title);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(section.anchor);
    return acc;
  }, {} as Record<string, string[]>);
  const slugCursor: Record<string, number> = {};

  const mapped = pdfToc
    .map((entry, order) => {
      const key = slugifyAnchor(entry.title);
      const matches = bySlug[key] || [];
      const idx = slugCursor[key] || 0;

      if (idx < matches.length) {
        slugCursor[key] = idx + 1;
        return {
          title: entry.title,
          level: entry.level,
          order,
          anchor: matches[idx],
        };
      }

      const fallbackAnchor = resolveAnchorByPage(entry.page, anchoredSections);
      if (!fallbackAnchor) {
        return null;
      }

      return {
        title: entry.title,
        level: entry.level,
        order,
        anchor: fallbackAnchor,
      };
    })
    .filter((entry): entry is TocEntry => entry !== null);

  if (mapped.length > 0) {
    return mapped;
  }

  return sections.map((section, index) => ({
    title: section.title,
    anchor: section.anchor,
    level: section.level,
    order: index,
  }));
}
