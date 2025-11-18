/**
 * 插件注册表
 *
 * ⚠️ 此文件由脚本自动生成，请勿手动修改
 * 运行 npm run generate:plugins 重新生成
 *
 * 生成时间: 2025-11-18T12:26:26.431Z
 */
import React from 'react';
import type { WidgetProps } from '@shared/types/plugin';

// 导入所有插件组件
import ExampleCounter from '@plugins/example-counter';
import ExampleDownloader from '@plugins/example-downloader';
import YoutubeAnalyzer from '@plugins/youtube-analyzer';

// 导入 Widget 组件
import YoutubeAnalyzerWidget from '@plugins/youtube-analyzer/widget';

// 插件组件映射
export const pluginComponents: Record<string, React.ComponentType> = {
  'example-counter': ExampleCounter,
  'example-downloader': ExampleDownloader,
  'youtube-analyzer': YoutubeAnalyzer,
};

// Widget 组件映射
export const widgetComponents: Record<string, React.ComponentType<WidgetProps>> = {
  'youtube-analyzer': YoutubeAnalyzerWidget,
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

/**
 * 获取所有已注册的插件 ID
 */
export function getRegisteredPluginIds(): string[] {
  return Object.keys(pluginComponents);
}

/**
 * 检查插件是否已注册
 */
export function isPluginRegistered(pluginId: string): boolean {
  return pluginId in pluginComponents;
}
