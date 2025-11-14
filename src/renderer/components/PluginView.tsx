import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '../../shared/types';
import { getPluginComponent } from '../pluginRegistry';
import './PluginView.css';

interface PluginViewProps {
  pluginId: string;
  onBack: () => void;
}

const PluginView: React.FC<PluginViewProps> = ({ pluginId, onBack }) => {
  const [plugin, setPlugin] = useState<PluginManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlugin();
  }, [pluginId]);

  const loadPlugin = async () => {
    try {
      const pluginData = await window.electronAPI.getPlugin(pluginId);
      if (!pluginData) {
        setError(`插件未找到: ${pluginId}`);
        setLoading(false);
        return;
      }

      setPlugin(pluginData);

      // 激活插件
      await window.electronAPI.activatePlugin(pluginId);
    } catch (error) {
      console.error('Failed to load plugin:', error);
      setError('加载插件失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="plugin-view loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="plugin-view">
        <header className="plugin-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>错误</h2>
        </header>
        <main className="plugin-content">
          <div className="plugin-error">
            <p>{error || '插件未找到'}</p>
          </div>
        </main>
      </div>
    );
  }

  // 获取插件组件
  const PluginComponent = getPluginComponent(pluginId);

  if (!PluginComponent) {
    return (
      <div className="plugin-view">
        <header className="plugin-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>{plugin.name}</h2>
        </header>
        <main className="plugin-content">
          <div className="plugin-error">
            <p>插件组件未注册: {plugin.id}</p>
            <small>请检查 pluginRegistry.tsx</small>
          </div>
        </main>
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
        <PluginComponent />
      </main>
    </div>
  );
};

export default PluginView;
