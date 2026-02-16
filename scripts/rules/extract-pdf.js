/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SOURCE_URL =
  'https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf';
const DEFAULT_PDF_PATH = path.resolve(
  __dirname,
  'input',
  'SWCCG_2023_AdvancedRulebook.pdf',
);
const DEFAULT_OUTPUT_RUNS_PATH = path.resolve(
  __dirname,
  'input',
  'extracted-runs.json',
);
const DEFAULT_OUTPUT_TOC_PATH = path.resolve(
  __dirname,
  'input',
  'extracted-toc.json',
);
const DEFAULT_OUTPUT_META_PATH = path.resolve(
  __dirname,
  'input',
  'extracted-meta.json',
);
const DEFAULT_OUTPUT_IMAGES_PATH = path.resolve(
  __dirname,
  'input',
  'extracted-images.json',
);

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
}

function fileSha256(filePath) {
  const digest = crypto.createHash('sha256');
  digest.update(fs.readFileSync(filePath));
  return digest.digest('hex');
}

async function downloadPdf(url, filePath) {
  console.log(`Downloading PDF from ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed download: ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  ensureDir(filePath);
  fs.writeFileSync(filePath, buffer);
}

async function loadPdfJs() {
  return import('pdfjs-dist/legacy/build/pdf.mjs');
}

async function resolveDestinationPage(pdfDocument, destination) {
  if (!destination) {
    return null;
  }

  let explicitDestination = destination;
  if (typeof destination === 'string') {
    explicitDestination = await pdfDocument.getDestination(destination);
  }
  if (!explicitDestination || !Array.isArray(explicitDestination)) {
    return null;
  }

  const pageReference = explicitDestination[0];
  if (!pageReference || typeof pageReference !== 'object') {
    return null;
  }

  const pageIndex = await pdfDocument.getPageIndex(pageReference);
  return pageIndex + 1;
}

async function flattenOutline(pdfDocument, outline, level, output) {
  if (!outline || !Array.isArray(outline)) {
    return;
  }

  for (const item of outline) {
    const page = await resolveDestinationPage(pdfDocument, item.dest);
    if (item.title && page) {
      output.push({
        title: String(item.title).replace(/\s+/g, ' ').trim(),
        level,
        page,
      });
    }

    if (item.items && item.items.length > 0) {
      await flattenOutline(pdfDocument, item.items, level + 1, output);
    }
  }
}

function toFontSize(transform) {
  if (!transform || transform.length < 2) {
    return undefined;
  }

  const a = Number(transform[0] || 0);
  const b = Number(transform[1] || 0);
  const magnitude = Math.sqrt(a * a + b * b);
  return Math.round(magnitude * 100) / 100;
}

function inferFontTraits(fontName) {
  const value = String(fontName || '').toLowerCase();
  return {
    isBold: /(bold|black|heavy|semibold|demi)/.test(value),
    isItalic: /(italic|oblique)/.test(value),
  };
}

function matrixMultiply(left, right) {
  const [a1, b1, c1, d1, e1, f1] = left;
  const [a2, b2, c2, d2, e2, f2] = right;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

function transformPoint(matrix, x, y) {
  const [a, b, c, d, e, f] = matrix;
  return {
    x: a * x + c * y + e,
    y: b * x + d * y + f,
  };
}

function rectFromUnitSquare(matrix) {
  const points = [
    transformPoint(matrix, 0, 0),
    transformPoint(matrix, 1, 0),
    transformPoint(matrix, 0, 1),
    transformPoint(matrix, 1, 1),
  ];
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const bottom = Math.min(...ys);
  const top = Math.max(...ys);
  return {
    x: left,
    y: bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, top - bottom),
  };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload), 0);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  return Buffer.concat([length, payload, crc]);
}

function toRgbaData(image) {
  if (!image || !image.data || !image.width || !image.height) {
    return null;
  }

  const kind = Number(image.kind);
  const expectedRgbaLength = image.width * image.height * 4;
  if (kind === 2) {
    const source = new Uint8Array(image.data);
    if (source.length < expectedRgbaLength) {
      return null;
    }
    if (source.length === expectedRgbaLength) {
      return source;
    }
    return source.slice(0, expectedRgbaLength);
  }

  if (kind === 3) {
    const rgb = image.data;
    const expectedRgbLength = image.width * image.height * 3;
    if (!rgb || rgb.length < expectedRgbLength) {
      return null;
    }
    const rgba = new Uint8Array(image.width * image.height * 4);
    for (
      let source = 0, target = 0;
      source < expectedRgbLength;
      source += 3, target += 4
    ) {
      rgba[target] = rgb[source];
      rgba[target + 1] = rgb[source + 1];
      rgba[target + 2] = rgb[source + 2];
      rgba[target + 3] = 255;
    }
    return rgba;
  }

  return null;
}

function encodeRgbaPng(width, height, rgba) {
  const zlib = require('zlib');
  const rowLength = width * 4;
  const scanlines = Buffer.alloc((rowLength + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (rowLength + 1);
    scanlines[rowOffset] = 0;
    const sourceOffset = y * rowLength;
    Buffer.from(rgba.buffer, rgba.byteOffset + sourceOffset, rowLength).copy(
      scanlines,
      rowOffset + 1,
    );
  }

  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(scanlines, {level: 9});
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function toDataUriPng(width, height, image) {
  const rgba = toRgbaData(image);
  if (!rgba) {
    return null;
  }
  const png = encodeRgbaPng(width, height, rgba);
  return `data:image/png;base64,${png.toString('base64')}`;
}

function resolvePageImageObject(page, name) {
  return new Promise(resolve => {
    if (!page?.objs || !name) {
      resolve(null);
      return;
    }

    try {
      const immediate = page.objs.get(name);
      if (immediate) {
        resolve(immediate);
        return;
      }
    } catch (_error) {
      // fall through to callback-based retrieval
    }

    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 1500);

    try {
      page.objs.get(name, value => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        resolve(value || null);
      });
    } catch (_error) {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        resolve(null);
      }
    }
  });
}

async function extractPageImages(pdfjs, page, pageNumber, options) {
  const OPS = pdfjs.OPS;
  const {
    includeFullPageImages,
    fullPageThreshold,
    minImageDimension,
    maxDataUriLength,
  } = options;
  const viewport = page.getViewport({scale: 1});
  const pageArea = viewport.width * viewport.height;

  const operatorList = await page.getOperatorList();
  const stack = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const images = [];

  for (let index = 0; index < operatorList.fnArray.length; index += 1) {
      const fn = operatorList.fnArray[index];
      const args = operatorList.argsArray[index];

      if (fn === OPS.save) {
        stack.push([...ctm]);
        continue;
      }
      if (fn === OPS.restore) {
        ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
        continue;
      }
      if (fn === OPS.transform && Array.isArray(args) && args.length >= 6) {
        ctm = matrixMultiply(ctm, [
          Number(args[0] || 0),
          Number(args[1] || 0),
          Number(args[2] || 0),
          Number(args[3] || 0),
          Number(args[4] || 0),
          Number(args[5] || 0),
        ]);
        continue;
      }

      const isImagePaintOp =
        fn === OPS.paintImageXObject ||
        fn === OPS.paintInlineImageXObject ||
        fn === OPS.paintJpegXObject;
      if (!isImagePaintOp) {
        continue;
      }

      const bounds = rectFromUnitSquare(ctm);
      const widthOnPage = bounds.width;
      const heightOnPage = bounds.height;
      if (widthOnPage < minImageDimension || heightOnPage < minImageDimension) {
        continue;
      }

      const areaRatio = pageArea > 0 ? (widthOnPage * heightOnPage) / pageArea : 0;
      if (!includeFullPageImages && areaRatio >= fullPageThreshold) {
        continue;
      }

      let imageObject = null;
      if (fn === OPS.paintInlineImageXObject) {
        imageObject = args?.[0] || null;
      } else {
        const imageName = args?.[0];
        if (!imageName) {
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        imageObject = await resolvePageImageObject(page, imageName);
      }
      if (!imageObject) {
        continue;
      }

      const pixelWidth = Number(imageObject.width || 0);
      const pixelHeight = Number(imageObject.height || 0);
      if (!pixelWidth || !pixelHeight) {
        continue;
      }

      const dataUri = toDataUriPng(pixelWidth, pixelHeight, imageObject);
      if (!dataUri || dataUri.length > maxDataUriLength) {
        continue;
      }

      images.push({
        page: pageNumber,
        x: Number(bounds.x.toFixed(2)),
        y: Number(bounds.y.toFixed(2)),
        width: Number(widthOnPage.toFixed(2)),
        height: Number(heightOnPage.toFixed(2)),
        pixelWidth,
        pixelHeight,
        uri: dataUri,
      });
    }

  const sorted = images.sort((left, right) => {
    if (left.page !== right.page) {
      return left.page - right.page;
    }
    const topLeft = left.y + left.height;
    const topRight = right.y + right.height;
    if (Math.abs(topLeft - topRight) > 1) {
      return topRight - topLeft;
    }
    return left.x - right.x;
  });

  return sorted.map((image, order) => ({
    ...image,
    order,
  }));
}

function applyTypographyHeuristics(textRuns) {
  if (!Array.isArray(textRuns) || textRuns.length === 0) {
    return textRuns;
  }

  const isBodyCandidate = run =>
    typeof run.text === 'string' &&
    /[A-Za-z]/.test(run.text) &&
    (run.fontSize || 0) >= 9 &&
    (run.fontSize || 0) <= 11;

  const fontCounts = new Map();
  textRuns.forEach(run => {
    if (!isBodyCandidate(run)) {
      return;
    }
    const key = String(run.fontName || '');
    if (!key) {
      return;
    }
    fontCounts.set(key, (fontCounts.get(key) || 0) + 1);
  });

  const dominantBodyFont = [...fontCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!dominantBodyFont) {
    return textRuns;
  }

  return textRuns.map(run => {
    if (run.isBold) {
      return run;
    }

    const text = String(run.text || '');
    const hasLetters = /[A-Za-z]/.test(text);
    const looksLikeSymbol = !hasLetters || /^[^A-Za-z0-9]+$/.test(text);
    const isNonBodyFont = String(run.fontName || '') !== dominantBodyFont;
    const isLikelyDisplayText = (run.fontSize || 0) >= 11 || text.length <= 42;

    if (isNonBodyFont && isLikelyDisplayText && !looksLikeSymbol) {
      return {
        ...run,
        isBold: true,
      };
    }

    return run;
  });
}

function pointInRect(x, y, rect) {
  if (!Array.isArray(rect) || rect.length < 4) {
    return false;
  }
  const left = Math.min(rect[0], rect[2]);
  const right = Math.max(rect[0], rect[2]);
  const bottom = Math.min(rect[1], rect[3]);
  const top = Math.max(rect[1], rect[3]);

  const tolerance = 2;
  return (
    x >= left - tolerance &&
    x <= right + tolerance &&
    y >= bottom - tolerance &&
    y <= top + tolerance
  );
}

async function extract(pdfPath) {
  const pdfjs = await loadPdfJs();
  const pdfJsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
  const standardFontDataUrl = path.join(pdfJsRoot, 'standard_fonts') + path.sep;
  const binary = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjs.getDocument({
    data: binary,
    useWorkerFetch: false,
    isEvalSupported: false,
    standardFontDataUrl,
    verbosity: pdfjs.VerbosityLevel.ERRORS,
  });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  const outlineRaw = (await pdfDocument.getOutline()) || [];
  const toc = [];
  await flattenOutline(pdfDocument, outlineRaw, 1, toc);

  const textRuns = [];
  const extractedImages = [];
  const imageOptions = {
    includeFullPageImages: hasFlag('include-full-page-images'),
    fullPageThreshold: Number(parseArg('full-page-threshold', '0.82')),
    minImageDimension: Number(parseArg('min-image-dimension', '40')),
    maxDataUriLength: Number(parseArg('max-image-data-uri-length', String(800000))),
  };
  for (let pageNumber = 1; pageNumber <= numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const text = await page.getTextContent({disableCombineTextItems: true});
    const pageImages = await extractPageImages(pdfjs, page, pageNumber, imageOptions);
    extractedImages.push(...pageImages);
    const annotations = await page.getAnnotations({intent: 'display'});
    const internalLinks = [];

    for (const annotation of annotations) {
      if (annotation.subtype !== 'Link' || annotation.url) {
        continue;
      }
      const targetPage = await resolveDestinationPage(
        pdfDocument,
        annotation.dest,
      );
      if (!targetPage) {
        continue;
      }

      internalLinks.push({
        rect: annotation.rect,
        targetPage,
      });
    }

    for (const item of text.items) {
      const raw = item.str || '';
      const normalizedText = String(raw).replace(/\s+/g, ' ').trim();
      if (!normalizedText) {
        continue;
      }

      const transform = item.transform || [];
      const x = Number(transform[4] || 0);
      const y = Number(transform[5] || 0);
      const link = internalLinks.find(candidate =>
        pointInRect(x, y, candidate.rect),
      );

      textRuns.push({
        text: normalizedText,
        x,
        y,
        page: pageNumber,
        fontSize: toFontSize(transform),
        fontName: item.fontName ? String(item.fontName) : undefined,
        ...inferFontTraits(item.fontName),
        internalHref: link ? `page-${link.targetPage}` : undefined,
      });
    }
  }

  return {
    textRuns: applyTypographyHeuristics(textRuns),
    images: extractedImages,
    toc,
    meta: {
      sourceUrl: SOURCE_URL,
      sourceSha256: fileSha256(pdfPath),
      pageCount: numPages,
      extractedAt: new Date().toISOString(),
    },
  };
}

async function main() {
  const source = parseArg('source', SOURCE_URL);
  const inputPdf = parseArg('pdf', DEFAULT_PDF_PATH);
  const outputRuns = parseArg('out-runs', DEFAULT_OUTPUT_RUNS_PATH);
  const outputToc = parseArg('out-toc', DEFAULT_OUTPUT_TOC_PATH);
  const outputMeta = parseArg('out-meta', DEFAULT_OUTPUT_META_PATH);
  const outputImages = parseArg('out-images', DEFAULT_OUTPUT_IMAGES_PATH);
  const refresh = hasFlag('refresh');

  if (source.startsWith('http://') || source.startsWith('https://')) {
    if (refresh || !fs.existsSync(inputPdf)) {
      await downloadPdf(source, inputPdf);
    } else {
      console.log(`Using cached PDF ${inputPdf}`);
    }
  } else if (source !== inputPdf) {
    ensureDir(inputPdf);
    fs.copyFileSync(source, inputPdf);
  }

  if (!fs.existsSync(inputPdf)) {
    throw new Error(
      `Missing PDF at ${inputPdf}. Provide --source=<url-or-file> or --pdf=<file>`,
    );
  }

  const extracted = await extract(inputPdf);
  ensureDir(outputRuns);
  ensureDir(outputToc);
  ensureDir(outputMeta);
  ensureDir(outputImages);
  fs.writeFileSync(outputRuns, JSON.stringify(extracted.textRuns, null, 2));
  fs.writeFileSync(outputToc, JSON.stringify(extracted.toc, null, 2));
  fs.writeFileSync(outputMeta, JSON.stringify(extracted.meta, null, 2));
  fs.writeFileSync(outputImages, JSON.stringify(extracted.images, null, 2));

  console.log(`Extracted text runs: ${outputRuns}`);
  console.log(`Extracted toc: ${outputToc}`);
  console.log(`Extracted meta: ${outputMeta}`);
  console.log(`Extracted images: ${outputImages} (${extracted.images.length})`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
