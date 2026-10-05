#!/usr/bin/env node
/**
 * build.js — 扫描 projects/*.md，提取 frontmatter + 正文，生成 data/projects.json
 *
 * 用法：添加或修改项目后，在站点根目录运行
 *   node build.js
 *
 * 约定：
 *   - 每个项目一个 .md 文件，文件名（去掉 .md）就是 URL 中的 slug
 *   - 下划线开头的文件（如 _template.md）会被忽略
 *   - frontmatter 字段：title / description / category / tags / cover /
 *     date / status / featured / github / demo
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PROJECTS_DIR = path.join(ROOT, 'projects');
const OUTPUT_FILE = path.join(ROOT, 'data', 'projects.json');

function parseFrontmatter(raw) {
  const meta = {};
  let body = raw;

  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3);
    if (end !== -1) {
      const block = raw.slice(3, end).trim();
      body = raw.slice(raw.indexOf('\n', end + 1) + 1);
      for (const line of block.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const sep = trimmed.indexOf(':');
        if (sep === -1) continue;
        const key = trimmed.slice(0, sep).trim();
        let value = trimmed.slice(sep + 1).trim();
        // [a, b, c] 数组
        if (value.startsWith('[') && value.endsWith(']')) {
          meta[key] = value
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        } else if (value === 'true' || value === 'false') {
          meta[key] = value === 'true';
        } else {
          meta[key] = value.replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }
  return { meta, body: body.trim() };
}

function build() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`✗ 找不到 ${PROJECTS_DIR}，请在站点根目录运行本脚本。`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort();

  const projects = [];
  const warnings = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, '');

    if (!meta.title) warnings.push(`${file}: 缺少 title`);
    if (!meta.description) warnings.push(`${file}: 缺少 description（卡片简介）`);
    if (!meta.date) warnings.push(`${file}: 缺少 date，排序会不稳定`);

    projects.push({
      slug,
      title: meta.title || slug,
      description: meta.description || '',
      category: meta.category || '未分类',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      cover: meta.cover || '',
      date: meta.date || '',
      status: meta.status || '',
      featured: meta.featured === true,
      github: meta.github || '',
      demo: meta.demo || '',
      content: body,
    });
  }

  // featured 置顶，其余按日期倒序
  projects.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.date || '').localeCompare(a.date || '');
  });

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify({ generatedAt: new Date().toISOString(), projects }, null, 2)
  );

  console.log(`✓ 已生成 data/projects.json（${projects.length} 个项目）`);
  for (const p of projects) {
    console.log(`  · ${p.title}${p.featured ? '（置顶）' : ''} — ${p.category}`);
  }
  for (const w of warnings) console.warn(`⚠ ${w}`);
}

build();
