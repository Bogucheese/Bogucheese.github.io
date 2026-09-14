// 返回顶部
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

window.addEventListener('scroll', function () {
  var backToTop = document.getElementById('backToTop');
  if (!backToTop) return;
  backToTop.classList.toggle('show', window.scrollY > 300);
});

// 代码块复制
function initCodeCopy() {
  document.querySelectorAll('.article-body pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code) return;

    var button = document.createElement('button');
    button.className = 'copy-code';
    button.type = 'button';
    button.textContent = '复制';
    pre.appendChild(button);

    button.addEventListener('click', function () {
      navigator.clipboard.writeText(code.textContent).then(function () {
        button.textContent = '已复制';
        setTimeout(function () {
          button.textContent = '复制';
        }, 2000);
      });
    });
  });
}

// 首页搜索：读取 ?search= 参数，在当前页文章卡片中过滤
function initSearchFilter() {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('search') || '').trim();
  if (!query) return;

  var input = document.querySelector('.search-input');
  if (input) input.value = query;

  var list = document.getElementById('articleList');
  if (!list) return;

  var q = query.toLowerCase();
  var count = 0;
  list.querySelectorAll('.article-card').forEach(function (card) {
    var hit = card.textContent.toLowerCase().indexOf(q) !== -1;
    card.style.display = hit ? '' : 'none';
    if (hit) count++;
  });

  var notice = document.getElementById('searchNotice');
  if (notice) {
    document.getElementById('searchQuery').textContent = query;
    document.getElementById('searchCount').textContent = count;
    notice.hidden = false;
  }

  var hero = document.getElementById('hero');
  if (hero) hero.style.display = 'none';

  var pagination = document.getElementById('pagination');
  if (pagination) pagination.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
  initCodeCopy();
  initSearchFilter();
});
