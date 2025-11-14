import React, { useState } from 'react';
import './style.css';

interface DownloadTask {
  id: string;
  url: string;
  filename: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

/**
 * 文件下载器示例插件
 * 演示如何构建一个实用的工具
 */
const DownloaderPlugin: React.FC = () => {
  const [url, setUrl] = useState('');
  const [tasks, setTasks] = useState<DownloadTask[]>([]);

  const handleAddTask = () => {
    if (!url.trim()) return;

    // 提取文件名
    const filename = url.split('/').pop() || 'download';

    const newTask: DownloadTask = {
      id: Date.now().toString(),
      url,
      filename,
      status: 'pending',
      progress: 0,
    };

    setTasks([...tasks, newTask]);
    setUrl('');

    // 模拟下载
    simulateDownload(newTask.id);
  };

  const simulateDownload = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: 'downloading' as const } : task
      )
    );

    // 模拟进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;

      if (progress >= 100) {
        clearInterval(interval);
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, status: 'completed' as const, progress: 100 }
              : task
          )
        );
      } else {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, progress: Math.min(progress, 100) } : task
          )
        );
      }
    }, 500);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const getStatusText = (status: DownloadTask['status']) => {
    const statusMap = {
      pending: '等待中',
      downloading: '下载中',
      completed: '已完成',
      error: '下载失败',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: DownloadTask['status']) => {
    const colorMap = {
      pending: '#ffa726',
      downloading: '#2196f3',
      completed: '#4caf50',
      error: '#f44336',
    };
    return colorMap[status];
  };

  return (
    <div className="downloader-plugin">
      <div className="download-input-section">
        <h2>📥 文件下载器</h2>
        <p className="subtitle">输入文件链接开始下载</p>

        <div className="input-group">
          <input
            type="text"
            className="url-input"
            placeholder="输入文件 URL (http:// 或 https://)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <button className="add-button" onClick={handleAddTask} disabled={!url.trim()}>
            添加任务
          </button>
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h3>下载任务</h3>
          <span className="task-count">{tasks.length} 个任务</span>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>暂无下载任务</p>
            <small>输入 URL 添加下载任务</small>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-header">
                  <div className="task-info">
                    <div className="task-filename">{task.filename}</div>
                    <div className="task-url">{task.url}</div>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveTask(task.id)}
                  >
                    ✕
                  </button>
                </div>

                <div className="task-progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${task.progress}%`,
                      backgroundColor: getStatusColor(task.status),
                    }}
                  />
                </div>

                <div className="task-footer">
                  <span
                    className="task-status"
                    style={{ color: getStatusColor(task.status) }}
                  >
                    {getStatusText(task.status)}
                  </span>
                  <span className="task-progress-text">{task.progress.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="plugin-info">
        <p>💡 这是一个示例插件,展示了下载工具的界面设计。</p>
        <p>实际使用时需要实现真实的下载逻辑和文件保存功能。</p>
      </div>
    </div>
  );
};

export default DownloaderPlugin;
