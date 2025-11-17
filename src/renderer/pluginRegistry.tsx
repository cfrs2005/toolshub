/**
 * 插件注册表
 * 用于管理所有可用的插件组件
 */
import React from 'react';
import type { WidgetProps } from '@shared/types/plugin';

// 导入所有插件组件
import ExampleCounter from '@plugins/example-counter';
import ExampleDownloader from '@plugins/example-downloader';
import YouTubeAnalyzer from '@plugins/youtube-analyzer';

// 导入 Widget 组件
import YouTubeWidget from '@plugins/youtube-analyzer/widget';

// 插件组件映射
export const pluginComponents: Record<string, React.ComponentType> = {
  'example-counter': ExampleCounter,
  'example-downloader': ExampleDownloader,
  'youtube-analyzer': YouTubeAnalyzer,
};

// Widget 组件映射
export const widgetComponents: Record<string, React.ComponentType<WidgetProps>> = {
  'youtube-analyzer': YouTubeWidget,
};

/**
 * 根据插件 ID 获取插件组件
 */
export function getPluginComponent(pluginId: string): React.ComponentType | null {
  return pluginComponents[pluginId] || null;
}

/**
 * 根据插件 ID 获取 Widget 组件
 */
export function getWidgetComponent(pluginId: string): React.ComponentType<WidgetProps> | null {
  return widgetComponents[pluginId] || null;
}
