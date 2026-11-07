#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function objectLiteral(source, marker, filename) {
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) throw new Error(`${filename}: cannot find ${marker}`);
  const start = source.indexOf('{', markerAt + marker.length);
  if (start < 0) throw new Error(`${filename}: cannot find object for ${marker}`);

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i], next = source[i + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(start, i + 1);
        return vm.runInNewContext(`(${literal})`, Object.create(null), { filename });
      }
    }
  }
  throw new Error(`${filename}: unterminated object for ${marker}`);
}

const sitePath = path.join(root, 'assets/polaroid/site.js');
const site = fs.readFileSync(sitePath, 'utf8');
const en = objectLiteral(site, 'const EN =', sitePath);
const dyn = objectLiteral(site, 'const DYN =', sitePath);

const pagesPath = path.join(root, 'assets/polaroid/pages-en.js');
const pagesContext = { window: {} };
vm.runInNewContext(fs.readFileSync(pagesPath, 'utf8'), pagesContext, { filename: pagesPath });
Object.assign(en, pagesContext.window.OAKVX_EN || {});

process.stdout.write(JSON.stringify({ en, dyn: dyn.en || {} }));
