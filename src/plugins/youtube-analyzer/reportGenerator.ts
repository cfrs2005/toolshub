/**
 * HTML 报告生成器
 */
import { AnalysisResult } from './aiService';
import { VideoInfo } from './youtubeService';

/**
 * 将 Markdown 转换为 HTML（简单版本）
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // 代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // 无序列表
  html = html.replace(/^\s*[-\*]\s+(.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // 有序列表
  html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');

  // 段落
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.match(/^<[hup]/)) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');

  // 换行
  html = html.replace(/\n/g, '<br/>');

  return html;
}

/**
 * 生成 HTML 报告
 */
export function generateHTMLReport(
  videoInfo: VideoInfo,
  analysis: AnalysisResult
): string {
  const currentDate = new Date().toLocaleString('zh-CN');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube 视频分析报告 - ${videoInfo.videoId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .video-info {
            background: #f8f9fa;
            padding: 20px 40px;
            border-bottom: 1px solid #e9ecef;
        }

        .video-info a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }

        .video-info a:hover {
            text-decoration: underline;
        }

        .content {
            padding: 40px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 1.8em;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title .icon {
            font-size: 1.2em;
        }

        .section-content {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            line-height: 1.8;
        }

        .section-content h1,
        .section-content h2,
        .section-content h3 {
            color: #2c3e50;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .section-content h1 {
            font-size: 1.6em;
        }

        .section-content h2 {
            font-size: 1.4em;
        }

        .section-content h3 {
            font-size: 1.2em;
        }

        .section-content ul {
            padding-left: 20px;
            margin: 15px 0;
        }

        .section-content li {
            margin: 8px 0;
            line-height: 1.6;
        }

        .section-content p {
            margin: 10px 0;
        }

        .section-content code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        .section-content pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
        }

        .key-points {
            display: grid;
            gap: 15px;
        }

        .key-point {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .key-point:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .key-point::before {
            content: "▸";
            color: #667eea;
            font-weight: bold;
            margin-right: 10px;
        }

        .mindmap {
            background: white;
            padding: 20px;
            border-radius: 8px;
        }

        .mindmap ul {
            list-style: none;
            padding-left: 0;
        }

        .mindmap li {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }

        .mindmap li::before {
            content: "•";
            color: #667eea;
            font-weight: bold;
            position: absolute;
            left: 0;
        }

        .mindmap ul ul {
            padding-left: 25px;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }

        .timestamp {
            font-size: 0.9em;
            color: #6c757d;
            margin-top: 10px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
            }
        }

        @media (max-width: 768px) {
            .header {
                padding: 20px;
            }
            .header h1 {
                font-size: 1.8em;
            }
            .content {
                padding: 20px;
            }
            .section-title {
                font-size: 1.4em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 YouTube 视频分析报告</h1>
            <p>智能 AI 分析 · 深度解读视频内容</p>
        </div>

        <div class="video-info">
            <p><strong>视频链接：</strong><a href="${videoInfo.url}" target="_blank">${videoInfo.url}</a></p>
            <p><strong>视频 ID：</strong>${videoInfo.videoId}</p>
            <p class="timestamp"><strong>生成时间：</strong>${currentDate}</p>
        </div>

        <div class="content">
            <!-- 阅读笔记 -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">📝</span>
                    阅读笔记
                </h2>
                <div class="section-content">
                    ${markdownToHtml(analysis.summary)}
                </div>
            </div>

            <!-- 思维导图 -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">🗺️</span>
                    思维导图
                </h2>
                <div class="section-content mindmap">
                    ${markdownToHtml(analysis.mindMap)}
                </div>
            </div>

            <!-- 重点分析 -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">⭐</span>
                    重点分析
                </h2>
                <div class="section-content">
                    <div class="key-points">
                        ${analysis.keyPoints.map(point => `<div class="key-point">${point}</div>`).join('')}
                    </div>
                </div>
            </div>

            <!-- 深度思考 -->
            <div class="section">
                <h2 class="section-title">
                    <span class="icon">💡</span>
                    深度思考
                </h2>
                <div class="section-content">
                    ${markdownToHtml(analysis.insights)}
                </div>
            </div>
        </div>

        <div class="footer">
            <p>由 <strong>ToolsHub YouTube Analyzer</strong> 生成</p>
            <p>Powered by BigModel GLM-4-Air</p>
        </div>
    </div>
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
