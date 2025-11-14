import React, { useEffect, useState } from 'react';
import './style.css';

/**
 * 计数器示例插件
 * 演示如何使用插件存储 API 保存和读取数据
 */
const CounterPlugin: React.FC = () => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const pluginId = 'example-counter';

  // 组件加载时从存储读取数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedCount = await window.electronAPI.pluginStorage.get(pluginId, 'count');
      const savedHistory = await window.electronAPI.pluginStorage.get(pluginId, 'history');

      if (savedCount !== undefined) setCount(savedCount);
      if (savedHistory) setHistory(savedHistory);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const handleIncrement = async () => {
    const newCount = count + 1;
    await saveCount(newCount);
    addHistory(`增加到 ${newCount}`);
  };

  const handleDecrement = async () => {
    const newCount = count - 1;
    await saveCount(newCount);
    addHistory(`减少到 ${newCount}`);
  };

  const handleReset = async () => {
    await saveCount(0);
    addHistory('重置为 0');
  };

  const saveCount = async (newCount: number) => {
    setCount(newCount);
    await window.electronAPI.pluginStorage.set(pluginId, 'count', newCount);
  };

  const addHistory = async (action: string) => {
    const timestamp = new Date().toLocaleString('zh-CN');
    const newHistory = [...history, `${timestamp}: ${action}`];
    setHistory(newHistory);
    await window.electronAPI.pluginStorage.set(pluginId, 'history', newHistory);
  };

  const clearHistory = async () => {
    setHistory([]);
    await window.electronAPI.pluginStorage.delete(pluginId, 'history');
  };

  return (
    <div className="counter-plugin">
      <div className="counter-display">
        <h1 className="counter-value">{count}</h1>
        <p className="counter-label">当前计数</p>
      </div>

      <div className="counter-controls">
        <button className="btn btn-primary" onClick={handleIncrement}>
          ➕ 增加
        </button>
        <button className="btn btn-danger" onClick={handleDecrement}>
          ➖ 减少
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          🔄 重置
        </button>
      </div>

      <div className="counter-history">
        <div className="history-header">
          <h3>操作历史</h3>
          {history.length > 0 && (
            <button className="btn-link" onClick={clearHistory}>
              清空历史
            </button>
          )}
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <p className="empty-message">暂无历史记录</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="history-item">
                {item}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="plugin-info">
        <p>💡 这是一个示例插件,展示如何使用 ToolsHub 的数据存储功能。</p>
        <p>你的数据会自动保存,重启应用后依然保留。</p>
      </div>
    </div>
  );
};

export default CounterPlugin;
