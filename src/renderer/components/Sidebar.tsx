import React from 'react';
import type { PluginManifest } from '../../shared/types';
import type { HistoryItem } from '../types/history';
import './Sidebar.css';

interface SidebarProps {
  plugins: PluginManifest[];
  history: HistoryItem[];
  selectedPluginId: string | null;
  selectedHistoryId: string | null;
  onPluginSelect: (pluginId: string) => void;
  onHistorySelect: (historyId: string) => void;
  onHomeClick: () => void;
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  plugins,
  history,
  selectedPluginId,
  selectedHistoryId,
  onPluginSelect,
  onHistorySelect,
  onHomeClick,
  onSettingsClick,
}) => {
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

  return (
    <aside className="sidebar">
      {/* Logo 区域 */}
      <div className="sidebar-header">
        <div className="logo" onClick={onHomeClick}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ToolsHub</span>
        </div>
      </div>

      {/* 工具列表区域 */}
      <div className="sidebar-tools">
        <div className="sidebar-section-title">工具</div>
        <nav className="tools-nav">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className={`nav-item ${selectedPluginId === plugin.id && !selectedHistoryId ? 'active' : ''}`}
              onClick={() => onPluginSelect(plugin.id)}
            >
              <span className="nav-icon">{plugin.icon || '🔧'}</span>
              <span className="nav-label">{plugin.name}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* 分隔线 */}
      <div className="sidebar-divider" />

      {/* 历史记录区域 */}
      <div className="sidebar-history">
        <div className="sidebar-section-title">历史记录</div>
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              <span>暂无历史记录</span>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className={`history-item ${selectedHistoryId === item.id ? 'active' : ''}`}
                onClick={() => onHistorySelect(item.id)}
              >
                <div className="history-item-icon">
                  {item.pluginIcon || '📄'}
                </div>
                <div className="history-item-content">
                  <div className="history-item-title">{item.title}</div>
                  <div className="history-item-time">{formatRelativeTime(item.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 底部设置 */}
      <div className="sidebar-footer">
        <button className="sidebar-settings" onClick={onSettingsClick}>
          <span className="settings-icon">⚙️</span>
          <span className="settings-label">设置</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
