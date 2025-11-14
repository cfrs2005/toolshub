import * as fs from 'fs';
import * as path from 'path';
import type { PluginManifest } from '../shared/types';
import Store from 'electron-store';

interface PluginEntry {
  manifest: PluginManifest;
  active: boolean;
  store: Store;
}

/**
 * 插件加载器
 * 负责插件的发现、加载、激活、停用和存储管理
 */
export class PluginLoader {
  private plugins: Map<string, PluginEntry> = new Map();
  private pluginsDir: string;

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
    this.ensurePluginsDirectory();
  }

  /**
   * 确保插件目录存在
   */
  private ensurePluginsDirectory() {
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  /**
   * 加载所有插件
   */
  async loadPlugins(): Promise<void> {
    console.log('[PluginLoader] Loading plugins from:', this.pluginsDir);

    const entries = fs.readdirSync(this.pluginsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const pluginPath = path.join(this.pluginsDir, entry.name);
      await this.loadPlugin(pluginPath);
    }

    console.log(`[PluginLoader] Loaded ${this.plugins.size} plugins`);
  }

  /**
   * 加载单个插件
   */
  private async loadPlugin(pluginPath: string): Promise<void> {
    try {
      const manifestPath = path.join(pluginPath, 'manifest.json');

      if (!fs.existsSync(manifestPath)) {
        console.warn(`[PluginLoader] No manifest.json found in ${pluginPath}`);
        return;
      }

      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(manifestContent);

      // 验证必需字段
      if (!this.validateManifest(manifest)) {
        console.error(`[PluginLoader] Invalid manifest in ${pluginPath}`);
        return;
      }

      // 创建插件专用存储
      const store = new Store({
        name: `plugin-${manifest.id}`,
        cwd: path.join(this.pluginsDir, manifest.id),
      });

      this.plugins.set(manifest.id, {
        manifest,
        active: false,
        store,
      });

      console.log(`[PluginLoader] Loaded plugin: ${manifest.name} (${manifest.id})`);
    } catch (error) {
      console.error(`[PluginLoader] Failed to load plugin from ${pluginPath}:`, error);
    }
  }

  /**
   * 验证插件清单
   */
  private validateManifest(manifest: any): manifest is PluginManifest {
    return (
      manifest &&
      typeof manifest.id === 'string' &&
      typeof manifest.name === 'string' &&
      typeof manifest.version === 'string' &&
      typeof manifest.entry === 'string'
    );
  }

  /**
   * 卸载所有插件
   */
  async unloadPlugins(): Promise<void> {
    for (const [pluginId, entry] of this.plugins.entries()) {
      if (entry.active) {
        await this.deactivatePlugin(pluginId);
      }
    }
    this.plugins.clear();
  }

  /**
   * 激活插件
   */
  async activatePlugin(pluginId: string): Promise<boolean> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      console.error(`[PluginLoader] Plugin not found: ${pluginId}`);
      return false;
    }

    if (entry.active) {
      console.warn(`[PluginLoader] Plugin already active: ${pluginId}`);
      return true;
    }

    try {
      entry.active = true;
      console.log(`[PluginLoader] Activated plugin: ${entry.manifest.name}`);
      return true;
    } catch (error) {
      console.error(`[PluginLoader] Failed to activate plugin ${pluginId}:`, error);
      entry.active = false;
      return false;
    }
  }

  /**
   * 停用插件
   */
  async deactivatePlugin(pluginId: string): Promise<boolean> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      console.error(`[PluginLoader] Plugin not found: ${pluginId}`);
      return false;
    }

    if (!entry.active) {
      console.warn(`[PluginLoader] Plugin not active: ${pluginId}`);
      return true;
    }

    try {
      entry.active = false;
      console.log(`[PluginLoader] Deactivated plugin: ${entry.manifest.name}`);
      return true;
    } catch (error) {
      console.error(`[PluginLoader] Failed to deactivate plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * 获取所有插件清单
   */
  getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((entry) => entry.manifest);
  }

  /**
   * 获取单个插件清单
   */
  getPlugin(pluginId: string): PluginManifest | null {
    const entry = this.plugins.get(pluginId);
    return entry ? entry.manifest : null;
  }

  /**
   * 插件存储操作
   */
  getPluginStorage(pluginId: string, key: string): any {
    const entry = this.plugins.get(pluginId);
    return entry ? entry.store.get(key) : undefined;
  }

  setPluginStorage(pluginId: string, key: string, value: any): void {
    const entry = this.plugins.get(pluginId);
    if (entry) {
      entry.store.set(key, value);
    }
  }

  deletePluginStorage(pluginId: string, key: string): void {
    const entry = this.plugins.get(pluginId);
    if (entry) {
      entry.store.delete(key);
    }
  }

  clearPluginStorage(pluginId: string): void {
    const entry = this.plugins.get(pluginId);
    if (entry) {
      entry.store.clear();
    }
  }

  hasPluginStorage(pluginId: string, key: string): boolean {
    const entry = this.plugins.get(pluginId);
    return entry ? entry.store.has(key) : false;
  }

  getPluginStorageKeys(pluginId: string): string[] {
    const entry = this.plugins.get(pluginId);
    if (!entry) return [];

    const store = entry.store.store;
    return Object.keys(store);
  }
}
