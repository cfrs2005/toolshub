/**
 * YouTube 视频分析工具 - 主界面
 */
import React, { useState, useEffect } from 'react';
import { fetchTranscript, VideoInfo } from './youtubeService';
import { BigModelService, AnalysisResult } from './aiService';
import { generateHTMLReport } from './reportGenerator';
import { HistoryService } from './historyService';
import { AnalysisHistory } from './types';
import SettingsPanel from './SettingsPanel';

const YouTubeAnalyzer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'fetching' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [configValid, setConfigValid] = useState(false);

  useEffect(() => {
    loadHistory();
    checkConfig();
  }, []);

  const checkConfig = async () => {
    const config = await HistoryService.getConfig();
    setConfigValid(!!config.apiKey.trim());
  };

  const loadHistory = async () => {
    const recentHistory = await HistoryService.getRecentRecords(10);
    setHistory(recentHistory);
  };

  // 开始分析
  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError('请输入 YouTube 视频链接');
      return;
    }

    if (!configValid) {
      setError('请先在设置中配置 API Key');
      setShowSettings(true);
      return;
    }

    setStatus('fetching');
    setError('');
    setProgress('正在获取视频字幕...');

    try {
      const config = await HistoryService.getConfig();

      // 1. 获取字幕
      const video = await fetchTranscript(videoUrl, config.proxyUrl || undefined);
      setProgress(`字幕获取成功!共 ${video.transcriptItems.length} 条字幕`);

      // 2. AI 分析
      setStatus('analyzing');
      setProgress('正在调用 AI 进行分析...');

      const aiService = new BigModelService({ apiKey: config.apiKey });
      const analysis = await aiService.analyzeVideo(video.transcript);

      // 3. 生成报告
      setProgress('正在生成 HTML 报告...');
      const html = generateHTMLReport(video, analysis);

      // 4. 保存到历史记录
      await HistoryService.saveAnalysis(video, analysis, html);

      setStatus('completed');
      setProgress('分析完成!');
      setVideoUrl('');

      // 重新加载历史记录
      loadHistory();

      // 2 秒后自动清除提示
      setTimeout(() => {
        setStatus('idle');
        setProgress('');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || '分析过程中出现错误');
      setProgress('');
    }
  };

  // 预览历史记录
  const handlePreview = (record: AnalysisHistory) => {
    if (record.reportHtml) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(record.reportHtml);
        newWindow.document.close();
      }
    }
  };

  // 下载历史记录
  const handleDownload = (record: AnalysisHistory) => {
    if (!record.reportHtml) return;

    const blob = new Blob([record.reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-analysis-${record.videoInfo.videoId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 删除历史记录
  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条记录吗?')) {
      await HistoryService.deleteRecord(id);
      loadHistory();
    }
  };

  return (
    <div style={styles.container}>
      {/* 头部 */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎬 YouTube 视频分析</h1>
          <p style={styles.subtitle}>基于 AI 生成视频内容的深度分析报告</p>
        </div>
        <button onClick={() => setShowSettings(true)} style={styles.settingsButton}>
          ⚙️ 设置
        </button>
      </div>

      {/* 配置提示 */}
      {!configValid && (
        <div style={styles.warningBox}>
          <span style={styles.warningIcon}>⚠️</span>
          <span>请先在设置中配置 BigModel API Key</span>
          <button onClick={() => setShowSettings(true)} style={styles.warningButton}>
            立即配置
          </button>
        </div>
      )}

      {/* 快速输入 */}
      <div style={styles.inputSection}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="粘贴 YouTube 视频链接,例如: https://www.youtube.com/watch?v=xxxxx"
            style={styles.input}
            disabled={status === 'fetching' || status === 'analyzing'}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAnalyze();
              }
            }}
          />
          <button
            onClick={handleAnalyze}
            style={{
              ...styles.analyzeButton,
              ...(status === 'fetching' || status === 'analyzing' ? styles.buttonDisabled : {}),
            }}
            disabled={status === 'fetching' || status === 'analyzing'}
          >
            {status === 'fetching' || status === 'analyzing' ? '分析中...' : '🚀 开始分析'}
          </button>
        </div>
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

      {/* 历史记录 */}
      <div style={styles.historySection}>
        <div style={styles.historySectionHeader}>
          <h3 style={styles.historyTitle}>📚 分析历史</h3>
          {history.length > 0 && (
            <button
              onClick={async () => {
                if (confirm('确定要清空所有历史记录吗?')) {
                  await HistoryService.clearHistory();
                  loadHistory();
                }
              }}
              style={styles.clearButton}
            >
              清空
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📭</p>
            <p style={styles.emptyText}>暂无分析记录</p>
            <p style={styles.emptyHint}>输入视频链接开始第一次分析吧!</p>
          </div>
        ) : (
          <div style={styles.historyList}>
            {history.map((record) => (
              <div key={record.id} style={styles.historyCard}>
                {/* 缩略图 */}
                {record.thumbnailUrl && (
                  <div style={styles.thumbnail}>
                    <img src={record.thumbnailUrl} alt="thumbnail" style={styles.thumbnailImage} />
                  </div>
                )}

                {/* 内容 */}
                <div style={styles.historyContent}>
                  <h4 style={styles.historyVideoId}>视频 ID: {record.videoInfo.videoId}</h4>
                  <p style={styles.historyMeta}>
                    <span>🕒 {HistoryService.formatTimestamp(record.timestamp)}</span>
                    <span style={{ marginLeft: '15px' }}>
                      📝 {record.analysisResult.keyPoints.length} 个关键点
                    </span>
                  </p>
                  <p style={styles.historySummary}>
                    {record.analysisResult.readingNotes.substring(0, 100)}...
                  </p>
                </div>

                {/* 操作按钮 */}
                <div style={styles.historyActions}>
                  <button
                    onClick={() => handlePreview(record)}
                    style={{ ...styles.actionButton, ...styles.previewButton }}
                    title="预览报告"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleDownload(record)}
                    style={{ ...styles.actionButton, ...styles.downloadButton }}
                    title="下载报告"
                  >
                    💾
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    title="删除记录"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div style={styles.helpSection}>
        <h4 style={styles.helpTitle}>💡 使用说明</h4>
        <ol style={styles.helpList}>
          <li>点击右上角"设置"配置 BigModel API Key</li>
          <li>输入或粘贴 YouTube 视频链接</li>
          <li>点击"开始分析"或按 Enter 键</li>
          <li>等待 AI 分析完成(约 1-3 分钟)</li>
          <li>在历史记录中预览或下载分析报告</li>
        </ol>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <SettingsPanel
          onClose={() => {
            setShowSettings(false);
            checkConfig();
          }}
        />
      )}
    </div>
  );
};

// 样式
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '30px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '25px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    color: 'white',
  },
  title: {
    fontSize: '2em',
    margin: '0 0 8px 0',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1em',
    margin: 0,
    opacity: 0.95,
  },
  settingsButton: {
    padding: '12px 24px',
    fontSize: '1em',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    background: '#fff3cd',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ffc107',
  },
  warningIcon: {
    fontSize: '1.5em',
  },
  warningButton: {
    marginLeft: 'auto',
    padding: '8px 16px',
    background: '#ffc107',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: '25px',
  },
  inputWrapper: {
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    fontSize: '1em',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  analyzeButton: {
    padding: '14px 32px',
    fontSize: '1em',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  progressBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '18px 20px',
    background: '#e7f3ff',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #2196f3',
  },
  progressIcon: {
    fontSize: '1.8em',
  },
  progressText: {
    fontSize: '1em',
    color: '#1976d2',
    fontWeight: '500',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '18px 20px',
    background: '#ffebee',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #f44336',
  },
  errorIcon: {
    fontSize: '1.8em',
  },
  errorText: {
    fontSize: '1em',
    color: '#c62828',
    fontWeight: '500',
    margin: 0,
  },
  historySection: {
    marginTop: '40px',
  },
  historySectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  historyTitle: {
    fontSize: '1.5em',
    margin: 0,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  clearButton: {
    padding: '8px 16px',
    background: '#e0e0e0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#f8f9fa',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '4em',
    margin: '0 0 15px 0',
  },
  emptyText: {
    fontSize: '1.2em',
    color: '#6c757d',
    margin: '0 0 8px 0',
  },
  emptyHint: {
    fontSize: '0.95em',
    color: '#adb5bd',
    margin: 0,
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  historyCard: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  thumbnail: {
    width: '160px',
    height: '90px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#e0e0e0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  historyContent: {
    flex: 1,
    minWidth: 0,
  },
  historyVideoId: {
    fontSize: '1.1em',
    margin: '0 0 8px 0',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  historyMeta: {
    fontSize: '0.9em',
    color: '#6c757d',
    margin: '0 0 10px 0',
  },
  historySummary: {
    fontSize: '0.95em',
    color: '#495057',
    margin: 0,
    lineHeight: 1.5,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  historyActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    justifyContent: 'center',
  },
  actionButton: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.2em',
    transition: 'all 0.2s',
  },
  previewButton: {
    background: '#e3f2fd',
  },
  downloadButton: {
    background: '#e8f5e9',
  },
  deleteButton: {
    background: '#ffebee',
  },
  helpSection: {
    marginTop: '40px',
    padding: '20px 25px',
    background: '#f8f9fa',
    borderRadius: '10px',
  },
  helpTitle: {
    fontSize: '1.1em',
    margin: '0 0 12px 0',
    color: '#2c3e50',
  },
  helpList: {
    paddingLeft: '25px',
    lineHeight: '1.8',
    color: '#495057',
    margin: 0,
  },
};

export default YouTubeAnalyzer;
