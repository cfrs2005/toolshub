/**
 * 插件注册表生成脚本
 * 扫描 src/plugins/ 目录，自动生成 pluginRegistry.tsx
 *
 * 使用方式: npx ts-node scripts/generate-plugin-registry.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  entry: string;
  widget?: string;
  widgetStyle?: string;
  type?: string;
  [key: string]: any;
}

interface PluginInfo {
  id: string;
  manifest: PluginManifest;
  hasWidget: boolean;
}

// ESM 兼容的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLUGINS_DIR = path.resolve(__dirname, '../src/plugins');
const OUTPUT_FILE = path.resolve(__dirname, '../src/renderer/pluginRegistry.tsx');

/**
 * 扫描插件目录，收集插件信息
 */
function scanPlugins(): PluginInfo[] {
  const plugins: PluginInfo[] = [];

  if (!fs.existsSync(PLUGINS_DIR)) {
    console.warn(`[PluginRegistry] Plugins directory not found: ${PLUGINS_DIR}`);
    return plugins;
  }

  const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginPath = path.join(PLUGINS_DIR, entry.name);
    const manifestPath = path.join(pluginPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      console.warn(`[PluginRegistry] No manifest.json found in ${entry.name}, skipping`);
      continue;
    }

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(manifestContent);

      // 验证必需字段
      if (!manifest.id || !manifest.name || !manifest.version || !manifest.entry) {
        console.warn(`[PluginRegistry] Invalid manifest in ${entry.name}, skipping`);
        continue;
      }

      // 检查是否有 widget
      const hasWidget = !!manifest.widget;

      plugins.push({
        id: manifest.id,
        manifest,
        hasWidget,
      });

      console.log(`[PluginRegistry] Found plugin: ${manifest.name} (${manifest.id})`);
    } catch (error) {
      console.error(`[PluginRegistry] Failed to parse manifest in ${entry.name}:`, error);
    }
  }

  return plugins;
}

/**
 * 生成 pluginRegistry.tsx 文件内容
 */
function generateRegistryContent(plugins: PluginInfo[]): string {
  const pluginsWithWidgets = plugins.filter(p => p.hasWidget);

  // 生成导入语句
  const imports = plugins.map(p =>
    `import ${toPascalCase(p.id)} from '@plugins/${p.id}';`
  ).join('\n');

  // 生成 widget 导入语句
  const widgetImports = pluginsWithWidgets.map(p => {
    const widgetFile = p.manifest.widget?.replace(/\.tsx?$/, '') || 'widget';
    return `import ${toPascalCase(p.id)}Widget from '@plugins/${p.id}/${widgetFile}';`;
  }).join('\n');

  // 生成插件组件映射
  const pluginComponents = plugins.map(p =>
    `  '${p.id}': ${toPascalCase(p.id)},`
  ).join('\n');

  // 生成 widget 组件映射
  const widgetComponents = pluginsWithWidgets.map(p =>
    `  '${p.id}': ${toPascalCase(p.id)}Widget,`
  ).join('\n');

  return `/**
 * 插件注册表
 *
 * ⚠️ 此文件由脚本自动生成，请勿手动修改
 * 运行 npm run generate:plugins 重新生成
 *
 * 生成时间: ${new Date().toISOString()}
 */
import React from 'react';
import type { WidgetProps } from '@shared/types/plugin';

// 导入所有插件组件
${imports}

${widgetImports ? `// 导入 Widget 组件\n${widgetImports}\n` : ''}
// 插件组件映射
export const pluginComponents: Record<string, React.ComponentType> = {
${pluginComponents}
};

// Widget 组件映射
export const widgetComponents: Record<string, React.ComponentType<WidgetProps>> = {
${widgetComponents || '  // 暂无 widget 组件'}
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
`;
}

/**
 * 将 kebab-case 转换为 PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * 主函数
 */
function main() {
  console.log('[PluginRegistry] Scanning plugins directory...');

  const plugins = scanPlugins();

  if (plugins.length === 0) {
    console.warn('[PluginRegistry] No plugins found, generating empty registry');
  }

  const content = generateRegistryContent(plugins);

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(`[PluginRegistry] Generated ${OUTPUT_FILE}`);
  console.log(`[PluginRegistry] Registered ${plugins.length} plugin(s)`);
}

main();
