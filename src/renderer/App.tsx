import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '../shared/types';
import PluginList from './components/PluginList';
import PluginView from './components/PluginView';
import { getWidgetComponent } from './pluginRegistry';
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

  // 插件详情页
  if (selectedPlugin) {
    return <PluginView pluginId={selectedPlugin} onBack={handleBackToHome} />;
  }

  // 获取有 widget 的插件
  const pluginsWithWidgets = plugins.filter((p) => p.widget && getWidgetComponent(p.id));
  const hasWidgets = pluginsWithWidgets.length > 0;

  return (
    <div className="app">
      {/* 头部 */}
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
          <>
            {/* Widget 展示区域 */}
            {hasWidgets && (
              <section className="widgets-section">
                <h2 className="section-title">📊 活动面板</h2>
                <div className="widgets-grid">
                  {pluginsWithWidgets.map((plugin) => {
                    const WidgetComponent = getWidgetComponent(plugin.id);
                    if (!WidgetComponent) return null;

                    return (
                      <div key={plugin.id} className="widget-container">
                        <WidgetComponent pluginId={plugin.id} onNavigate={handlePluginSelect} />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 插件列表 */}
            <section className="plugins-section">
              <h2 className="section-title">🔌 所有工具</h2>
              <PluginList plugins={plugins} onSelect={handlePluginSelect} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
