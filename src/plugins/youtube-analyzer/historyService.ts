/**
 * YouTube 分析历史记录管理服务
 */

import { AnalysisHistory, HistoryList, STORAGE_KEYS } from './types';
import { VideoInfo } from './youtubeService';
import { AnalysisResult } from './aiService';

const PLUGIN_ID = 'youtube-analyzer';

/**
 * 历史记录管理类
 */
export class HistoryService {
  /**
   * 保存分析记录
   */
  static async saveAnalysis(
    videoInfo: VideoInfo,
    analysisResult: AnalysisResult,
    reportHtml: string
  ): Promise<AnalysisHistory> {
    const history = await this.getHistory();

    // 创建新记录
    const newRecord: AnalysisHistory = {
      id: `${Date.now()}-${videoInfo.videoId}`,
      timestamp: Date.now(),
      videoInfo,
      analysisResult,
      reportHtml,
      thumbnailUrl: this.extractThumbnailUrl(videoInfo.videoId),
    };

    // 添加到列表开头
    history.items.unshift(newRecord);

    // 限制最大数量
    if (history.items.length > STORAGE_KEYS.MAX_HISTORY) {
      history.items = history.items.slice(0, STORAGE_KEYS.MAX_HISTORY);
    }

    history.total = history.items.length;

    // 保存到存储
    await window.electronAPI.pluginStorage.set(PLUGIN_ID, STORAGE_KEYS.HISTORY, history);

    return newRecord;
  }

  /**
   * 获取历史记录列表
   */
  static async getHistory(): Promise<HistoryList> {
    try {
      const history = await window.electronAPI.pluginStorage.get(PLUGIN_ID, STORAGE_KEYS.HISTORY);
      if (history && typeof history === 'object' && 'items' in history) {
        return history as HistoryList;
      }
    } catch (error) {
      console.error('读取历史记录失败:', error);
    }

    return { items: [], total: 0 };
  }

  /**
   * 获取单条记录
   */
  static async getRecord(id: string): Promise<AnalysisHistory | null> {
    const history = await this.getHistory();
    return history.items.find((item) => item.id === id) || null;
  }

  /**
   * 删除记录
   */
  static async deleteRecord(id: string): Promise<void> {
    const history = await this.getHistory();
    history.items = history.items.filter((item) => item.id !== id);
    history.total = history.items.length;

    await window.electronAPI.pluginStorage.set(PLUGIN_ID, STORAGE_KEYS.HISTORY, history);
  }

  /**
   * 清空所有记录
   */
  static async clearHistory(): Promise<void> {
    const emptyHistory: HistoryList = { items: [], total: 0 };
    await window.electronAPI.pluginStorage.set(PLUGIN_ID, STORAGE_KEYS.HISTORY, emptyHistory);
  }

  /**
   * 获取最近 N 条记录
   */
  static async getRecentRecords(limit: number = 5): Promise<AnalysisHistory[]> {
    const history = await this.getHistory();
    return history.items.slice(0, limit);
  }

  /**
   * 提取 YouTube 缩略图 URL
   */
  private static extractThumbnailUrl(videoId: string): string {
    // YouTube 缩略图 URL 格式
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  /**
   * 格式化时间戳
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // 小于 1 分钟
    if (diff < 60000) {
      return '刚刚';
    }

    // 小于 1 小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    }

    // 小于 1 天
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    }

    // 小于 7 天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} 天前`;
    }

    // 显示具体日期
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * 获取配置
   */
  static async getConfig(): Promise<{ apiKey: string; proxyUrl: string }> {
    try {
      // 优先从全局设置读取（新方式）
      const globalConfig = await window.electronAPI.pluginStorage.get(PLUGIN_ID, 'config');
      if (globalConfig && typeof globalConfig === 'object') {
        return {
          apiKey: (globalConfig as any).apiKey || '',
          proxyUrl: (globalConfig as any).proxyUrl || '',
        };
      }

      // 兼容旧方式（分开存储）
      const apiKey = (await window.electronAPI.pluginStorage.get(PLUGIN_ID, STORAGE_KEYS.API_KEY)) || '';
      const proxyUrl = (await window.electronAPI.pluginStorage.get(PLUGIN_ID, STORAGE_KEYS.PROXY_URL)) || '';
      return { apiKey, proxyUrl };
    } catch (error) {
      console.error('读取配置失败:', error);
      return { apiKey: '', proxyUrl: '' };
    }
  }

  /**
   * 保存配置
   */
  static async saveConfig(apiKey: string, proxyUrl: string): Promise<void> {
    await window.electronAPI.pluginStorage.set(PLUGIN_ID, STORAGE_KEYS.API_KEY, apiKey);
    await window.electronAPI.pluginStorage.set(PLUGIN_ID, STORAGE_KEYS.PROXY_URL, proxyUrl);
  }
}
