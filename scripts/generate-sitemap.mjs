#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const SITE_URL = process.env.SITE_URL || process.argv[2] || 'https://typpy.online';

function isoDate(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function walk(dir) {
  const results = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results.push(...(await walk(full)));
      } else {
        results.push(full);
      }
    }
  } catch (e) {
    // directory may not exist
  }
  return results;
}

async function collectPages() {
  const pagesDir = path.join(process.cwd(), 'src/pages');
  const files = await walk(pagesDir);
  const astro = files.filter(f => f.endsWith('.astro'));
  const pages = [];
  for (const f of astro) {
    const name = path.basename(f);
    if (name.includes('[') || name.includes(']')) continue; // dynamic route
    if (name.startsWith('_')) continue;
    let rel = path.relative(pagesDir, f).replace(/\\/g, '/');
    rel = rel.replace(/index\.astro$/, '');
    rel = rel.replace(/\.astro$/, '');
    let url = '/' + rel;
    url = url.replace(/\/+/g, '/');
    if (url !== '/' && url.endsWith('/')) url = url.slice(0, -1);
    let lastmod = null;
    try {
      const stat = await fs.stat(f);
      lastmod = isoDate(stat.mtime);
    } catch (e) {}
    pages.push({ url, lastmod });
  }
  return pages;
}

async function collectContent() {
  const contentDir = path.join(process.cwd(), 'src/content');
  const files = await walk(contentDir);
  const md = files.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const items = [];
  for (const f of md) {
    const rel = path.relative(contentDir, f).replace(/\\/g, '/');
    const parts = rel.split('/');
    const fileName = path.basename(f);
    const slug = fileName.replace(/\.mdx?$/, '');
    let url;
    if (parts[0] === 'news') {
      url = `/blog/${encodeURIComponent(slug)}`;
    } else if (parts.length > 1) {
      url = `/${parts.slice(0, -1).join('/')}/${encodeURIComponent(slug)}`;
    } else {
      url = `/${encodeURIComponent(slug)}`;
    }
    let lastmod = null;
    try {
      const txt = await fs.readFile(f, 'utf8');
      const fm = txt.match(/---\s*([\s\S]*?)\s*---/);
      if (fm) {
        const fmBody = fm[1];
        const dateMatch = fmBody.match(/date:\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
        if (dateMatch) lastmod = isoDate(dateMatch[1]);
      }
    } catch (e) {}
    if (!lastmod) {
      try {
        const stat = await fs.stat(f);
        lastmod = isoDate(stat.mtime);
      } catch (e) {}
    }
    items.push({ url, lastmod });
  }
  return items;
}

function buildXml(items) {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const open = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const close = '</urlset>\n';
  const body = items.map(it => {
    const last = it.lastmod ? `    <lastmod>${it.lastmod}</lastmod>\n` : '';
    return `  <url>\n    <loc>${SITE_URL}${it.url}</loc>\n${last}  </url>`;
  }).join('\n');
  return header + open + body + '\n' + close;
}

async function main() {
  const pages = await collectPages();
  const content = await collectContent();
  const map = new Map();
  for (const p of [...pages, ...content]) {
    const existing = map.get(p.url);
    if (!existing || (p.lastmod && (!existing.lastmod || p.lastmod > existing.lastmod))) {
      map.set(p.url, p);
    }
  }
  if (!map.has('/')) map.set('/', { url: '/', lastmod: null });
  const items = Array.from(map.values()).sort((a, b) => a.url.localeCompare(b.url));
  const xml = buildXml(items);
  await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), 'public', 'sitemap.xml'), xml, 'utf8');
  console.log(`Wrote public/sitemap.xml (${items.length} entries)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
