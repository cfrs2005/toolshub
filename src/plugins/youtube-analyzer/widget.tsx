/**
 * YouTube 分析工具 - Widget 组件
 * 在首页展示最近的分析记录
 */
import React, { useState, useEffect } from 'react';
import { WidgetProps } from '@shared/types/plugin';
import { HistoryService } from './historyService';
import { AnalysisHistory } from './types';

// YouTube SVG 图标
const YouTubeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px' }}>
    <rect width="64" height="64" rx="12" fill="url(#yt-widget-grad)" />
    <path d="M42 32L26 42V22L42 32Z" fill="white" />
    <defs>
      <linearGradient id="yt-widget-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF0000" />
        <stop offset="1" stopColor="#CC0000" />
      </linearGradient>
    </defs>
  </svg>
);

const YouTubeWidget: React.FC<WidgetProps> = ({ pluginId, onNavigate }) => {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const recentHistory = await HistoryService.getRecentRecords(5);
      setHistory(recentHistory);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (record: AnalysisHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (record.reportHtml) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(record.reportHtml);
        newWindow.document.close();
      }
    }
  };

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(pluginId);
    }
  };

  if (loading) {
    return (
      <div style={styles.widget}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h3 style={styles.title}>YouTube 视频分析</h3>
          </div>
          <div style={styles.headerIcon}>
            <YouTubeIcon />
          </div>
        </div>
        <div style={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={styles.widget}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h3 style={styles.title}>YouTube 视频分析</h3>
            <p style={styles.subtitle}>AI 驱动的视频内容深度分析</p>
          </div>
          <div style={styles.headerIcon}>
            <YouTubeIcon />
          </div>
        </div>
        <div style={styles.empty} onClick={handleCardClick}>
          <p style={styles.emptyIcon}>📭</p>
          <p style={styles.emptyText}>还没有分析记录</p>
          <button style={styles.emptyButton}>开始分析</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.widget}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>YouTube 视频分析</h3>
          <button onClick={handleCardClick} style={styles.moreButton}>
            查看全部 →
          </button>
        </div>
        <div style={styles.headerIcon}>
          <YouTubeIcon />
        </div>
      </div>

      <div style={styles.gallery}>
        {history.map((record) => (
          <div key={record.id} style={styles.card} onClick={handleCardClick}>
            {/* 缩略图 */}
            <div style={styles.cardThumbnail}>
              {record.thumbnailUrl ? (
                <img src={record.thumbnailUrl} alt="thumbnail" style={styles.cardImage} />
              ) : (
                <div style={styles.cardPlaceholder}>🎬</div>
              )}
              <div style={styles.cardOverlay}>
                <button
                  onClick={(e) => handlePreview(record, e)}
                  style={styles.previewButton}
                  title="预览报告"
                >
                  👁️ 预览
                </button>
              </div>
            </div>

            {/* 信息 */}
            <div style={styles.cardContent}>
              <h4 style={styles.cardTitle}>{record.videoInfo.videoId}</h4>
              <p style={styles.cardMeta}>
                <span>🕒 {HistoryService.formatTimestamp(record.timestamp)}</span>
              </p>
              <p style={styles.cardSummary}>
                {record.analysisResult.summary?.substring(0, 60) || '暂无摘要'}...
              </p>
              <div style={styles.cardStats}>
                <span style={styles.stat}>📝 {record.analysisResult.keyPoints.length} 要点</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div style={styles.footer}>
          <button onClick={handleCardClick} style={styles.footerButton}>
            查看所有记录 ({history.length}+)
          </button>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  widget: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    transition: 'box-shadow 0.3s, transform 0.3s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f0f0f0',
  },
  headerLeft: {
    flex: 1,
  },
  headerIcon: {
    flexShrink: 0,
    marginLeft: '16px',
  },
  title: {
    fontSize: '1.3em',
    margin: '0 0 8px 0',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '0.9em',
    margin: 0,
    color: '#6c757d',
  },
  moreButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #667eea',
    borderRadius: '6px',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    marginTop: '8px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
    fontSize: '1em',
  },
  empty: {
    textAlign: 'center',
    padding: '50px 20px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background 0.3s',
  },
  emptyIcon: {
    fontSize: '3em',
    margin: '0 0 10px 0',
  },
  emptyText: {
    fontSize: '1.1em',
    color: '#6c757d',
    margin: '0 0 15px 0',
  },
  emptyButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  },
  card: {
    background: '#f8f9fa',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardThumbnail: {
    position: 'relative',
    width: '100%',
    height: '100px',
    background: '#e0e0e0',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5em',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  previewButton: {
    padding: '6px 12px',
    background: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85em',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: '10px',
  },
  cardTitle: {
    fontSize: '0.9em',
    margin: '0 0 4px 0',
    color: '#2c3e50',
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    fontSize: '0.75em',
    color: '#6c757d',
    margin: '0 0 6px 0',
  },
  cardSummary: {
    fontSize: '0.8em',
    color: '#495057',
    margin: '0 0 8px 0',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  cardStats: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.75em',
  },
  stat: {
    color: '#667eea',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0',
  },
  footerButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '0.95em',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
};

// 添加 hover 样式效果
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .youtube-widget-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .youtube-widget-card:hover .youtube-widget-overlay {
      opacity: 1;
    }
    .youtube-widget-more-button:hover {
      background: #667eea;
      color: white;
    }
    .youtube-widget-footer-button:hover {
      background: #667eea;
      color: white;
    }
  `;
  document.head.appendChild(style);
}

export default YouTubeWidget;
