import React from 'react';
import type { PluginManifest } from '../../shared/types';
import './PluginCard.css';

interface PluginCardProps {
  plugin: PluginManifest;
  onSelect: (pluginId: string) => void;
  onActivate?: (pluginId: string) => void;
  isActive?: boolean;
  showActivateButton?: boolean;
}

// 默认 SVG 图标
const defaultIcons: Record<string, string> = {
  'youtube-analyzer': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="url(#yt-grad)"/>
    <path d="M42 32L26 42V22L42 32Z" fill="white"/>
    <defs>
      <linearGradient id="yt-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FF0000"/>
        <stop offset="1" stop-color="#CC0000"/>
      </linearGradient>
    </defs>
  </svg>`,
  'example-counter': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="url(#counter-grad)"/>
    <text x="32" y="42" text-anchor="middle" fill="white" font-size="24" font-weight="bold">123</text>
    <defs>
      <linearGradient id="counter-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#667eea"/>
        <stop offset="1" stop-color="#764ba2"/>
      </linearGradient>
    </defs>
  </svg>`,
  'example-downloader': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="url(#dl-grad)"/>
    <path d="M32 18V38M32 38L24 30M32 38L40 30" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 46H44" stroke="white" stroke-width="3" stroke-linecap="round"/>
    <defs>
      <linearGradient id="dl-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#4CAF50"/>
        <stop offset="1" stop-color="#2E7D32"/>
      </linearGradient>
    </defs>
  </svg>`,
};

const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onSelect,
  onActivate,
  isActive = false,
  showActivateButton = true,
}) => {
  const handleClick = () => {
    onSelect(plugin.id);
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActivate) {
      onActivate(plugin.id);
    }
  };

  const getSvgIcon = () => {
    return defaultIcons[plugin.id] || `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="url(#default-grad)"/>
      <text x="32" y="40" text-anchor="middle" fill="white" font-size="28">${plugin.icon || '🔧'}</text>
      <defs>
        <linearGradient id="default-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stop-color="#667eea"/>
          <stop offset="1" stop-color="#764ba2"/>
        </linearGradient>
      </defs>
    </svg>`;
  };

  return (
    <div className="plugin-card" onClick={handleClick}>
      {/* 左侧图标 */}
      <div
        className="plugin-card-icon"
        dangerouslySetInnerHTML={{ __html: getSvgIcon() }}
      />

      {/* 中间信息 */}
      <div className="plugin-card-info">
        <h3 className="plugin-card-name">{plugin.name}</h3>
        <p className="plugin-card-desc">{plugin.description}</p>
        <div className="plugin-card-meta">
          <span className="plugin-version">v{plugin.version}</span>
          <span className="plugin-type">{plugin.type}</span>
        </div>
      </div>

      {/* 右侧操作 */}
      {showActivateButton && (
        <div className="plugin-card-actions">
          <button
            className={`activate-button ${isActive ? 'active' : 'inactive'}`}
            onClick={handleActivate}
          >
            {isActive ? '已激活' : '激活'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PluginCard;
