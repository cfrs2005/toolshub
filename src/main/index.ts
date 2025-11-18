import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { PluginLoader } from './plugin-loader';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { Innertube } from 'youtubei.js';

let mainWindow: BrowserWindow | null = null;
let pluginLoader: PluginLoader;

// 日志文件路径
const logDir = path.join(app.getPath('userData'), 'logs');
const logFile = path.join(logDir, `youtube-${new Date().toISOString().split('T')[0]}.log`);

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志函数
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

// 启动时打印日志文件位置
console.log(`\n========================================`);
console.log(`日志文件位置: ${logFile}`);
console.log(`========================================\n`);

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
  // 开发环境从源代码目录加载插件，生产环境从用户数据目录加载
  const pluginsDir = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../../src/plugins')
    : path.join(app.getPath('userData'), 'plugins');

  pluginLoader = new PluginLoader(pluginsDir);
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
ipcMain.handle('get-plugins', async (_event: IpcMainInvokeEvent) => {
  return pluginLoader.getPlugins();
});

// 获取单个插件信息
ipcMain.handle('get-plugin', async (_event: IpcMainInvokeEvent, pluginId: string) => {
  return pluginLoader.getPlugin(pluginId);
});

// 激活插件
ipcMain.handle('activate-plugin', async (_event: IpcMainInvokeEvent, pluginId: string) => {
  return pluginLoader.activatePlugin(pluginId);
});

// 停用插件
ipcMain.handle('deactivate-plugin', async (_event: IpcMainInvokeEvent, pluginId: string) => {
  return pluginLoader.deactivatePlugin(pluginId);
});

// 插件存储操作
ipcMain.handle('plugin-storage-get', async (_event: IpcMainInvokeEvent, pluginId: string, key: string) => {
  return pluginLoader.getPluginStorage(pluginId, key);
});

ipcMain.handle('plugin-storage-set', async (_event: IpcMainInvokeEvent, pluginId: string, key: string, value: any) => {
  return pluginLoader.setPluginStorage(pluginId, key, value);
});

ipcMain.handle('plugin-storage-delete', async (_event: IpcMainInvokeEvent, pluginId: string, key: string) => {
  return pluginLoader.deletePluginStorage(pluginId, key);
});

ipcMain.handle('plugin-storage-clear', async (_event: IpcMainInvokeEvent, pluginId: string) => {
  return pluginLoader.clearPluginStorage(pluginId);
});

ipcMain.handle('plugin-storage-has', async (_event: IpcMainInvokeEvent, pluginId: string, key: string) => {
  return pluginLoader.hasPluginStorage(pluginId, key);
});

ipcMain.handle('plugin-storage-keys', async (_event: IpcMainInvokeEvent, pluginId: string) => {
  return pluginLoader.getPluginStorageKeys(pluginId);
});

