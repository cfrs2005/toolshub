import React from 'react';
import type { HistoryItem } from '../types/history';
import './HistoryGrid.css';

interface HistoryGridProps {
  history: HistoryItem[];
  onCardClick: (historyId: string) => void;
}

const HistoryGrid: React.FC<HistoryGridProps> = ({ history, onCardClick }) => {
  // 格式化相对时间
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  if (history.length === 0) {
    return (
      <div className="history-grid-empty">
        <div className="empty-icon">📋</div>
        <h3>暂无历史记录</h3>
        <p>使用左侧工具开始创建你的第一条记录</p>
      </div>
    );
  }

  return (
    <div className="history-grid">
      {history.map((item) => (
        <div
          key={item.id}
          className="history-card"
          onClick={() => onCardClick(item.id)}
        >
          {/* 缩略图 */}
          {item.thumbnail ? (
            <div className="card-thumbnail">
              <img src={item.thumbnail} alt={item.title} />
            </div>
          ) : (
            <div className="card-thumbnail card-thumbnail-placeholder">
              <span>{item.pluginIcon || '📄'}</span>
            </div>
          )}

          {/* 卡片内容 */}
          <div className="card-body">
            {/* 插件信息 */}
            <div className="card-plugin">
              <span className="plugin-icon">{item.pluginIcon || '🔧'}</span>
              <span className="plugin-name">{item.pluginName}</span>
            </div>

            {/* 标题 */}
            <h3 className="card-title">{item.title}</h3>

            {/* 摘要 */}
            {item.summary && (
              <p className="card-summary">{item.summary}</p>
            )}

            {/* 时间 */}
            <time className="card-time">{formatRelativeTime(item.timestamp)}</time>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryGrid;
