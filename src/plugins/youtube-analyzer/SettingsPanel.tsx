/**
 * YouTube 分析工具 - 设置面板
 */
import React, { useState, useEffect } from 'react';
import { HistoryService } from './historyService';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const config = await HistoryService.getConfig();
    setApiKey(config.apiKey);
    setProxyUrl(config.proxyUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await HistoryService.saveConfig(apiKey, proxyUrl);
      alert('配置已保存');
      onClose();
    } catch (err) {
      alert('保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚙️ 设置</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {/* API Key */}
          <div style={styles.section}>
            <label style={styles.label}>BigModel API Key *</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入 BigModel API Key"
              style={styles.input}
            />
            <p style={styles.hint}>
              获取 API Key:{' '}
              <a
                href="https://open.bigmodel.cn/"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                open.bigmodel.cn
              </a>
            </p>
          </div>

          {/* Proxy URL */}
          <div style={styles.section}>
            <label style={styles.label}>代理地址 (可选)</label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="例如: http://127.0.0.1:1087"
              style={styles.input}
            />
            <p style={styles.hint}>如需访问 YouTube,请配置代理地址(格式: http://host:port)</p>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={{ ...styles.button, ...styles.cancelButton }}>
            取消
          </button>
          <button
            onClick={handleSave}
            style={{ ...styles.button, ...styles.saveButton }}
            disabled={saving || !apiKey.trim()}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  panel: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: '1.5em',
    margin: 0,
    color: '#2c3e50',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '5px 10px',
    transition: 'color 0.3s',
  },
  content: {
    padding: '25px',
    maxHeight: 'calc(80vh - 180px)',
    overflowY: 'auto',
  },
  section: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '1em',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '1em',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  hint: {
    marginTop: '8px',
    fontSize: '0.9em',
    color: '#6c757d',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
  },
  footer: {
    display: 'flex',
    gap: '15px',
    padding: '20px 25px',
    borderTop: '1px solid #e0e0e0',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '12px 28px',
    fontSize: '1em',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  cancelButton: {
    background: '#e0e0e0',
    color: '#495057',
  },
  saveButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
};

export default SettingsPanel;
