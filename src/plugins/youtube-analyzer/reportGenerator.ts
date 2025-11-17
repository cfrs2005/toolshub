/**
 * HTML 报告生成器 - 公众号文章风格
 */
import { AnalysisResult } from './aiService';
import { VideoInfo } from './youtubeService';

/**
 * 将 Markdown 转换为 HTML（改进版本）
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // 代码块（需要在其他替换之前处理）
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 标题
  html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');

  // 粗体
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // 斜体
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 列表项（保留原始格式，稍后处理）
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const unorderedMatch = line.match(/^\s*[-*]\s+(.+)$/);
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);

    if (unorderedMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(`</${listType}>`);
        processedLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      processedLines.push(`<li>${unorderedMatch[1]}</li>`);
    } else if (orderedMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(`</${listType}>`);
        processedLines.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      processedLines.push(`<li>${orderedMatch[1]}</li>`);
    } else {
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      processedLines.push(line);
    }
  }

  if (inList) {
    processedLines.push(`</${listType}>`);
  }

  html = processedLines.join('\n');

  // 段落（处理连续的非标签行）
  html = html.split('\n\n').map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.match(/^<(h[123]|ul|ol|pre|code)/)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('\n\n');

  return html;
}

/**
 * 生成公众号风格的 HTML 报告
 */
