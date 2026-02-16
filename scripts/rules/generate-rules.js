/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  ignore: [/node_modules/],
});

const {parseExtractedTextRuns} = require('../../src/lib/rules/RulesParser');
const {mapPdfTocToAnchors, resolveAnchorForPage} = require('../../src/lib/rules/toc');

const INPUT_SAMPLE_PATH = path.resolve(
  __dirname,
  'input',
  'extracted-runs.sample.json',
);
const INPUT_RUNS_PATH = path.resolve(__dirname, 'input', 'extracted-runs.json');
const INPUT_TOC_PATH = path.resolve(__dirname, 'input', 'extracted-toc.json');
const INPUT_META_PATH = path.resolve(__dirname, 'input', 'extracted-meta.json');
const INPUT_IMAGES_PATH = path.resolve(__dirname, 'input', 'extracted-images.json');
const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'src', 'data', 'rules');
const OUTPUT_DOCUMENT_PATH = path.resolve(OUTPUT_DIR, 'rules.document.json');
const OUTPUT_INDEX_PATH = path.resolve(OUTPUT_DIR, 'rules.index.json');
const OUTPUT_META_PATH = path.resolve(OUTPUT_DIR, 'rules.meta.json');
const SOURCE_URL =
  'https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf';

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

function buildMetadata() {
  const nowIso = new Date().toISOString();
  const extractedMetaPath = parseArg('meta', INPUT_META_PATH);
  const extractedMeta = fs.existsSync(extractedMetaPath)
    ? JSON.parse(fs.readFileSync(extractedMetaPath, 'utf8'))
    : {};

  return {
    sourceUrl: extractedMeta.sourceUrl || SOURCE_URL,
    sourceSha256: extractedMeta.sourceSha256 || 'unverified',
    generatedAt: nowIso,
    version: nowIso.slice(0, 10).replace(/-/g, '.'),
  };
}

function patchPageBasedLinks(document) {
  const sections = document.sections || [];
  const patchedSections = sections.map(section => ({
    ...section,
    blocks: section.blocks.map(block => ({
      ...block,
      textRuns: block.textRuns.map(run => {
        if (!run.href || !run.href.startsWith('#page-')) {
          return run;
        }

        const page = Number(run.href.replace('#page-', ''));
        const anchor = resolveAnchorForPage(page, sections);
        if (!anchor) {
          return run;
        }

        return {
          ...run,
          href: `#${anchor}`,
        };
      }),
    })),
  }));

  return {
    ...document,
    sections: patchedSections,
  };
}

