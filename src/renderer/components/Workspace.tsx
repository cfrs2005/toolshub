import React, { useState, useEffect, useRef } from 'react';
import type { PluginManifest } from '../../shared/types';
import type { HistoryItem, InteractionMessage } from '../types/history';
import { getPluginComponent } from '../pluginRegistry';
import './Workspace.css';

interface WorkspaceProps {
  plugin: PluginManifest | null;
  historyItem: HistoryItem | null;
  mode: 'welcome' | 'new' | 'history';
  onSubmit: (pluginId: string, input: string) => void;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  plugin,
  historyItem,
  mode,
  onSubmit,
  onSaveHistory,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<InteractionMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载历史消息
  useEffect(() => {
    if (mode === 'history' && historyItem) {
      // 从历史记录重建消息
      setMessages([
        {
          id: '1',
          type: 'user',
          content: historyItem.summary || '查看历史记录',
          timestamp: historyItem.timestamp,
        },
        {
          id: '2',
          type: 'success',
          content: '分析完成',
          timestamp: historyItem.timestamp,
          metadata: { result: historyItem.result },
        },
      ]);
    } else if (mode === 'new' && plugin) {
      // 新任务时加载历史消息
      loadHistoryMessages(plugin.id);
    } else {
      setMessages([]);
    }
  }, [mode, historyItem, plugin]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistoryMessages = async (pluginId: string) => {
    try {
      const history = await window.electronAPI.pluginStorage.get(pluginId, 'interaction_history');
      if (history && Array.isArray(history)) {
        setMessages(history.slice(-50)); // 只保留最近 50 条
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveMessages = async (pluginId: string, newMessages: InteractionMessage[]) => {
    try {
      await window.electronAPI.pluginStorage.set(pluginId, 'interaction_history', newMessages);
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || !plugin || isProcessing) return;

    const userMessage: InteractionMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsProcessing(true);

    // 添加处理中消息
    const processingMessage: InteractionMessage = {
      id: (Date.now() + 1).toString(),
      type: 'progress',
      content: '正在处理...',
      timestamp: Date.now(),
      metadata: { progress: 0 },
    };
    setMessages([...newMessages, processingMessage]);

    // 保存消息历史
    await saveMessages(plugin.id, [...newMessages, processingMessage]);

    // 调用父组件的提交处理
    onSubmit(plugin.id, inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getPlaceholder = () => {
    if (!plugin) return '';
    switch (plugin.id) {
      case 'youtube-analyzer':
        return '请输入 YouTube 视频链接...';
      case 'example-downloader':
        return '请输入下载链接...';
      default:
        return `请输入内容与 ${plugin.name} 交互...`;
    }
  };

  // 欢迎界面
  if (mode === 'welcome' || !plugin) {
    return (
      <div className="workspace">
        <div className="workspace-welcome">
          <div className="welcome-icon">⚡</div>
          <h2>欢迎使用 ToolsHub</h2>
          <p>选择左侧的工具开始使用</p>
          <div className="welcome-tips">
            <div className="tip">
              <span className="tip-icon">🎬</span>
              <span>YouTube 视频分析</span>
            </div>
            <div className="tip">
              <span className="tip-icon">📥</span>
              <span>文件下载器</span>
            </div>
            <div className="tip">
              <span className="tip-icon">🔢</span>
              <span>计数器工具</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 获取插件组件
  const PluginComponent = getPluginComponent(plugin.id);

  return (
    <div className="workspace">
      {/* 头部 */}
      <div className="workspace-header">
        <div className="header-info">
          <span className="header-icon">{plugin.icon || '🔧'}</span>
          <span className="header-title">{plugin.name}</span>
        </div>
        {mode === 'history' && (
          <span className="header-badge">历史记录</span>
        )}
      </div>

      {/* 内容区域 */}
      <div className="workspace-content">
        {mode === 'history' && historyItem ? (
          // 历史记录模式：直接渲染结果
          <div className="result-container">
            {historyItem.thumbnail && (
              <div className="result-thumbnail">
                <img src={historyItem.thumbnail} alt={historyItem.title} />
              </div>
            )}
            <h3 className="result-title">{historyItem.title}</h3>
            {historyItem.result && (
              <div className="result-content">
                {renderResult(historyItem.result, plugin.id)}
              </div>
            )}
          </div>
        ) : (
          // 新任务模式：显示消息历史
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.type}`}>
                <div className="message-content">
                  {msg.type === 'progress' ? (
                    <>
                      <span>{msg.content}</span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${msg.metadata?.progress || 0}%` }}
                        />
                      </div>
                    </>
                  ) : msg.metadata?.result ? (
                    renderResult(msg.metadata.result, plugin.id)
                  ) : (
                    msg.content
                  )}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="workspace-input">
        <div className="input-hint">Drop an idea, let's shape it together</div>
        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={isProcessing}
            rows={3}
          />
          <button
            className="send-button"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isProcessing}
          >
            <span>↑</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 渲染结果内容
function renderResult(result: any, pluginId: string) {
  if (!result) return null;

  // YouTube 分析结果
  if (pluginId === 'youtube-analyzer' && result.analysis) {
    return (
      <div className="youtube-result">
        {result.title && <h4>{result.title}</h4>}
        {result.channelName && (
          <div className="result-meta">
            <span>{result.channelName}</span>
            {result.viewCount && <span>{formatNumber(result.viewCount)} 次观看</span>}
          </div>
        )}
        <div className="analysis-content">
          {result.analysis.split('\n').map((line: string, i: number) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  // 通用结果渲染
  if (typeof result === 'string') {
    return <div className="text-result">{result}</div>;
  }

  return (
    <pre className="json-result">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default Workspace;
