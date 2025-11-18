import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '../../shared/types';
import './Settings.css';

interface SettingsProps {
  plugins: PluginManifest[];
}

interface PluginConfig {
  [key: string]: string;
}

const Settings: React.FC<SettingsProps> = ({ plugins }) => {
  const [configs, setConfigs] = useState<Record<string, PluginConfig>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllConfigs();
  }, [plugins]);

  const loadAllConfigs = async () => {
    const allConfigs: Record<string, PluginConfig> = {};

    for (const plugin of plugins) {
      try {
        const config = await window.electronAPI.pluginStorage.get(plugin.id, 'config');
        allConfigs[plugin.id] = config || {};
      } catch (error) {
        console.error(`Failed to load config for ${plugin.id}:`, error);
        allConfigs[plugin.id] = {};
      }
    }

    setConfigs(allConfigs);
  };

  const handleConfigChange = (pluginId: string, key: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [pluginId]: {
        ...prev[pluginId],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [pluginId, config] of Object.entries(configs)) {
        await window.electronAPI.pluginStorage.set(pluginId, 'config', config);
      }
      alert('配置已保存');
    } catch (error) {
      console.error('Failed to save configs:', error);
      alert('保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  const getPluginConfigFields = (pluginId: string) => {
    switch (pluginId) {
      case 'youtube-analyzer':
        return [
          {
            key: 'apiKey',
            label: 'BigModel API Key',
            type: 'password',
            placeholder: '请输入 BigModel API Key',
            required: true,
            hint: '获取地址: https://open.bigmodel.cn/',
          },
          {
            key: 'proxyUrl',
            label: '代理地址',
            type: 'text',
            placeholder: '例如: http://127.0.0.1:1087',
            required: false,
            hint: '如需访问 YouTube，请配置代理地址',
          },
        ];
      case 'example-downloader':
        return [
          {
            key: 'downloadPath',
            label: '下载路径',
            type: 'text',
            placeholder: '例如: ~/Downloads',
            required: false,
            hint: '文件下载保存位置',
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>设置</h1>
        <p className="subtitle">配置插件和应用偏好</p>
      </div>

      <div className="settings-content">
        {/* 插件配置 */}
        <section className="settings-section">
          <h2 className="section-title">插件配置</h2>

          {plugins.map(plugin => {
            const fields = getPluginConfigFields(plugin.id);
            if (fields.length === 0) return null;

            return (
              <div key={plugin.id} className="plugin-config-card">
                <div className="plugin-config-header">
                  <span className="plugin-icon">{plugin.icon || '🔧'}</span>
                  <h3>{plugin.name}</h3>
                </div>

                <div className="plugin-config-fields">
                  {fields.map(field => (
                    <div key={field.key} className="config-field">
                      <label>
                        {field.label}
                        {field.required && <span className="required">*</span>}
                      </label>
                      <input
                        type={field.type}
                        value={configs[plugin.id]?.[field.key] || ''}
                        onChange={(e) => handleConfigChange(plugin.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                      {field.hint && <p className="field-hint">{field.hint}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <div className="settings-footer">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