function normalizeRuleText(text) {
  const normalized = String(text || '')
    .replace(/\bActi\s+ons\b/gi, match =>
      /^[A-Z]/.test(match) ? 'Actions' : 'actions')
    .replace(/\bExa\s+mple(?:s)?\b/gi, match =>
      /s$/i.test(match) ? 'Examples' : 'Example')
    .replace(/\ba\s+ction\b/g, 'action')
    .replace(/\bcharac\s+ters\b/g, 'characters')
    .replace(/\bA\s+tanother\b/g, 'At another')
    .replace(/\bOn\s+cethe\b/g, 'Once the')
    .replace(/\bfur\s+ther\b/g, 'further')
    .replace(/\btell\s+mewhen\b/gi, 'tell me when')
    .replace(/\bpreem\s+ptone\b/gi, 'preempt one')
    .replace(/\bi\s+twas\b/gi, 'it was')
    .replace(/\btak\s+esplace\b/gi, 'takes place')
    .replace(/\bmanne\s+rare\b/gi, 'manner are')
    .replace(/\bthei\s+rown\b/gi, 'their own')
    .replace(/\bfor\s+cedrain\b/gi, 'force drain')
    .replace(/\bmaynever\b/gi, 'may never')
    .replace(/\bleavest\s+able\b/gi, 'leaves table')
    .replace(/\bparticipant\s+sleave\b/gi, 'participants leave')
    .replace(/\ba\s+utomated\b/gi, 'automated')
    .replace(/\bnotinitiate\b/gi, 'not initiate')
    .replace(/\btothe\b/gi, 'to the')
    .replace(/\bfromgame\b/gi, 'from game')
    .replace(/\bto\s+ldotherwise\b/gi, 'told otherwise')
    .replace(/\btoldotherwise\b/gi, 'told otherwise')
    .replace(/\ban\s+dother\b/gi, 'and other')
    .replace(/\bdonot\b/gi, 'do not')
    .replace(/\bdoso\b/gi, 'do so')
    .replace(/\bdothis\b/gi, 'do this')
    .replace(/\bdothe\b/gi, 'do the')
    .replace(/\bpla\s+yers\b/gi, 'players')
    .replace(/\bbefor\s+echoosing\b/gi, 'before choosing')
    .replace(/\bmus\s+treveal\b/gi, 'must reveal')
    .replace(/\btreveal\b/gi, 'to reveal')
    .replace(/\bthey['’]?renot\b/gi, "they're not")
    .replace(/\bit['’]?snot\b/gi, "it's not")
    .replace(/\bplayer\s*['’`´]?\s*s\s*turn\b/gi, "player's turn")
    .replace(/\bplayer\s*['’`´]?\s*s\s*hand\b/gi, "player's hand")
    .replace(/\bplayer['’]?s(turn|hand|deck|pile|stack)\b/gi, "player's $1")
    .replace(/\bopponent['’]?s(turn|hand|deck|pile|stack)\b/gi, "opponent's $1")
    .replace(/\bit['’]?s(the|now)\b/gi, "it's $1")
    .replace(/\bdoesn['’]?t(need|want)\b/gi, "doesn't $1")
    .replace(/\bcan['’]?t(play)\b/gi, "can't $1")
    .replace(/\bhe['’]?ll(have)\b/gi, "he'll $1")
    .replace(/\ba\s+nd([a-z]{2,})\b/gi, 'and $1')
    .replace(/do esn't/gi, "doesn't")
    .replace(/\bdo\s+es['’]?n['’]?t\b/gi, "doesn't")
    .replace(/\bd\s*o\s+e\s*s\s*['’]?\s*n\s*['’]?\s*t\b/gi, "doesn't")
    .replace(/\bnev\s+erhappens\b/gi, 'never happens')
    .replace(/\b([A-Za-z]+(?:['’]re|['’]ve|['’]ll|['’]d|['’]m|n['’]t))([A-Za-z]{2,})\b/g, '$1 $2')
    .replace(/\b([A-Za-z]+['’]s)([A-Za-z]{2,})\b/g, '$1 $2')
    .replace(/\b([A-Za-z])\s+([a-z]{4,})\b/g, (_match, left, right) => {
      const lower = String(left).toLowerCase();
      if (
        [
          'a',
          'an',
          'and',
          'as',
          'at',
          'be',
          'by',
          'do',
          'for',
          'from',
          'he',
          'her',
          'his',
          'i',
          'if',
          'in',
          'is',
          'it',
          'its',
          'my',
          'no',
          'of',
          'on',
          'or',
          'our',
          'so',
          'the',
          'their',
          'them',
          'they',
          'to',
          'up',
          'we',
          'you',
          'your',
        ].includes(lower)
      ) {
        return `${left} ${right}`;
      }
      return `${left}${right}`;
    })
    .replace(/\beshuffle\)/gi, 'reshuffle)')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return normalized;
}

function normalizeDocumentText(document) {
  return {
    ...document,
    sections: (document.sections || []).map(section => ({
      ...section,
      blocks: (section.blocks || []).map(block => ({
        ...block,
        textRuns: (block.textRuns || [])
          .map(run => ({
            ...run,
            text: normalizeRuleText(run.text),
          }))
          .filter(run => run.text.length > 0),
      })),
    })),
  };
}

function isBoundaryCharacter(character) {
  if (!character) {
    return true;
  }
  return !/[A-Za-z0-9]/.test(character);
}

function shouldInsertWordSpace(left, right) {
  if (!left || !right) {
    return false;
  }
  if (/^\s/.test(right) || /\s$/.test(left)) {
    return false;
  }
  const leftChar = left[left.length - 1];
  const rightChar = right[0];
  if (leftChar === '\n' || rightChar === '\n') {
    return false;
  }
  return !isBoundaryCharacter(leftChar) && !isBoundaryCharacter(rightChar);
}

function isSentenceEnd(text) {
  return /[.!?]["')\]]?$/.test(String(text || '').trim());
}

function isHeadingLike(text) {
  const value = String(text || '').trim();
  if (!value || value.length > 90) {
    return false;
  }
  if (!/^[A-Z]/.test(value)) {
    return false;
  }
  return /^[A-Z][A-Za-z0-9'’&,\-]*(?:\s+[A-Z][A-Za-z0-9'’&,\-]*){0,10}$/.test(value);
}

function enforceRunSpacingAndBreaks(document) {
  const isHeadingLike = text => {
    const value = String(text || '').trim();
    if (!value || value.length > 90) {
      return false;
    }
    if (!/^[A-Z]/.test(value)) {
      return false;
    }
    return /^[A-Z][A-Za-z0-9'’&,\-]*(?:\s+[A-Z][A-Za-z0-9'’&,\-]*){0,10}$/.test(value);
  };

  const shouldInsertStyleBoundarySpace = (previous, current) => {
    if (!previous || !current) {
      return false;
    }
    const previousText = String(previous.text || '');
    const currentText = String(current.text || '');
    if (!previousText || !currentText || /^\s/.test(currentText)) {
      return false;
    }

    const styleChanged =
      Boolean(previous.bold) !== Boolean(current.bold) ||
      Boolean(previous.italic) !== Boolean(current.italic);
    if (!styleChanged) {
      return false;
    }

    const left = previousText[previousText.length - 1];
    const right = currentText[0];
    if (!left || !right) {
      return false;
    }
    if (/\s/.test(left) || /\s/.test(right)) {
      return false;
    }
    if (/['’]/.test(left) || /[)\].,;:!?]/.test(right)) {
      return false;
    }
    return /[A-Za-z0-9]/.test(left) && /[A-Za-z0-9]/.test(right);
  };

  return {
    ...document,
    sections: (document.sections || []).map(section => ({
      ...section,
      blocks: (section.blocks || []).map(block => {
        if (block.type !== 'paragraph') {
          return block;
        }

        const runs = (block.textRuns || []).map(run => ({...run}));
        for (let index = 1; index < runs.length; index += 1) {
          const previous = runs[index - 1];
          const current = runs[index];
          const previousText = String(previous.text || '');
          const currentText = String(current.text || '');

          if (!currentText) {
            continue;
          }

          if (shouldInsertStyleBoundarySpace(previous, current)) {
            current.text = ` ${currentText}`;
          }

          if (
            current.bold &&
            !previous.bold &&
            isHeadingLike(currentText) &&
            (isSentenceEnd(previousText) || previousText.trim().length > 40) &&
            !currentText.startsWith('\n')
          ) {
            current.text = `\n${currentText.trimStart()}`;
            continue;
          }

          if (
            previous.bold &&
            !current.bold &&
            isHeadingLike(previousText) &&
            !currentText.startsWith('\n')
          ) {
            current.text = `\n${currentText.trimStart()}`;
            continue;
          }

          if (shouldInsertWordSpace(previousText, currentText)) {
            current.text = ` ${currentText}`;
          }
        }

        return {
          ...block,
          textRuns: runs,
        };
      }),
    })),
  };
}

function applyFinalTextFixes(text) {
  return String(text || '')
    .replace(/\bplayer\s*['’`´]?\s*s\s*turn\b/gi, "player's turn")
    .replace(/\bplayer\s*['’`´]?\s*s\s*hand\b/gi, "player's hand")
    .replace(/\bplayer['’]?s(turn|hand|deck|pile|stack)\b/gi, "player's $1")
    .replace(/\bopponent['’]?s(turn|hand|deck|pile|stack)\b/gi, "opponent's $1")
    .replace(/\bit['’]?s(the|now)\b/gi, "it's $1")
    .replace(/\bdoesn['’]?t(need|want)\b/gi, "doesn't $1")
    .replace(/\bcan['’]?t(play)\b/gi, "can't $1")
    .replace(/\bhe['’]?ll(have)\b/gi, "he'll $1")
    .replace(/\b([A-Za-z]+(?:['’]re|['’]ve|['’]ll|['’]d|['’]m|n['’]t))([A-Za-z]{2,})\b/g, '$1 $2')
    .replace(/\b([A-Za-z]+['’]s)([A-Za-z]{2,})\b/g, '$1 $2')
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)(battle|destiny|turn|phase|action|actions)\b/gi, '$1 $2')
    .replace(/\b([IVX]{1,4})(into|site|sector|system|phase|text)\b/g, '$1 $2')
    .replace(/\brevealin gthe\b/gi, 'revealing the')
    .replace(/\b([IVX])\s+([IVX])\b/g, '$1$2');
}

function enforceDocumentRunFixes(document) {
  return {
    ...document,
    sections: (document.sections || []).map(section => ({
      ...section,
      blocks: (section.blocks || []).map(block => ({
        ...block,
        textRuns: (block.textRuns || []).map(run => ({
          ...run,
          text: applyFinalTextFixes(run.text),
        })),
      })),
    })),
  };
}

function attachExtractedImages(document, extractedImages) {
  if (!Array.isArray(extractedImages) || extractedImages.length === 0) {
    return document;
  }

  const imagesByPage = new Map();
  extractedImages.forEach((image, index) => {
    const page = Number(image.page);
    const uri = String(image.uri || '').trim();
    if (!Number.isFinite(page) || page <= 0 || !uri) {
      return;
    }
    if (!imagesByPage.has(page)) {
      imagesByPage.set(page, []);
    }
    imagesByPage.get(page).push({
      type: 'image',
      pageRef: page,
      textRuns: [],
      image: {
        uri,
        width: Number.isFinite(Number(image.width)) ? Number(image.width) : undefined,
        height: Number.isFinite(Number(image.height)) ? Number(image.height) : undefined,
        caption: image.caption ? String(image.caption) : undefined,
        page,
        x: Number.isFinite(Number(image.x)) ? Number(image.x) : undefined,
        y: Number.isFinite(Number(image.y)) ? Number(image.y) : undefined,
        order: Number.isFinite(Number(image.order)) ? Number(image.order) : undefined,
      },
      _sortOrder: Number.isFinite(Number(image.order)) ? Number(image.order) : index,
    });
  });

  const sections = document.sections || [];
  const pageToSectionIndex = new Map();
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const currentSection = sections[sectionIndex];
    const nextSection = sections[sectionIndex + 1];
    const startPage = Number(currentSection.pageRef || 1);
    const endPageExclusive = nextSection ? Number(nextSection.pageRef || startPage + 1) : Infinity;
    for (const page of imagesByPage.keys()) {
      if (page >= startPage && page < endPageExclusive) {
        pageToSectionIndex.set(page, sectionIndex);
      }
    }
  }

  const sectionImages = new Map();
  for (const [page, pageImageBlocks] of imagesByPage.entries()) {
    const sectionIndex = pageToSectionIndex.get(page);
    if (typeof sectionIndex !== 'number') {
      continue;
    }
    if (!sectionImages.has(sectionIndex)) {
      sectionImages.set(sectionIndex, []);
    }
    sectionImages.get(sectionIndex).push(...pageImageBlocks);
  }

  const mergedSections = sections.map((section, sectionIndex) => {
    const matchedImages = sectionImages.get(sectionIndex) || [];
    if (!matchedImages.length) {
      return section;
    }

    const sortedImages = [...matchedImages]
      .sort((a, b) => {
        if (a.pageRef !== b.pageRef) {
          return a.pageRef - b.pageRef;
        }
        return a._sortOrder - b._sortOrder;
      })
      .map(imageBlock => {
        const { _sortOrder, ...block } = imageBlock;
        return block;
      });

    const headingBlock = section.blocks[0];
    const trailingBlocks = section.blocks.slice(1).map(block => ({...block}));
    const interleavedBlocks = [...trailingBlocks];

    sortedImages.forEach(imageBlock => {
      const targetPage = Number(imageBlock.pageRef || section.pageRef || 1);
      let insertionIndex = -1;
      for (let i = 0; i < interleavedBlocks.length; i += 1) {
        const candidate = interleavedBlocks[i];
        const candidatePage = Number(candidate.pageRef || section.pageRef || targetPage);
        if (candidatePage === targetPage && candidate.type !== 'image') {
          insertionIndex = i;
          continue;
        }
        if (candidatePage > targetPage && insertionIndex >= 0) {
          break;
        }
      }

      if (insertionIndex >= 0) {
        interleavedBlocks.splice(insertionIndex + 1, 0, imageBlock);
        return;
      }

      const laterPageIndex = interleavedBlocks.findIndex(candidate => {
        const candidatePage = Number(candidate.pageRef || section.pageRef || targetPage);
        return candidatePage > targetPage;
      });
      if (laterPageIndex >= 0) {
        interleavedBlocks.splice(laterPageIndex, 0, imageBlock);
        return;
      }

      interleavedBlocks.push(imageBlock);
    });

    return {
      ...section,
      blocks: headingBlock ? [headingBlock, ...interleavedBlocks] : interleavedBlocks,
    };
  });

  return {
    ...document,
    sections: mergedSections,
  };
}

function buildSearchIndex(document) {
  const tokenMap = {};

  const normalizeToken = value =>
    value.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  document.sections.forEach((section, sectionIndex) => {
    section.blocks.forEach((block, blockIndex) => {
      block.textRuns.forEach(run => {
        const words = String(run.text || '')
          .split(/\s+/)
          .map(normalizeToken)
          .filter(Boolean);

        words.forEach((token, tokenPosition) => {
          if (!tokenMap[token]) {
            tokenMap[token] = [];
          }
          tokenMap[token].push({
            sectionId: section.id,
            sectionIndex,
            blockIndex,
            tokenPosition,
          });
        });
      });
    });
  });

  return {
    version: document.version,
    tokenMap,
  };
}

function main() {
  const inputRunsPath = parseArg(
    'runs',
    fs.existsSync(INPUT_RUNS_PATH) ? INPUT_RUNS_PATH : INPUT_SAMPLE_PATH,
  );
  const inputTocPath = parseArg('toc', INPUT_TOC_PATH);
  const inputImagesPath = parseArg('images', INPUT_IMAGES_PATH);

  if (!fs.existsSync(inputRunsPath)) {
    console.error(
      `Missing extracted text run input: ${inputRunsPath}\n` +
        'Add a JSON array of extracted text runs to continue.',
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(inputRunsPath, 'utf8');
  const textRuns = JSON.parse(raw);
  const metadata = buildMetadata();
  const parsed = parseExtractedTextRuns(textRuns, metadata);
  const withLinks = patchPageBasedLinks(parsed);

  const extractedToc = fs.existsSync(inputTocPath)
    ? JSON.parse(fs.readFileSync(inputTocPath, 'utf8'))
    : [];
  const toc = mapPdfTocToAnchors(extractedToc, withLinks.sections);

  const document = {
    ...withLinks,
    toc,
  };
  const extractedImages = fs.existsSync(inputImagesPath)
    ? JSON.parse(fs.readFileSync(inputImagesPath, 'utf8'))
    : [];
  const imageAugmentedDocument = attachExtractedImages(document, extractedImages);
  const normalizedDocument = normalizeDocumentText(imageAugmentedDocument);
  const spacingNormalizedDocument = enforceRunSpacingAndBreaks(normalizedDocument);
  const finalDocument = enforceDocumentRunFixes(spacingNormalizedDocument);
  const index = buildSearchIndex(finalDocument);
  const meta = {
    version: finalDocument.version,
    sourceUrl: finalDocument.sourceUrl,
    sourceSha256: finalDocument.sourceSha256,
    generatedAt: finalDocument.generatedAt,
    sectionCount: finalDocument.sections.length,
    tocCount: finalDocument.toc.length,
    indexTokenCount: Object.keys(index.tokenMap).length,
  };

  fs.mkdirSync(OUTPUT_DIR, {recursive: true});
  fs.writeFileSync(OUTPUT_DOCUMENT_PATH, JSON.stringify(finalDocument, null, 2));
  fs.writeFileSync(OUTPUT_INDEX_PATH, JSON.stringify(index, null, 2));
  fs.writeFileSync(OUTPUT_META_PATH, JSON.stringify(meta, null, 2));

  console.log(`Generated ${OUTPUT_DOCUMENT_PATH}`);
  console.log(`Generated ${OUTPUT_INDEX_PATH}`);
  console.log(`Generated ${OUTPUT_META_PATH}`);
}

main();
