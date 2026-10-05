---
title: LZH Code Blog 个人博客
description: Hexo 8 + 全手写 csdn-style 主题：从设计变量到响应式栅格的「暖纸印刷风」博客，无现成主题依赖
category: Web
tags: [Hexo, EJS, CSS, JavaScript, Node.js]
cover: assets/covers/lzh-code-blog-home.jpg
date: 2026-09-01
status: 已完成
featured: true
github: https://github.com/Bogucheese/Bogucheese.github.io
demo: https://lzhcodeblog.site
---

## 项目简介

我的个人技术博客（[lzhcodeblog.site](https://lzhcodeblog.site)），记录代码、思考与成长——也是「暖纸印刷」设计体系的第一个完整落地作品（本作品集网站就是它的姊妹篇）。整站基于 Hexo 8，但主题完全手写：从版式、配色、字体层级到交互细节不依赖任何现成主题，最终形成一套可复用的 CSS 设计体系。

## 功能亮点

- **完整页面体系**：首页、文章详情、归档（按年时间线）、分类、标签、关于页，外加全站即时搜索（纯前端，输入即出结果，无后端）
- **文章阅读体验**：衬线标题 + 无衬线正文的印刷排版、highlight.js 暖色代码高亮、代码块悬浮复制按钮、`-webkit-line-clamp` 摘要截断
- **侧栏信息架构**：个人资料卡（头像/统计）、近期文章排行（编号目录式）、分类计数、标签云
- **全站响应式**：桌面双栏（正文 + 300px 侧栏）→ 平板单栏侧栏横排 → 移动端全折叠，断点 1024 / 860 / 640
- **阅读增强**：回到顶部按钮、平滑锚点滚动、`::selection` 陶土色选中文本

## 设计与布局

设计上刻意克制，靠规则而不是装饰撑质感：

- **色板即变量**：全部颜色收敛为十几个 CSS 变量——骨纸底 `#f8f8f6`、纸白卡片、碳黑墨迹 `#121212`、五档灰阶（石墨/烟灰/卵石/薄雾/粉笔），唯一的彩色是陶土橙 `#d97757`
- **字体双轨制**：标题用衬线（Source Serif 4 / Noto Serif SC）压住版面，正文用 Inter / Noto Sans SC，代码用系统等宽字体，三轨互不越界
- **一套圆角与阴影**：控件 8px、卡片 16px、浮层 24px 三档圆角；唯一的阴影是 hover 时 4% 透明度的柔和纸影，配 2px 上浮
- **深色页脚**：全站唯一的黑色色块（`#000`），作为刻意的收尾音

![文章详情页：衬线标题、引导语引用块、表格排版与右栏信息架构，整体是"印刷品"式的阅读版式](assets/screenshots/lzh-code-blog-post.jpg)

## 技术实现

- Hexo 8 静态生成，Markdown 写作，`highlight.js` 语法高亮
- EJS 模板组件化：`head / header / sidebar / footer / article-card` 五个 partial 复用
- 手写 CSS 设计体系（CSS 变量驱动），零 UI 框架、零 JS 库依赖
- 部署走 `hexo-deployer-git`

## 开发复盘

最初想直接套现成主题，但视觉上总差点意思，最后决定从零手写。三点最大收获：

1. **克制比堆砌难**：删掉第三种颜色、第二种阴影之后，页面反而更"贵"了
2. **变量先行**：先定色板/圆角/字体三套变量再写布局，返工次数骤减——这套方法论直接复用到了作品集网站
3. **移动端不是缩小的桌面**：1024px 以下侧栏从"右栏"变"横排模块网格"才是对的形态，单纯压宽度只会得到灾难
