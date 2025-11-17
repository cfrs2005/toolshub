/**
 * YouTube 分析插件类型定义
 */

import { VideoInfo } from './youtubeService';
import { AnalysisResult } from './aiService';

/**
 * 分析历史记录
 */
export interface AnalysisHistory {
  /** 记录 ID */
  id: string;
  /** 分析时间戳 */
  timestamp: number;
  /** 视频信息 */
  videoInfo: VideoInfo;
  /** 分析结果 */
  analysisResult: AnalysisResult;
  /** HTML 报告 (可选,用于快速预览) */
  reportHtml?: string;
  /** 缩略图 URL (可选) */
  thumbnailUrl?: string;
}

/**
 * 历史记录列表
 */
export interface HistoryList {
  /** 记录列表 */
  items: AnalysisHistory[];
  /** 总数 */
  total: number;
}

/**
 * 历史记录存储键
 */
export const STORAGE_KEYS = {
  /** 配置相关 */
  API_KEY: 'bigmodel_api_key',
  PROXY_URL: 'proxy_url',
  /** 历史记录 */
  HISTORY: 'analysis_history',
  /** 最大历史记录数 */
  MAX_HISTORY: 50,
} as const;
