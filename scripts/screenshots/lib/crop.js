'use strict';

const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

function anchorOffsets(anchor, source, target) {
  const maxX = source.width - target.width;
  const maxY = source.height - target.height;

  const anchors = {
    center: {x: Math.floor(maxX / 2), y: Math.floor(maxY / 2)},
    top: {x: Math.floor(maxX / 2), y: 0},
    bottom: {x: Math.floor(maxX / 2), y: maxY},
    left: {x: 0, y: Math.floor(maxY / 2)},
    right: {x: maxX, y: Math.floor(maxY / 2)},
    'top-left': {x: 0, y: 0},
    'top-right': {x: maxX, y: 0},
    'bottom-left': {x: 0, y: maxY},
    'bottom-right': {x: maxX, y: maxY},
  };

  return anchors[anchor] || anchors.center;
}

function computeCropRect(source, target, anchor) {
  if (source.width < target.width || source.height < target.height) {
    throw new Error(
      `Source image too small for crop. Source ${source.width}x${source.height}, target ${target.width}x${target.height}`,
    );
  }

  const offset = anchorOffsets(anchor || 'center', source, target);
  return {
    width: target.width,
    height: target.height,
    x: offset.x,
    y: offset.y,
  };
}

function run(command, args) {
  const result = spawnSync(command, args, {encoding: 'utf8'});
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function readImageSize(imagePath) {
  const output = run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', imagePath]);
  const widthMatch = output.match(/pixelWidth:\s*(\d+)/);
  const heightMatch = output.match(/pixelHeight:\s*(\d+)/);

  if (!widthMatch || !heightMatch) {
    throw new Error(`Could not parse image dimensions for ${imagePath}`);
  }

  return {
    width: Number(widthMatch[1]),
    height: Number(heightMatch[1]),
  };
}

function copyFile(sourcePath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), {recursive: true});
  fs.copyFileSync(sourcePath, targetPath);
}

function cropImageToTarget({sourcePath, targetPath, target, anchor = 'center'}) {
  fs.mkdirSync(path.dirname(targetPath), {recursive: true});
  const source = readImageSize(sourcePath);

  if (source.width === target.width && source.height === target.height) {
    copyFile(sourcePath, targetPath);
    return {source, crop: {x: 0, y: 0, width: target.width, height: target.height}, target};
  }

  const crop = computeCropRect(source, target, anchor);

  run('sips', [
    '--cropToHeightWidth',
    String(crop.height),
    String(crop.width),
    '--cropOffset',
    String(crop.y),
    String(crop.x),
    sourcePath,
    '--out',
    targetPath,
  ]);

  const actual = readImageSize(targetPath);
  if (actual.width !== target.width || actual.height !== target.height) {
    throw new Error(
      `Cropped output has wrong dimensions. Expected ${target.width}x${target.height}, got ${actual.width}x${actual.height}`,
    );
  }

  return {source, crop, target};
}

module.exports = {
  anchorOffsets,
  computeCropRect,
  readImageSize,
  cropImageToTarget,
};
