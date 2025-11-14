import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '../../shared/types';
import './PluginView.css';

interface PluginViewProps {
  pluginId: string;
  onBack: () => void;
}

const PluginView: React.FC<PluginViewProps> = ({ pluginId, onBack }) => {
  const [plugin, setPlugin] = useState<PluginManifest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugin();
  }, [pluginId]);

  const loadPlugin = async () => {
    try {
      const pluginData = await window.electronAPI.getPlugin(pluginId);
      setPlugin(pluginData);

      // 激活插件
      await window.electronAPI.activatePlugin(pluginId);
    } catch (error) {
      console.error('Failed to load plugin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !plugin) {
    return (
      <div className="plugin-view loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="plugin-view">
      <header className="plugin-header">
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <h2>{plugin.name}</h2>
      </header>
      <main className="plugin-content">
        <div className="plugin-placeholder">
          <p>插件界面将在这里加载</p>
          <small>插件 ID: {plugin.id}</small>
        </div>
      </main>
    </div>
  );
};

export default PluginView;
