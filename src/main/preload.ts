import { contextBridge, ipcRenderer } from 'electron';
import type { PluginManifest } from '../shared/types';

/**
 * 暴露给渲染进程的安全 API
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 插件管理
  getPlugins: (): Promise<PluginManifest[]> => ipcRenderer.invoke('get-plugins'),
  getPlugin: (pluginId: string): Promise<PluginManifest | null> =>
    ipcRenderer.invoke('get-plugin', pluginId),
  activatePlugin: (pluginId: string): Promise<boolean> =>
    ipcRenderer.invoke('activate-plugin', pluginId),
  deactivatePlugin: (pluginId: string): Promise<boolean> =>
    ipcRenderer.invoke('deactivate-plugin', pluginId),

  // 插件存储
  pluginStorage: {
    get: (pluginId: string, key: string): Promise<any> =>
      ipcRenderer.invoke('plugin-storage-get', pluginId, key),
    set: (pluginId: string, key: string, value: any): Promise<void> =>
      ipcRenderer.invoke('plugin-storage-set', pluginId, key, value),
    delete: (pluginId: string, key: string): Promise<void> =>
      ipcRenderer.invoke('plugin-storage-delete', pluginId, key),
    clear: (pluginId: string): Promise<void> =>
      ipcRenderer.invoke('plugin-storage-clear', pluginId),
    has: (pluginId: string, key: string): Promise<boolean> =>
      ipcRenderer.invoke('plugin-storage-has', pluginId, key),
    keys: (pluginId: string): Promise<string[]> =>
      ipcRenderer.invoke('plugin-storage-keys', pluginId),
  },
});

// TypeScript 类型声明
declare global {
  interface Window {
    electronAPI: {
      getPlugins: () => Promise<PluginManifest[]>;
      getPlugin: (pluginId: string) => Promise<PluginManifest | null>;
      activatePlugin: (pluginId: string) => Promise<boolean>;
      deactivatePlugin: (pluginId: string) => Promise<boolean>;
      pluginStorage: {
        get: (pluginId: string, key: string) => Promise<any>;
        set: (pluginId: string, key: string, value: any) => Promise<void>;
        delete: (pluginId: string, key: string) => Promise<void>;
        clear: (pluginId: string) => Promise<void>;
        has: (pluginId: string, key: string) => Promise<boolean>;
        keys: (pluginId: string) => Promise<string[]>;
      };
    };
  }
}
