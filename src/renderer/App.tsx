import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '../shared/types';
import type { HistoryItem } from './types/history';
import Sidebar from './components/Sidebar';
import HistoryGrid from './components/HistoryGrid';
import Workspace from './components/Workspace';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<'welcome' | 'new' | 'history'>('welcome');
  const [showSettings, setShowSettings] = useState(false);

  // 加载插件
  useEffect(() => {
    loadPlugins();
    loadAllHistory();
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

  // 加载所有历史记录
  const loadAllHistory = async () => {
    try {
      // 从全局存储加载历史
      const globalHistory = await window.electronAPI.pluginStorage.get('global', 'all_history');
      if (globalHistory && Array.isArray(globalHistory)) {
        // 按时间倒序排序
        const sorted = globalHistory.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp);
        setHistory(sorted);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // 保存历史记录
  const saveHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const newHistory = [newItem, ...history];
    setHistory(newHistory);

    try {
      // 保存到全局存储
      await window.electronAPI.pluginStorage.set('global', 'all_history', newHistory);
      // 同时保存到插件存储
      await window.electronAPI.pluginStorage.set(
        item.pluginId,
        `history:${newItem.id}`,
        newItem
      );
    } catch (error) {
      console.error('Failed to save history:', error);
    }

    return newItem;
  };

  // 点击工具
  const handlePluginSelect = (pluginId: string) => {
    setSelectedPluginId(pluginId);
    setSelectedHistoryId(null);
    setWorkspaceMode('new');
  };

  // 点击历史记录
  const handleHistorySelect = (historyId: string) => {
    const item = history.find(h => h.id === historyId);
    if (item) {
      setSelectedPluginId(item.pluginId);
      setSelectedHistoryId(historyId);
      setWorkspaceMode('history');
    }
  };

  const handleHomeClick = () => {
    setSelectedPluginId(null);
    setSelectedHistoryId(null);
    setWorkspaceMode('welcome');
    setShowSettings(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setSelectedPluginId(null);
    setSelectedHistoryId(null);
    setWorkspaceMode('welcome');
  };

  const handleSubmit = async (pluginId: string, input: string) => {
    console.log(`Plugin ${pluginId} received input: ${input}`);
  };

  // 获取当前选中的插件
  const getSelectedPlugin = (): PluginManifest | null => {
    if (!selectedPluginId) return null;
    return plugins.find(p => p.id === selectedPluginId) || null;
  };

  // 获取当前选中的历史记录
  const getSelectedHistoryItem = (): HistoryItem | null => {
    if (!selectedHistoryId) return null;
    return history.find(h => h.id === selectedHistoryId) || null;
  };

  if (loading) {
    return (
      <div className="app-layout">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="sidebar-container">
        <Sidebar
          plugins={plugins}
          history={history}
          selectedPluginId={selectedPluginId}
          selectedHistoryId={selectedHistoryId}
          onPluginSelect={handlePluginSelect}
          onHistorySelect={handleHistorySelect}
          onHomeClick={handleHomeClick}
          onSettingsClick={handleSettingsClick}
        />
      </div>

      <main className="main-content">
        {showSettings ? (
          <Settings plugins={plugins} />
        ) : (
          <>
            <div className="content-header">
              <h1>历史记录</h1>
              <p className="subtitle">查看和管理你的工作记录</p>
            </div>
            <HistoryGrid history={history} onCardClick={handleHistorySelect} />
          </>
        )}
      </main>

      <div className="workspace-container">
        <Workspace
          plugin={getSelectedPlugin()}
          historyItem={getSelectedHistoryItem()}
          mode={workspaceMode}
          onSubmit={handleSubmit}
          onSaveHistory={saveHistoryItem}
        />
      </div>
    </div>
  );
}

export default App;