// YouTube 字幕获取（支持代理）
ipcMain.handle('youtube-fetch-transcript', async (_event: IpcMainInvokeEvent, videoId: string, proxyUrl?: string) => {
  log(`========== YouTube 字幕获取请求 ==========`);
  log(`视频ID: ${videoId}`);
  log(`代理地址: ${proxyUrl || '未配置'}`);

  // 添加整体超时保护（60秒）
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      log(`[ERROR] 请求超时（60秒）`);
      reject(new Error('请求超时：无法连接到 YouTube。请检查网络连接和代理配置。'));
    }, 60000);
  });

  const fetchPromise = (async () => {
    try {
      log(`[YouTube] 开始获取字幕，视频ID: ${videoId}`);
      if (proxyUrl) {
        log(`[YouTube] 使用代理: ${proxyUrl}`);
      }

      // 动态导入 youtubei.js (ES Module)
      log(`[YouTube] 动态导入 youtubei.js...`);
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const { Innertube } = await dynamicImport('youtubei.js');
      log(`[YouTube] youtubei.js 导入成功`);

      // 配置选项
      const options: any = {};

      // 如果提供了代理，配置自定义 fetch
      if (proxyUrl) {
        log(`[YouTube] 配置代理: ${proxyUrl}`);
        const httpsAgent = new HttpsProxyAgent(proxyUrl);

        // 自定义 fetch 函数来支持代理
        options.fetch = async (input: any, init: any = {}) => {
          try {
            // 处理 input 参数，可能是 string、URL 或 Request 对象
            let url: string;
            let requestInit = init;

            if (typeof input === 'string') {
              url = input;
            } else if (input instanceof URL) {
              url = input.toString();
            } else if (input && typeof input === 'object' && 'url' in input) {
              // Request 对象
              url = input.url;
              requestInit = {
                method: input.method || init.method || 'GET',
                headers: input.headers || init.headers || {},
                body: input.body || init.body,
                ...init,
              };
            } else {
              url = String(input);
            }

            log(`[YouTube] Fetching: ${url}`);

            const response = await axios({
              url,
              method: requestInit.method || 'GET',
              headers: requestInit.headers || {},
              data: requestInit.body,
              httpsAgent,
              httpAgent: httpsAgent,
              proxy: false,
              timeout: 30000,
              responseType: 'arraybuffer', // 使用 arraybuffer 以支持二进制数据
            });

            // 将 axios 响应转换为 fetch Response 格式
            const responseData = response.data;
            return {
              ok: response.status >= 200 && response.status < 300,
              status: response.status,
              statusText: response.statusText,
              headers: {
                get: (name: string) => response.headers[name.toLowerCase()],
              },
              arrayBuffer: async () => responseData,
              text: async () => {
                if (typeof responseData === 'string') return responseData;
                if (responseData instanceof ArrayBuffer) {
                  return new TextDecoder().decode(responseData);
                }
                if (Buffer.isBuffer(responseData)) {
                  return responseData.toString('utf-8');
                }
                return JSON.stringify(responseData);
              },
              json: async () => {
                if (typeof responseData === 'object' && !(responseData instanceof ArrayBuffer) && !Buffer.isBuffer(responseData)) {
                  return responseData;
                }
                const text = Buffer.isBuffer(responseData) ? responseData.toString('utf-8') : new TextDecoder().decode(responseData);
                return JSON.parse(text);
              },
            } as any;
          } catch (error: any) {
            log(`[ERROR] Fetch 失败: ${error.message}`);
            throw new Error(`Fetch failed: ${error.message}`);
          }
        };
      }

      // 创建 Innertube 实例
      log(`[YouTube] 初始化 Innertube...`);
      const youtube = await Innertube.create(options);
      log(`[YouTube] Innertube 初始化成功`);

      // 获取视频信息
      log(`[YouTube] 获取视频信息...`);
      const info = await youtube.getInfo(videoId);
      log(`[YouTube] 视频信息获取成功`);

      log(`[YouTube] 获取字幕内容...`);
      // 直接从 info 对象获取字幕
      const transcriptInfo = await info.getTranscript();
      log(`[YouTube] 字幕内容获取成功`);

      if (!transcriptInfo || !transcriptInfo.transcript || !transcriptInfo.transcript.content) {
        throw new Error('该视频没有可用的字幕');
      }

      const body = transcriptInfo.transcript.content.body;
      if (!body || !body.initial_segments) {
        throw new Error('字幕数据格式错误');
      }

      // 转换为统一格式
      const transcriptItems = body.initial_segments
        .filter((segment: any) => segment.type === 'TranscriptSegment')
        .map((segment: any) => ({
          text: segment.snippet?.toString() || '',
          offset: parseInt(segment.start_ms) || 0,
          duration: (parseInt(segment.end_ms) || 0) - (parseInt(segment.start_ms) || 0),
        }));

      log(`[YouTube] 成功获取字幕，共 ${transcriptItems.length} 条`);
      log(`========== 请求完成 ==========`);
      return transcriptItems;
    } catch (error: any) {
      log(`[ERROR] 获取字幕失败: ${error.message}`);
      log(`[ERROR] 错误堆栈: ${error.stack}`);
      throw error;
    }
  })();

  // 使用 Promise.race 实现超时
  try {
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    return result;
  } catch (error: any) {
    log(`[ERROR] Promise.race 捕获错误: ${error.message}`);
    throw error;
  }
});
