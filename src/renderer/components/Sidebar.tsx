import React from 'react';
import type { PluginManifest } from '../../shared/types';
import './Sidebar.css';

interface SidebarProps {
  plugins: PluginManifest[];
  selectedPlugin: string | null;
  onPluginSelect: (pluginId: string) => void;
  activeView: 'home' | 'plugin';
  onHomeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  plugins,
  selectedPlugin,
  onPluginSelect,
  activeView,
  onHomeClick,
}) => {
  // 按类型分组插件
  const toolPlugins = plugins.filter((p) => p.type === 'tool');
  const servicePlugins = plugins.filter((p) => p.type === 'service');
  const widgetPlugins = plugins.filter((p) => p.type === 'widget');

  return (
    <aside className="sidebar">
      {/* Logo 区域 */}
      <div className="sidebar-header">
        <div className="logo" onClick={onHomeClick}>
          <span className="logo-icon">🔧</span>
          <span className="logo-text">ToolsHub</span>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="sidebar-nav">
        {/* 首页 */}
        <div
          className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
          onClick={onHomeClick}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">首页</span>
        </div>

        {/* 工具插件 */}
        {toolPlugins.length > 0 && (
          <div className="nav-group">
            <div className="nav-group-title">工具</div>
            {toolPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className={`nav-item ${selectedPlugin === plugin.id ? 'active' : ''}`}
                onClick={() => onPluginSelect(plugin.id)}
              >
                <span className="nav-icon">{plugin.icon || '🔧'}</span>
                <span className="nav-label">{plugin.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 服务插件 */}
        {servicePlugins.length > 0 && (
          <div className="nav-group">
            <div className="nav-group-title">服务</div>
            {servicePlugins.map((plugin) => (
              <div
                key={plugin.id}
                className={`nav-item ${selectedPlugin === plugin.id ? 'active' : ''}`}
                onClick={() => onPluginSelect(plugin.id)}
              >
                <span className="nav-icon">{plugin.icon || '⚙️'}</span>
                <span className="nav-label">{plugin.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 小组件 */}
        {widgetPlugins.length > 0 && (
          <div className="nav-group">
            <div className="nav-group-title">小组件</div>
            {widgetPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className={`nav-item ${selectedPlugin === plugin.id ? 'active' : ''}`}
                onClick={() => onPluginSelect(plugin.id)}
              >
                <span className="nav-icon">{plugin.icon || '📊'}</span>
                <span className="nav-label">{plugin.name}</span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* 底部信息 */}
      <div className="sidebar-footer">
        <div className="footer-info">
          <span className="footer-version">v1.0.0</span>
          <span className="footer-count">{plugins.length} 插件</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
