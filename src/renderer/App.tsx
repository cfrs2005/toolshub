import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '../shared/types';
import PluginList from './components/PluginList';
import PluginView from './components/PluginView';
import './App.css';

function App() {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      const pluginList = await window.electronAPI.getPlugins();
      setPlugins(pluginList);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePluginSelect = (pluginId: string) => {
    setSelectedPlugin(pluginId);
  };

  const handleBackToHome = () => {
    setSelectedPlugin(null);
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
        <p>加载工具中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {selectedPlugin ? (
        <PluginView pluginId={selectedPlugin} onBack={handleBackToHome} />
      ) : (
        <>
          <header className="app-header">
            <h1>🔧 ToolsHub</h1>
            <p className="subtitle">跨平台工具集</p>
          </header>
          <main className="app-main">
            {plugins.length === 0 ? (
              <div className="empty-state">
                <p>暂无工具</p>
                <small>请将工具插件放入插件目录</small>
              </div>
            ) : (
              <PluginList plugins={plugins} onSelect={handlePluginSelect} />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
