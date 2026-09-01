// 返回顶部功能
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// 显示/隐藏返回顶部按钮
window.addEventListener('scroll', function() {
  const backToTop = document.getElementById('backToTop');
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

// 搜索功能
function search() {
  const query = document.getElementById('headerSearch').value;
  if (query) {
    window.location.href = '/?search=' + encodeURIComponent(query);
  }
}

// 代码块复制功能
function initCodeCopy() {
  const pres = document.querySelectorAll('pre');
  pres.forEach(pre => {
    const button = document.createElement('button');
    button.className = 'copy-code';
    button.textContent = '复制';
    pre.appendChild(button);

    button.addEventListener('click', () => {
      const code = pre.querySelector('code');
      if (code) {
        navigator.clipboard.writeText(code.textContent).then(() => {
          button.textContent = '已复制';
          setTimeout(() => {
            button.textContent = '复制';
          }, 2000);
        });
      }
    });
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  initCodeCopy();
});
