# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

ToolsHub 是一个基于 Electron + React + TypeScript 的跨平台插件化工具集框架。核心架构采用主进程-渲染进程分离，通过 IPC 通信实现插件的动态加载和管理。

## 核心命令

### 开发
```bash
npm run dev              # 启动开发环境（并发运行主进程和渲染进程）
npm run dev:main         # 仅启动主进程
npm run dev:renderer     # 仅启动 Vite 开发服务器
npm run generate:plugins # 生成插件注册表（dev/build 时自动运行）
```

### 构建与打包
```bash
npm run build            # 构建整个项目（自动生成插件注册表）
npm run build:main       # 仅构建主进程
npm run build:renderer   # 仅构建渲染进程
npm run package:mac      # 打包 macOS 应用
npm run package:win      # 打包 Windows 应用
```

## 架构核心

### 三层架构
1. **主进程** (`src/main/`)
   - `index.ts`: Electron 主进程入口，处理窗口创建和 IPC 通信
   - `plugin-loader.ts`: 插件加载器，负责插件的发现、加载、激活和存储管理
   - `preload.ts`: 预加载脚本，通过 contextBridge 暴露安全 API

2. **渲染进程** (`src/renderer/`)
   - React 应用，负责 UI 渲染和用户交互

3. **共享层** (`src/shared/types/`)
   - `plugin.ts`: 插件相关的 TypeScript 类型定义

### 插件系统核心逻辑

**插件加载路径**:
- 开发环境: `src/plugins/`
- 生产环境: `~/Library/Application Support/ToolsHub/plugins/` (macOS) 或 `%APPDATA%/ToolsHub/plugins/` (Windows)

**插件结构**:
```
plugin-name/
├── manifest.json    # 必需：插件元数据
├── index.tsx        # 必需：React 组件入口
├── widget.tsx       # 可选：Widget 组件
└── package.json     # 可选：插件依赖
```

**manifest.json 必需字段**: `id`, `name`, `version`, `entry`, `description`, `author`

**可选字段**: `widget` (Widget 组件路径), `widgetStyle`, `icon`

**插件类型**: `tool` (独立工具) | `service` (后台服务) | `widget` (小组件)

**权限系统**: `file-system`, `network`, `database`, `clipboard`, `notifications`

**插件注册表自动生成**:
- 脚本位置: `scripts/generate-plugin-registry.ts`
- 输出文件: `src/renderer/pluginRegistry.tsx` (⚠️ 自动生成，勿手动修改)
- 运行时机: `npm run dev` 和 `npm run build` 时自动执行
- 手动生成: `npm run generate:plugins`

添加新插件后，只需在 `src/plugins/` 创建插件目录，然后运行 `npm run generate:plugins` 即可自动注册。

### IPC 通信模式

主进程通过 `ipcMain.handle()` 注册处理器，渲染进程通过 `window.electronAPI` 调用：
- 插件管理: `get-plugins`, `get-plugin`, `activate-plugin`, `deactivate-plugin`
- 插件存储: `plugin-storage-get/set/delete/clear/has/keys`

每个插件拥有独立的 electron-store 实例，存储在 `plugins/{plugin-id}/` 目录下。

### TypeScript 配置

- 路径别名: `@shared/*` → `src/shared/*`, `@plugins/*` → `src/plugins/*`
- 主进程使用 `tsconfig.main.json`，渲染进程使用 `tsconfig.json`
- 目标: ES2020, 模块解析: bundler

## 开发注意事项

1. **插件开发**: 参考 `PLUGIN_GUIDE.md` 和 `src/plugins/example-*` 示例
2. **安全隔离**: 主进程和渲染进程通过 contextBridge 通信，禁用 nodeIntegration
3. **数据持久化**: 使用 `window.electronAPI.pluginStorage` API，不要直接操作文件系统
4. **开发调试**: 开发模式自动打开 DevTools (src/main/index.ts:28)
5. **Vite 端口**: 开发服务器运行在 `http://localhost:3000`

## 关键文件路径

- 主进程入口: `src/main/index.ts`
- 插件加载器: `src/main/plugin-loader.ts`
- 插件注册表: `src/renderer/pluginRegistry.tsx` (自动生成)
- 注册表生成脚本: `scripts/generate-plugin-registry.ts`
- 类型定义: `src/shared/types/plugin.ts`
- 示例插件: `src/plugins/example-counter/`, `src/plugins/example-downloader/`, `src/plugins/youtube-analyzer/`

## 路径别名配置

路径别名在 `tsconfig.json` 和 `vite.config.ts` 中保持一致：
- `@shared/*` → `src/shared/*`
- `@plugins/*` → `src/plugins/*`

注意: vite.config.ts 使用数组格式的 alias 配置，并有注释说明与 tsconfig.json 的对应关系。
