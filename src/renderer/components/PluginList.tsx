import React from 'react';
import type { PluginManifest } from '../../shared/types';
import './PluginList.css';

interface PluginListProps {
  plugins: PluginManifest[];
  onSelect: (pluginId: string) => void;
}

const PluginList: React.FC<PluginListProps> = ({ plugins, onSelect }) => {
  const getPluginIcon = (plugin: PluginManifest) => {
    if (plugin.icon) return plugin.icon;

    // 根据插件类型返回默认图标
    const iconMap: Record<string, string> = {
      tool: '🔧',
      service: '⚙️',
      widget: '📊',
    };
    return iconMap[plugin.type] || '📦';
  };

  return (
    <div className="plugin-list">
      {plugins.map((plugin) => (
        <div
          key={plugin.id}
          className="plugin-card"
          onClick={() => onSelect(plugin.id)}
        >
          <div className="plugin-icon">{getPluginIcon(plugin)}</div>
          <div className="plugin-info">
            <h3 className="plugin-name">{plugin.name}</h3>
            <p className="plugin-description">{plugin.description}</p>
            <div className="plugin-meta">
              <span className="plugin-version">v{plugin.version}</span>
              <span className="plugin-type">{plugin.type}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PluginList;
