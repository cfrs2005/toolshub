import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '../shared/types';
import Sidebar from './components/Sidebar';
import PluginList from './components/PluginList';
import PluginView from './components/PluginView';
import PluginInteractionPanel from './components/PluginInteractionPanel';
import { getWidgetComponent } from './pluginRegistry';
import './App.css';

function App() {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [interactionPlugin, setInteractionPlugin] = useState<PluginManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'home' | 'plugin'>('home');

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
    setActiveView('plugin');

    // 同时在右侧面板显示交互界面
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin) {
      setInteractionPlugin(plugin);
    }
  };

  const handleBackToHome = () => {
    setSelectedPlugin(null);
    setActiveView('home');
  };

  const handleInteractionClose = () => {
    setInteractionPlugin(null);
  };

  const handleInteractionSubmit = (pluginId: string, input: string) => {
    // 处理交互输入
    console.log(`Plugin ${pluginId} received input: ${input}`);
    // 这里可以根据不同插件处理不同的逻辑
  };

  if (loading) {
    return (
      <div className="app-layout">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载工具中...</p>
        </div>
      </div>
    );
  }

  // 获取有 widget 的插件
  const pluginsWithWidgets = plugins.filter((p) => p.widget && getWidgetComponent(p.id));
  const hasWidgets = pluginsWithWidgets.length > 0;

  return (
    <div className="app-layout">
      {/* 左侧导航 */}
      <div className="sidebar-container">
        <Sidebar
          plugins={plugins}
          selectedPlugin={selectedPlugin}
          onPluginSelect={handlePluginSelect}
          activeView={activeView}
          onHomeClick={handleBackToHome}
        />
      </div>

      {/* 中间主内容区 */}
      <main className="main-content">
        {activeView === 'plugin' && selectedPlugin ? (
          <PluginView pluginId={selectedPlugin} onBack={handleBackToHome} />
        ) : (
          <>
            {/* 头部 */}
            <header className="content-header">
              <h1>欢迎使用 ToolsHub</h1>
              <p className="subtitle">跨平台工具集</p>
            </header>

            {plugins.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
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
          </>
        )}
      </main>

      {/* 右侧交互区 */}
      <div className={`interaction-container ${interactionPlugin ? 'active' : ''}`}>
        <PluginInteractionPanel
          plugin={interactionPlugin}
          onClose={handleInteractionClose}
          onSubmit={handleInteractionSubmit}
        />
      </div>
    </div>
  );
}

export default App;
