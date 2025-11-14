import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { PluginLoader } from './plugin-loader';

let mainWindow: BrowserWindow | null = null;
let pluginLoader: PluginLoader;

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'ToolsHub',
  });

  // 开发环境加载 Vite 服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 应用启动
 */
app.whenReady().then(async () => {
  // 初始化插件加载器
  pluginLoader = new PluginLoader(path.join(app.getPath('userData'), 'plugins'));
  await pluginLoader.loadPlugins();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * 所有窗口关闭时退出应用 (macOS 除外)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用退出前清理
 */
app.on('before-quit', async () => {
  if (pluginLoader) {
    await pluginLoader.unloadPlugins();
  }
});

/**
 * IPC 通信处理
 */

// 获取所有插件列表
ipcMain.handle('get-plugins', async () => {
  return pluginLoader.getPlugins();
});

// 获取单个插件信息
ipcMain.handle('get-plugin', async (_, pluginId: string) => {
  return pluginLoader.getPlugin(pluginId);
});

// 激活插件
ipcMain.handle('activate-plugin', async (_, pluginId: string) => {
  return pluginLoader.activatePlugin(pluginId);
});

// 停用插件
ipcMain.handle('deactivate-plugin', async (_, pluginId: string) => {
  return pluginLoader.deactivatePlugin(pluginId);
});

// 插件存储操作
ipcMain.handle('plugin-storage-get', async (_, pluginId: string, key: string) => {
  return pluginLoader.getPluginStorage(pluginId, key);
});

ipcMain.handle('plugin-storage-set', async (_, pluginId: string, key: string, value: any) => {
  return pluginLoader.setPluginStorage(pluginId, key, value);
});

ipcMain.handle('plugin-storage-delete', async (_, pluginId: string, key: string) => {
  return pluginLoader.deletePluginStorage(pluginId, key);
});

ipcMain.handle('plugin-storage-clear', async (_, pluginId: string) => {
  return pluginLoader.clearPluginStorage(pluginId);
});

ipcMain.handle('plugin-storage-has', async (_, pluginId: string, key: string) => {
  return pluginLoader.hasPluginStorage(pluginId, key);
});

ipcMain.handle('plugin-storage-keys', async (_, pluginId: string) => {
  return pluginLoader.getPluginStorageKeys(pluginId);
});
