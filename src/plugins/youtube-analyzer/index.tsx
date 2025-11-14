/**
 * YouTube 视频分析工具 - 主界面
 */
import React, { useState, useEffect } from 'react';
import { fetchTranscript, VideoInfo } from './youtubeService';
import { BigModelService, AnalysisResult } from './aiService';
import { generateHTMLReport } from './reportGenerator';

const PLUGIN_ID = 'youtube-analyzer';
const API_KEY_STORAGE_KEY = 'bigmodel_api_key';

const YouTubeAnalyzer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'fetching' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [reportHtml, setReportHtml] = useState<string>('');

  // 加载保存的 API Key
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const savedApiKey = await window.electronAPI.pluginStorage.get(PLUGIN_ID, API_KEY_STORAGE_KEY);
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
      } catch (err) {
        console.error('加载 API Key 失败:', err);
      }
    };
    loadApiKey();
  }, []);

  // 保存 API Key
  const handleSaveApiKey = async () => {
    try {
      await window.electronAPI.pluginStorage.set(PLUGIN_ID, API_KEY_STORAGE_KEY, apiKey);
      alert('API Key 已保存');
    } catch (err) {
      alert('保存 API Key 失败');
    }
  };

  // 开始分析
  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError('请输入 YouTube 视频链接');
      return;
    }

    if (!apiKey.trim()) {
      setError('请输入 BigModel API Key');
      return;
    }

    setStatus('fetching');
    setError('');
    setProgress('正在获取视频字幕...');
    setVideoInfo(null);
    setAnalysisResult(null);
    setReportHtml('');

    try {
      // 1. 获取字幕
      const video = await fetchTranscript(videoUrl);
      setVideoInfo(video);
      setProgress(`字幕获取成功！共 ${video.transcriptItems.length} 条字幕，总计 ${video.transcript.length} 字符`);

      // 2. AI 分析
      setStatus('analyzing');
      setProgress('正在调用 AI 进行分析...');

      const aiService = new BigModelService({ apiKey });
      const analysis = await aiService.analyzeVideo(video.transcript);
      setAnalysisResult(analysis);

      // 3. 生成报告
      setProgress('正在生成 HTML 报告...');
      const html = generateHTMLReport(video, analysis);
      setReportHtml(html);

      setStatus('completed');
      setProgress('分析完成！');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || '分析过程中出现错误');
      setProgress('');
    }
  };

  // 下载报告
  const handleDownloadReport = () => {
    if (!reportHtml) return;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-analysis-${videoInfo?.videoId || Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 预览报告
  const handlePreviewReport = () => {
    if (!reportHtml) return;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(reportHtml);
      newWindow.document.close();
    }
  };

  // 重置
  const handleReset = () => {
    setStatus('idle');
    setProgress('');
    setError('');
    setVideoInfo(null);
    setAnalysisResult(null);
    setReportHtml('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎬 YouTube 视频分析工具</h1>
        <p style={styles.subtitle}>基于 AI 生成视频内容的深度分析报告</p>
      </div>

      {/* API Key 配置 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚙️ API 配置</h3>
        <div style={styles.inputGroup}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入 BigModel API Key"
            style={styles.input}
            disabled={status === 'fetching' || status === 'analyzing'}
          />
          <button
            onClick={handleSaveApiKey}
            style={styles.saveButton}
            disabled={status === 'fetching' || status === 'analyzing'}
          >
            保存
          </button>
        </div>
        <p style={styles.hint}>
          获取 API Key: <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer">open.bigmodel.cn</a>
        </p>
      </div>

      {/* 视频 URL 输入 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📹 视频链接</h3>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="输入 YouTube 视频链接，例如: https://www.youtube.com/watch?v=xxxxx"
          style={styles.input}
          disabled={status === 'fetching' || status === 'analyzing'}
        />
      </div>

      {/* 操作按钮 */}
      <div style={styles.buttonGroup}>
        <button
          onClick={handleAnalyze}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            ...(status === 'fetching' || status === 'analyzing' ? styles.buttonDisabled : {}),
          }}
          disabled={status === 'fetching' || status === 'analyzing'}
        >
          {status === 'fetching' || status === 'analyzing' ? '分析中...' : '🚀 开始分析'}
        </button>

        {status === 'completed' && (
          <>
            <button onClick={handlePreviewReport} style={{ ...styles.button, ...styles.secondaryButton }}>
              👁️ 预览报告
            </button>
            <button onClick={handleDownloadReport} style={{ ...styles.button, ...styles.secondaryButton }}>
              💾 下载报告
            </button>
            <button onClick={handleReset} style={{ ...styles.button, ...styles.secondaryButton }}>
              🔄 重新分析
            </button>
          </>
        )}
      </div>

      {/* 进度提示 */}
      {progress && (
        <div style={styles.progressBox}>
          <div style={styles.progressIcon}>
            {status === 'fetching' || status === 'analyzing' ? '⏳' : '✅'}
          </div>
          <p style={styles.progressText}>{progress}</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>❌</div>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* 分析结果摘要 */}
      {status === 'completed' && analysisResult && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 分析结果概览</h3>
          <div style={styles.resultSummary}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>视频 ID:</span>
              <span style={styles.summaryValue}>{videoInfo?.videoId}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>字幕长度:</span>
              <span style={styles.summaryValue}>{videoInfo?.transcript.length} 字符</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>关键点数:</span>
              <span style={styles.summaryValue}>{analysisResult.keyPoints.length} 个</span>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📖 使用说明</h3>
        <ol style={styles.instructionsList}>
          <li>配置 BigModel API Key（需要在 <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer">open.bigmodel.cn</a> 注册获取）</li>
          <li>输入 YouTube 视频链接</li>
          <li>点击"开始分析"按钮</li>
          <li>等待 AI 分析完成（可能需要几分钟）</li>
          <li>预览或下载生成的 HTML 报告</li>
        </ol>
        <div style={styles.features}>
          <h4 style={styles.featuresTitle}>报告包含以下内容：</h4>
          <ul style={styles.featuresList}>
            <li>📝 阅读笔记 - 视频内容的详细总结</li>
            <li>🗺️ 思维导图 - 内容的层级结构</li>
            <li>⭐ 重点分析 - 关键要点提取</li>
            <li>💡 深度思考 - AI 生成的见解和启发</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 样式
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '30px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    color: 'white',
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.1em',
    opacity: 0.95,
  },
  section: {
    marginBottom: '30px',
    padding: '25px',
    background: '#f8f9fa',
    borderRadius: '10px',
  },
  sectionTitle: {
    fontSize: '1.3em',
    marginBottom: '15px',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    fontSize: '1em',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  saveButton: {
    padding: '12px 25px',
    fontSize: '1em',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  hint: {
    marginTop: '10px',
    fontSize: '0.9em',
    color: '#6c757d',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '14px 28px',
    fontSize: '1em',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  secondaryButton: {
    background: '#6c757d',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  progressBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: '#e7f3ff',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #2196f3',
  },
  progressIcon: {
    fontSize: '2em',
  },
  progressText: {
    fontSize: '1.1em',
    color: '#1976d2',
    fontWeight: '500',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: '#ffebee',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #f44336',
  },
  errorIcon: {
    fontSize: '2em',
  },
  errorText: {
    fontSize: '1.1em',
    color: '#c62828',
    fontWeight: '500',
  },
  resultSummary: {
    display: 'grid',
    gap: '15px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#495057',
  },
  summaryValue: {
    color: '#667eea',
    fontWeight: '600',
  },
  instructionsList: {
    paddingLeft: '25px',
    lineHeight: '1.8',
    color: '#495057',
  },
  features: {
    marginTop: '20px',
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
  },
  featuresTitle: {
    fontSize: '1.1em',
    marginBottom: '10px',
    color: '#2c3e50',
  },
  featuresList: {
    paddingLeft: '25px',
    lineHeight: '1.8',
    color: '#495057',
  },
};

export default YouTubeAnalyzer;
