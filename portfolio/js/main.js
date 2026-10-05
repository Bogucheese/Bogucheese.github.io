/* main.js — 作品集渲染逻辑（首页 + 详情页共用）
 * 数据来源：data/profile.json（个人信息）与 data/projects.json（由 build.js 生成）
 */

(function () {
  'use strict';

  var PAGE = document.body.dataset.page;

  /* ---------- 工具 ---------- */

  function loadJSON(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(res.status + ' ' + url);
      return res.json();
    });
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function statusClass(status) {
    return status ? 'status-badge" data-status="' + escapeHtml(status) : 'status-badge" data-status="未分类';
  }

  /* 浏览器窗口框 — 把截图裱成一扇纸上的窗口 */
  function frameUrlText(p) {
    if (p.demo) {
      try { return new URL(p.demo).hostname; } catch (e) { /* ignore */ }
    }
    return p.slug;
  }

  function browserFrame(imgHtml, urlText) {
    return (
      '<div class="browser-frame">' +
      '<div class="browser-bar">' +
      '<span class="browser-dot red"></span>' +
      '<span class="browser-dot yellow"></span>' +
      '<span class="browser-dot green"></span>' +
      '<span class="browser-url">' + escapeHtml(urlText || '') + '</span>' +
      '</div>' +
      '<div class="frame-viewport">' + (imgHtml || '') + '</div>' +
      '</div>'
    );
  }

  /* 正文插图：Markdown 里的 <p><img alt="图注"></p> 自动包成带图注的窗口框 */
  function enhanceArticleImages(html) {
    if (!html) return html;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    Array.prototype.slice.call(doc.querySelectorAll('img')).forEach(function (img) {
      var parent = img.parentElement;
      if (!parent || parent.tagName !== 'P' || !img.getAttribute('src')) return;
      var caption = (img.getAttribute('alt') || '').trim();
      var fig = doc.createElement('figure');
      fig.className = 'work-shot';
      fig.innerHTML = browserFrame('', '');
      var viewport = fig.querySelector('.frame-viewport');
      img.removeAttribute('alt');
      var onlyChild = parent.children.length === 1 && parent.textContent.trim() === '';
      if (onlyChild) parent.replaceWith(fig);
      else parent.replaceChild(fig, img);
      viewport.appendChild(img);
      if (caption) {
        var cap = doc.createElement('figcaption');
        cap.textContent = caption;
        fig.appendChild(cap);
      }
    });
    return doc.body.innerHTML;
  }

  /* ---------- 图标 ---------- */

  var ICONS = {
    github:
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
    mail:
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-.5a.5.5 0 0 0-.5.5v.3l6.5 4.06L14.5 4.3V4a.5.5 0 0 0-.5-.5H2Zm12.5 2.42L8.26 9.93a.5.5 0 0 1-.52 0L1.5 5.92V12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V5.92Z"/></svg>',
    blog:
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 1.5a.5.5 0 0 1 .5.5v.5h6V2a.5.5 0 0 1 1 0v.5h1A1.5 1.5 0 0 1 14.5 4v9A1.5 1.5 0 0 1 13 14.5H3A1.5 1.5 0 0 1 1.5 13V4A1.5 1.5 0 0 1 3 2.5h1V2a.5.5 0 0 1 .5-.5ZM3 3.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H3ZM5 6h6v1H5V6Zm0 2.5h6v1H5v-1Zm0 2.5h4v1H5v-1Z"/></svg>'
  };

  /* ---------- 共享：个人信息侧栏 ---------- */

  function renderProfileCard(profile) {
    var social = profile.social || {};
    var socialHtml = '';
    if (social.github)
      socialHtml +=
        '<a class="social-btn" href="' + escapeHtml(social.github) + '" target="_blank" rel="noopener" title="GitHub">' + ICONS.github + '</a>';
    if (social.email)
      socialHtml +=
        '<a class="social-btn" href="' + escapeHtml(social.email) + '" title="邮箱">' + ICONS.mail + '</a>';
    if (social.blog)
      socialHtml +=
        '<a class="social-btn" href="' + escapeHtml(social.blog) + '" target="_blank" rel="noopener" title="博客">' + ICONS.blog + '</a>';

    var avatarHtml = profile.avatar
      ? '<div class="profile-avatar"><img src="' + escapeHtml(profile.avatar) + '" alt="' + escapeHtml(profile.name) + '"' +
        ' onerror="this.parentNode.outerHTML=\'<div class=&quot;avatar-fallback&quot;>' + escapeHtml(profile.name.charAt(0)) + '</div>\'"></div>'
      : '<div class="avatar-fallback">' + escapeHtml(profile.name.charAt(0)) + '</div>';

    return (
      '<div class="profile-card">' +
      avatarHtml +
      '<h3 class="profile-name">' + escapeHtml(profile.name) + '</h3>' +
      '<p class="profile-desc">' + escapeHtml(profile.bio) + '</p>' +
      (socialHtml ? '<div class="profile-social">' + socialHtml + '</div>' : '') +
      '<div class="profile-stats" id="profileStats"></div>' +
      '</div>'
    );
  }

  function renderStats(projectCount, tagCount) {
    var el = document.getElementById('profileStats');
    if (!el) return;
    el.innerHTML =
      '<div class="stat-block"><span class="stat-value">' + projectCount + '</span><span class="stat-label">个项目</span></div>' +
      '<div class="stat-block"><span class="stat-value">' + tagCount + '</span><span class="stat-label">项技术</span></div>';
  }

  function applyProfile(profile) {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.innerHTML = renderProfileCard(profile);

    var gh = (profile.social && profile.social.github) || '#';
    ['githubLink', 'footerGithub'].forEach(function (id) {
      var a = document.getElementById(id);
      if (a) a.href = gh;
    });
  }

  /* ---------- 首页 ---------- */

  function initIndex(profile, projects) {
    var state = {
      category: new URLSearchParams(location.search).get('cat') || '',
      tag: new URLSearchParams(location.search).get('tag') || ''
    };

    var categories = [];
    var tagCounts = {};
    projects.forEach(function (p) {
      if (categories.indexOf(p.category) === -1) categories.push(p.category);
      p.tags.forEach(function (t) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    var tags = Object.keys(tagCounts).sort(function (a, b) {
      return tagCounts[b] - tagCounts[a];
    });

    /* 顶部导航：全部 + 各分类 */
    var nav = document.getElementById('headerNav');
    nav.innerHTML =
      '<a class="nav-link' + (state.category === '' && !state.tag ? ' active' : '') + '" href="index.html" data-cat="">全部项目</a>' +
      categories
        .map(function (c) {
          return '<a class="nav-link' + (state.category === c ? ' active' : '') + '" href="index.html?cat=' + encodeURIComponent(c) + '" data-cat="' + escapeHtml(c) + '">' + escapeHtml(c) + '</a>';
        })
        .join('');

    /* 筛选 chips */
    var chips = document.getElementById('filterChips');
    chips.innerHTML =
      '<button class="filter-chip' + (state.category === '' && !state.tag ? ' active' : '') + '" data-cat="">全部</button>' +
      categories
        .map(function (c) {
          return '<button class="filter-chip' + (state.category === c ? ' active' : '') + '" data-cat="' + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
        })
        .join('');
    chips.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-chip');
      if (!btn) return;
      state.category = btn.dataset.cat || '';
      state.tag = '';
      syncAndRender();
    });

    /* 侧栏 */
    var sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = renderProfileCard(profile) +
      '<div class="sidebar-module"><h4 class="module-title">分类</h4><ul class="category-list">' +
      categories
        .map(function (c) {
          var n = projects.filter(function (p) { return p.category === c; }).length;
          return '<li class="category-item"><a href="javascript:void(0)" class="' + (state.category === c ? 'active' : '') + '" data-cat="' + escapeHtml(c) + '"><span>' + escapeHtml(c) + '</span><span class="category-count">' + n + '</span></a></li>';
        })
        .join('') +
      '</ul></div>' +
      '<div class="sidebar-module"><h4 class="module-title">技术栈</h4><div class="tag-cloud">' +
      tags
        .map(function (t) {
          return '<a href="javascript:void(0)" class="tag-item' + (state.tag === t ? ' active' : '') + '" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</a>';
        })
        .join('') +
      '</div></div>' +
      '<div class="sidebar-module"><h4 class="module-title">最新项目</h4><ul class="hot-list">' +
      projects
        .slice()
        .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); })
        .slice(0, 4)
        .map(function (p, i) {
          return '<li class="hot-item"><span class="hot-rank">0' + (i + 1) + '</span><a class="hot-title" href="project.html?p=' + encodeURIComponent(p.slug) + '">' + escapeHtml(p.title) + '</a></li>';
        })
        .join('') +
      '</ul></div>';

    sidebar.addEventListener('click', function (e) {
      var cat = e.target.closest('[data-cat]');
      if (cat) {
        state.category = cat.dataset.cat === state.category ? '' : cat.dataset.cat;
        state.tag = '';
        syncAndRender();
        return;
      }
      var tag = e.target.closest('[data-tag]');
      if (tag) {
        state.tag = tag.dataset.tag === state.tag ? '' : tag.dataset.tag;
        if (state.tag) state.category = '';
        syncAndRender();
      }
    });

    renderStats(projects.length, tags.length);

    function filtered() {
      return projects.filter(function (p) {
        if (state.category && p.category !== state.category) return false;
        if (state.tag && p.tags.indexOf(state.tag) === -1) return false;
        return true;
      });
    }

    function syncAndRender() {
      var qs = new URLSearchParams();
      if (state.category) qs.set('cat', state.category);
      if (state.tag) qs.set('tag', state.tag);
      history.replaceState(null, '', qs.toString() ? 'index.html?' + qs.toString() : 'index.html');

      chips.querySelectorAll('.filter-chip').forEach(function (b) {
        b.classList.toggle('active', (b.dataset.cat || '') === state.category && !state.tag);
      });
      sidebar.querySelectorAll('[data-cat]').forEach(function (a) {
        a.classList.toggle('active', (a.dataset.cat || '') === state.category && !!a.dataset.cat);
      });
      sidebar.querySelectorAll('[data-tag]').forEach(function (a) {
        a.classList.toggle('active', (a.dataset.tag || '') === state.tag && !!state.tag);
      });

      renderGrid();
    }

    function coverHtml(p) {
      var badge = p.status
        ? '<span class="status-badge" data-status="' + escapeHtml(p.status) + '">' + escapeHtml(p.status) + '</span>'
        : '';
      var frame = p.cover
        ? browserFrame(
            '<img src="' + escapeHtml(p.cover) + '" alt="' + escapeHtml(p.title) + '" loading="lazy"' +
            ' onerror="this.closest(\'.browser-frame\').outerHTML=\'<div class=&quot;cover-fallback&quot;><span class=&quot;fallback-char&quot;>' + escapeHtml(p.title.charAt(0)) + '</span></div>\'">',
            frameUrlText(p)
          )
        : '<div class="cover-fallback"><span class="fallback-char">' + escapeHtml(p.title.charAt(0)) + '</span></div>';
      return '<a class="card-cover" href="project.html?p=' + encodeURIComponent(p.slug) + '">' + frame + badge + '</a>';
    }

    function renderGrid() {
      var list = filtered();
      var grid = document.getElementById('projectGrid');
      var empty = document.getElementById('emptyState');
      var count = document.getElementById('filterCount');

      count.textContent = state.category || state.tag
        ? '筛选出 ' + list.length + ' / ' + projects.length + ' 个项目'
        : '共 ' + projects.length + ' 个项目';

      empty.hidden = list.length !== 0;
      grid.innerHTML = list
        .map(function (p) {
          var links = '';
          if (p.github)
            links += '<a class="footer-link" href="' + escapeHtml(p.github) + '" target="_blank" rel="noopener">' + ICONS.github.replace('<svg ', '<svg width="14" height="14" ') + 'GitHub</a>';
          if (p.demo)
            links += '<a class="footer-link" href="' + escapeHtml(p.demo) + '" target="_blank" rel="noopener">在线演示 ↗</a>';
          return (
            '<article class="project-card">' +
            coverHtml(p) +
            '<div class="card-body">' +
            '<div class="card-meta"><span>' + escapeHtml(p.date) + '</span>' + (p.category ? '<span class="meta-sep">·</span><span>' + escapeHtml(p.category) + '</span>' : '') + '</div>' +
            '<h3 class="card-title"><a href="project.html?p=' + encodeURIComponent(p.slug) + '">' + escapeHtml(p.title) + '</a></h3>' +
            '<p class="card-desc">' + escapeHtml(p.description) + '</p>' +
            '<div class="card-tags">' + p.tags.map(function (t) { return '<span class="tag-chip">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
            '</div>' +
            '<div class="card-footer">' + links + '<a class="detail-link" href="project.html?p=' + encodeURIComponent(p.slug) + '">查看详情 →</a></div>' +
            '</article>'
          );
        })
        .join('');
    }

    syncAndRender();
  }

  /* ---------- 详情页 ---------- */

  function initDetail(profile, projects) {
    var slug = new URLSearchParams(location.search).get('p');
    var idx = projects.findIndex(function (p) { return p.slug === slug; });
    var container = document.getElementById('projectDetail');

    if (idx === -1) {
      container.innerHTML =
        '<div class="detail-header"><h1 class="detail-title">没有找到这个项目</h1>' +
        '<p class="detail-meta">请检查链接，或返回 <a href="index.html" style="text-decoration:underline">全部项目</a>。</p></div>';
      document.title = '未找到 - LZH 作品集';
      return;
    }

    var p = projects[idx];
    document.title = p.title + ' - LZH 作品集';
    renderStats(projects.length, Object.keys(tagSet(projects)).length);

    var cover = p.cover
      ? '<div class="detail-cover">' + browserFrame(
          '<img src="' + escapeHtml(p.cover) + '" alt="' + escapeHtml(p.title) + '"' +
          ' onerror="this.closest(\'.detail-cover\').style.display=\'none\'">',
          frameUrlText(p)
        ) + '</div>'
      : '';

    var actions = '';
    if (p.github)
      actions += '<a class="action-btn primary" href="' + escapeHtml(p.github) + '" target="_blank" rel="noopener">' + ICONS.github.replace('<svg ', '<svg width="14" height="14" ') + 'GitHub 仓库</a>';
    if (p.demo)
      actions += '<a class="action-btn" href="' + escapeHtml(p.demo) + '" target="_blank" rel="noopener">在线演示 ↗</a>';
    if (profile.social && profile.social.blog)
      actions += '<a class="action-btn" href="' + escapeHtml(profile.social.blog) + '" target="_blank" rel="noopener">我的博客 ↗</a>';

    container.innerHTML =
      cover +
      '<div class="detail-header">' +
      '<h1 class="detail-title">' + escapeHtml(p.title) + '</h1>' +
      '<div class="detail-meta">' +
      (p.status ? '<span class="status-badge" data-status="' + escapeHtml(p.status) + '">' + escapeHtml(p.status) + '</span>' : '') +
      '<span>' + escapeHtml(p.date) + '</span>' +
      (p.category ? '<span class="meta-sep">·</span><span>' + escapeHtml(p.category) + '</span>' : '') +
      (p.tags.length ? '<span class="meta-sep">·</span><span>' + p.tags.map(escapeHtml).join(' / ') + '</span>' : '') +
      '</div>' +
      (actions ? '<div class="detail-actions">' + actions + '</div>' : '') +
      '</div>' +
      '<div class="article-body">' + enhanceArticleImages(marked.parse(p.content)) + '</div>';

    /* 上一个 / 下一个（按当前排序，即 featured + 日期序） */
    var prev = projects[idx - 1];
    var next = projects[idx + 1];
    var navEl = document.getElementById('projectNav');
    if (prev || next) {
      navEl.hidden = false;
      document.getElementById('navPrev').innerHTML = prev
        ? '<p class="nav-label">← 上一个项目</p><a class="nav-title" href="project.html?p=' + encodeURIComponent(prev.slug) + '">' + escapeHtml(prev.title) + '</a>'
        : '';
      document.getElementById('navNext').innerHTML = next
        ? '<p class="nav-label">下一个项目 →</p><a class="nav-title" href="project.html?p=' + encodeURIComponent(next.slug) + '">' + escapeHtml(next.title) + '</a>'
        : '';
    }
  }

  function tagSet(projects) {
    var set = {};
    projects.forEach(function (p) {
      p.tags.forEach(function (t) { set[t] = 1; });
    });
    return set;
  }

  /* ---------- 启动 ---------- */

  var yearEl = document.getElementById('copyrightYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('show', window.scrollY > 400);
  });

  Promise.all([loadJSON('data/profile.json'), loadJSON('data/projects.json')])
    .then(function (results) {
      var profile = results[0];
      var projects = results[1].projects || [];
      applyProfile(profile);
      if (PAGE === 'index') initIndex(profile, projects);
      else initDetail(profile, projects);
    })
    .catch(function (err) {
      console.error(err);
      var main = document.querySelector('.content-right');
      if (main)
        main.innerHTML =
          '<div class="empty-state"><p class="empty-title">数据加载失败</p>' +
          '<p class="empty-desc">请确认已运行 <code>node build.js</code>，并通过 HTTP 服务访问本站（不要直接双击打开 HTML）。</p></div>';
    });
})();
