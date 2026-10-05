# LZH 作品集（博客子站）

暖纸印刷风格的个人作品集，**已并入 LZH Code Blog**，作为博客的一个静态子站运行在线地址 `https://lzhcodeblog.site/portfolio/`。本目录位于博客仓库内（`blog/source/portfolio/`），通过 Hexo 的 `skip_render` 原样发布，也是作品集唯一的源——加项目、改样式都在这里做。

视觉体系与博客 csdn-style 主题同源：骨纸底色、碳黑墨迹、陶土橙点缀、衬线标题；布局为左侧个人信息栏 + 顶部导航 + 右侧三列项目卡片，点卡片进入项目详情。

## 目录结构

```
blog/source/portfolio/
├── index.html            # 首页：侧栏 + 三列卡片网格 + 分类筛选
├── project.html          # 项目详情页（project.html?p=slug）
├── build.js              # 扫描 projects/*.md → data/projects.json（零依赖，node 直接跑）
├── css/style.css         # 设计体系（与博客主题同源）
├── js/main.js            # 渲染逻辑：窗口框封面 / 卡片 / 筛选 / 详情 / 图注
├── js/marked.min.js      # 本地 Markdown 渲染（无 CDN 依赖）
├── data/profile.json     # 左侧栏个人信息（头像 / 简介 / GitHub / 邮箱 / 博客）
├── projects/             # 每个项目一个 Markdown 文件（_template.md 为模板）
└── assets/
    ├── covers/           # 卡片封面图
    └── screenshots/      # 详情页正文插图
```

## 如何添加新项目

1. 复制模板：`cp projects/_template.md projects/我的项目.md`（文件名即 URL 中的 slug）
2. 编辑 frontmatter 和正文
3. 重新构建：`node build.js`（就在本目录运行）
4. 本地预览：`cd ../.. && npx hexo server`，访问 `http://localhost:4001/portfolio/`

### frontmatter 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 项目名称（卡片标题 + 详情页标题） |
| `description` | ✅ | 一句话简介，显示在卡片上，建议 40 字以内 |
| `category` | 建议 | 分类，如 `Web` / `AI` / `工具`；自动生成导航和筛选 |
| `tags` | 建议 | 技术栈数组 `[Python, FastAPI]`，自动聚合进侧栏「技术栈」 |
| `cover` | 可选 | 封面图路径（放 `assets/covers/`）；截图会自动裱进浏览器窗口框 |
| `date` | 建议 | 日期 `YYYY-MM-DD`，用于排序和展示 |
| `status` | 可选 | `已完成` / `开发中` / `已归档`，显示为卡片左上角徽章 |
| `featured` | 可选 | `true` 置顶排序 |
| `github` | 可选 | GitHub 仓库链接，显示在卡片底部和详情页按钮 |
| `demo` | 可选 | 在线演示链接，同上 |

正文是标准 Markdown：

- 图片写 `![图注](assets/screenshots/xxx.jpg)`，会自动裱进浏览器窗口框并显示图注
- 封面图建议 1440×900 及以上（16:10 附近），放 `assets/covers/`

## 修改个人信息

编辑 `data/profile.json`：`name`、`avatar`（留空显示首字母占位）、`bio`、`social.github` / `social.email` / `social.blog`。改完刷新页面即可，无需 build。

## 预览与发布

```bash
cd blog
npx hexo server                # 本地预览 http://localhost:4001/portfolio/
npx hexo clean && npx hexo generate && npx hexo deploy   # 发布上线
git add -A && git commit -m "..." && git push            # 源码推 GitHub（本仓库）
```

注意：作品集的改动必须从 `blog` 仓库根目录走 Hexo 的 generate/deploy 才会出现在线上；本目录下 `node build.js` 只重新生成 `data/projects.json`。
