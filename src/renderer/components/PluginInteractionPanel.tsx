import React, { useState, useRef, useEffect } from 'react';
import type { PluginManifest, InteractionMessage, InteractionStatus } from '../../shared/types';
import './PluginInteractionPanel.css';

interface PluginInteractionPanelProps {
  plugin: PluginManifest | null;
  onClose: () => void;
  onSubmit?: (pluginId: string, input: string) => void;
}

const PluginInteractionPanel: React.FC<PluginInteractionPanelProps> = ({
  plugin,
  onClose,
  onSubmit,
}) => {
  const [messages, setMessages] = useState<InteractionMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<InteractionStatus>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 加载历史消息
  useEffect(() => {
    if (plugin) {
      loadHistory(plugin.id);
    }
  }, [plugin?.id]);

  const loadHistory = async (pluginId: string) => {
    try {
      const history = await window.electronAPI.pluginStorage.get(pluginId, 'interaction_history');
      if (history && Array.isArray(history)) {
        setMessages(history.slice(-50)); // 只保留最近50条
      } else {
        // 添加欢迎消息
        const welcomeMessage: InteractionMessage = {
          id: `welcome-${Date.now()}`,
          type: 'system',
          content: getWelcomeMessage(pluginId),
          timestamp: Date.now(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const getWelcomeMessage = (pluginId: string): string => {
    switch (pluginId) {
      case 'youtube-analyzer':
        return '欢迎使用 YouTube 视频分析！请输入 YouTube 视频链接开始分析。';
      case 'example-downloader':
        return '欢迎使用文件下载器！请输入下载链接开始下载。';
      default:
        return '请输入内容开始交互...';
    }
  };

  const getPlaceholder = (): string => {
    if (!plugin) return '请先选择插件...';
    switch (plugin.id) {
      case 'youtube-analyzer':
        return '输入 YouTube 视频链接...';
      case 'example-downloader':
        return '输入下载链接...';
      default:
        return '输入内容...';
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || !plugin) return;

    // 添加用户消息
    const userMessage: InteractionMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setStatus('processing');

    // 保存历史
    try {
      await window.electronAPI.pluginStorage.set(plugin.id, 'interaction_history', newMessages);
    } catch (error) {
      console.error('Failed to save history:', error);
    }

    // 调用外部处理
    if (onSubmit) {
      onSubmit(plugin.id, userMessage.content);
    }

    // 添加处理中消息
    const processingMessage: InteractionMessage = {
      id: `processing-${Date.now()}`,
      type: 'progress',
      content: '正在处理...',
      timestamp: Date.now(),
      metadata: { progress: 0 },
    };
    setMessages([...newMessages, processingMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 添加消息的公共方法 (可通过 ref 暴露)
  const addMessage = (message: InteractionMessage) => {
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.type !== 'progress');
      return [...filtered, message];
    });
  };

  if (!plugin) {
    return (
      <div className="interaction-panel">
        <div className="interaction-empty">
          <div className="empty-icon">💡</div>
          <h3>选择一个工具开始</h3>
          <p>点击左侧的工具卡片来在这里进行交互</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interaction-panel">
      {/* 头部 */}
      <div className="interaction-header">
        <div className="header-info">
          <span className="plugin-icon">{plugin.icon || '🔧'}</span>
          <span className="plugin-name">{plugin.name}</span>
        </div>
        <button className="close-btn" onClick={onClose} title="关闭">
          ×
        </button>
      </div>

      {/* 消息区域 */}
      <div className="interaction-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.type}`}>
            <div className="message-content">
              {message.type === 'user' && <span className="message-avatar">👤</span>}
              {message.type === 'system' && <span className="message-avatar">ℹ️</span>}
              {message.type === 'success' && <span className="message-avatar">✅</span>}
              {message.type === 'error' && <span className="message-avatar">❌</span>}
              {message.type === 'progress' && <span className="message-avatar">⏳</span>}
              <div className="message-text">
                <p>{message.content}</p>
                {message.metadata?.progress !== undefined && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${message.metadata.progress}%` }}
                    />
                  </div>
                )}
                {message.metadata?.actionButton && (
                  <button className="action-btn">{message.metadata.actionButton.label}</button>
                )}
              </div>
            </div>
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="interaction-input-area">
        <div className="input-hint">Drop an idea, let's shape it together</div>
        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={2}
            disabled={status === 'processing'}
          />
          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || status === 'processing'}
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default PluginInteractionPanel;