export function generateHTMLReport(
  videoInfo: VideoInfo,
  analysis: AnalysisResult
): string {
  const currentDate = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube 视频深度解读 - ${videoInfo.videoId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
            line-height: 1.8;
            color: #3a3a3a;
            background: #f7f8fa;
            padding: 0;
            font-size: 17px;
        }

        .article-container {
            max-width: 720px;
            margin: 0 auto;
            background: #ffffff;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        /* 文章头部 */
        .article-header {
            padding: 48px 24px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-align: center;
        }

        .article-title {
            font-size: 28px;
            font-weight: 600;
            line-height: 1.4;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
        }

        .article-meta {
            font-size: 14px;
            opacity: 0.9;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .article-meta span {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        /* 视频信息卡片 */
        .video-card {
            margin: 24px;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }

        .video-card-title {
            font-size: 14px;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .video-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
            transition: color 0.3s;
        }

        .video-link:hover {
            color: #764ba2;
            text-decoration: underline;
        }

        /* 文章正文 */
        .article-body {
            padding: 32px 24px;
        }

        /* 引言/摘要 */
        .article-intro {
            font-size: 18px;
            line-height: 1.8;
            color: #5a5a5a;
            padding: 24px;
            background: #f9fafb;
            border-left: 4px solid #667eea;
            border-radius: 4px;
            margin-bottom: 40px;
            font-style: italic;
        }

        /* 章节 */
        .section {
            margin-bottom: 48px;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e8e8e8;
        }

        .section-icon {
            font-size: 28px;
            line-height: 1;
        }

        .section-title {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            letter-spacing: 0.5px;
        }

        /* 段落样式 */
        .article-body p {
            margin: 20px 0;
            text-align: justify;
            text-indent: 2em;
            line-height: 1.9;
        }

        .article-body p:first-child {
            text-indent: 0;
        }

        /* 标题样式 */
        .article-body h1,
        .article-body h2,
        .article-body h3 {
            color: #2c3e50;
            font-weight: 600;
            margin: 32px 0 16px;
            line-height: 1.4;
        }

        .article-body h1 {
            font-size: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e8e8e8;
        }

        .article-body h2 {
            font-size: 22px;
        }

        .article-body h3 {
            font-size: 20px;
            color: #667eea;
        }

        /* 列表样式 */
        .article-body ul,
        .article-body ol {
            margin: 20px 0;
            padding-left: 2em;
        }

        .article-body li {
            margin: 12px 0;
            line-height: 1.8;
        }

        .article-body ul li {
            list-style: none;
            position: relative;
            padding-left: 1.2em;
        }

        .article-body ul li::before {
            content: "•";
            color: #667eea;
            font-weight: bold;
            position: absolute;
            left: 0;
        }

        /* 重点卡片 */
        .highlight-card {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            padding: 20px 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #fdcb6e;
            box-shadow: 0 4px 12px rgba(253, 203, 110, 0.2);
        }

        .highlight-card p {
            text-indent: 0 !important;
            margin: 8px 0;
        }

        /* 关键点列表 */
        .key-points-list {
            margin: 24px 0;
        }

        .key-point-item {
            background: #ffffff;
            padding: 16px 20px;
            margin: 16px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.3s ease;
            position: relative;
            padding-left: 48px;
        }

        .key-point-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
        }

        .key-point-item::before {
            content: "✓";
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }

        /* 思维导图样式 */
        .mindmap-container {
            background: #f9fafb;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
        }

        .mindmap-container ul {
            list-style: none;
            padding-left: 0;
        }

        .mindmap-container li {
            margin: 12px 0;
            padding-left: 24px;
            position: relative;
        }

        .mindmap-container li::before {
            content: "▸";
            color: #667eea;
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 18px;
        }

        .mindmap-container ul ul {
            padding-left: 24px;
            margin-top: 8px;
        }

        .mindmap-container ul ul li::before {
            content: "◦";
            font-size: 16px;
        }

        /* 代码样式 */
        .article-body code {
            background: #f4f4f4;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 0.9em;
            color: #e83e8c;
        }

        .article-body pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 24px 0;
            line-height: 1.6;
        }

        .article-body pre code {
            background: none;
            padding: 0;
            color: inherit;
        }

        /* 强调文本 */
        .article-body strong {
            color: #2c3e50;
            font-weight: 600;
        }

        .article-body em {
            color: #667eea;
            font-style: normal;
            font-weight: 500;
        }

        /* 分隔线 */
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e8e8e8, transparent);
            margin: 40px 0;
        }

        /* 文章底部 */
        .article-footer {
            padding: 32px 24px;
            background: #f9fafb;
            border-top: 1px solid #e8e8e8;
            text-align: center;
        }

        .footer-brand {
            font-size: 16px;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .footer-powered {
            font-size: 13px;
            color: #999;
        }

        .footer-timestamp {
            font-size: 12px;
            color: #bbb;
            margin-top: 12px;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            body {
                font-size: 16px;
            }

            .article-header {
                padding: 32px 20px 24px;
            }

            .article-title {
                font-size: 24px;
            }

            .article-body {
                padding: 24px 20px;
            }

            .section-title {
                font-size: 20px;
            }

            .article-body h1 {
                font-size: 20px;
            }

            .article-body h2 {
                font-size: 18px;
            }

            .article-body h3 {
                font-size: 17px;
            }
        }

        /* 打印样式 */
        @media print {
            body {
                background: white;
            }

            .article-container {
                box-shadow: none;
            }

            .article-header {
                background: #667eea;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <article class="article-container">
        <!-- 文章头部 -->
        <header class="article-header">
            <h1 class="article-title">📺 YouTube 视频深度解读</h1>
            <div class="article-meta">
                <span>🤖 AI 智能分析</span>
                <span>•</span>
                <span>📅 ${currentDate}</span>
            </div>
        </header>

        <!-- 视频信息卡片 -->
        <div class="video-card">
            <div class="video-card-title">📌 视频来源</div>
            <a href="${videoInfo.url}" target="_blank" class="video-link">${videoInfo.url}</a>
        </div>

        <!-- 文章正文 -->
        <div class="article-body">
            <!-- 引言 -->
            <div class="article-intro">
                ${markdownToHtml(analysis.summary.split('\n\n')[0])}
            </div>

            <!-- 主要内容 -->
            <section class="section">
                <div class="section-header">
                    <span class="section-icon">📖</span>
                    <h2 class="section-title">内容概览</h2>
                </div>
                ${markdownToHtml(analysis.summary.split('\n\n').slice(1).join('\n\n'))}
            </section>

            <div class="divider"></div>

            <!-- 核心要点 -->
            <section class="section">
                <div class="section-header">
                    <span class="section-icon">💎</span>
                    <h2 class="section-title">核心要点</h2>
                </div>
                <div class="key-points-list">
                    ${analysis.keyPoints.map(point => `<div class="key-point-item">${point}</div>`).join('')}
                </div>
            </section>

            <div class="divider"></div>

            <!-- 内容结构 -->
            <section class="section">
                <div class="section-header">
                    <span class="section-icon">🗺️</span>
                    <h2 class="section-title">内容结构</h2>
                </div>
                <div class="mindmap-container">
                    ${markdownToHtml(analysis.mindMap)}
                </div>
            </section>

            <div class="divider"></div>

            <!-- 深度思考 -->
            <section class="section">
                <div class="section-header">
                    <span class="section-icon">💡</span>
                    <h2 class="section-title">深度思考</h2>
                </div>
                ${markdownToHtml(analysis.insights)}
            </section>
        </div>

        <!-- 文章底部 -->
        <footer class="article-footer">
            <div class="footer-brand">ToolsHub YouTube Analyzer</div>
            <div class="footer-powered">Powered by BigModel GLM-4-Air</div>
            <div class="footer-timestamp">生成时间：${currentDate}</div>
        </footer>
    </article>
</body>
</html>`;

  return html;
}

/**
 * 保存报告到文件
 */
export function saveReport(html: string, filename: string): Blob {
  return new Blob([html], { type: 'text/html;charset=utf-8' });
}
