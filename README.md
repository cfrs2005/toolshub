# 🔧 ToolsHub

**ToolsHub** 是一个跨平台的工具集框架,基于 Electron + React + TypeScript 构建。它提供了一个插件化的架构,让你可以轻松添加各种独立的工具应用。

## ✨ 特性

- 🚀 **跨平台** - 支持 macOS 和 Windows
- 🔌 **插件化** - 每个工具都是独立的插件,可插拔
- 💾 **独立存储** - 每个插件拥有独立的数据存储空间
- 🎨 **现代 UI** - 基于 React 的现代化界面
- 📦 **易于扩展** - 遵循准入规则即可添加新工具
- 🔒 **安全隔离** - 插件运行在受控环境中

## 🏗️ 技术栈

- **Electron** - 跨平台桌面应用框架
- **React** - UI 组件库
- **TypeScript** - 类型安全
- **Vite** - 快速的构建工具
- **electron-builder** - 应用打包工具

## 📦 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将同时启动 Vite 开发服务器和 Electron 应用。

### 构建应用

```bash
# 构建项目
npm run build

# 打包为 macOS 应用
npm run package:mac

# 打包为 Windows 应用
npm run package:win
```

## 📁 项目结构

```
toolshub/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.ts          # 主进程入口
│   │   ├── plugin-loader.ts  # 插件加载器
│   │   └── preload.ts        # 预加载脚本
│   ├── renderer/             # React 渲染进程
│   │   ├── App.tsx           # 应用主组件
│   │   ├── components/       # UI 组件
│   │   └── index.tsx         # 渲染进程入口
│   ├── shared/               # 共享代码
│   │   └── types/            # TypeScript 类型定义
│   └── plugins/              # 示例插件
│       ├── example-counter/  # 计数器示例
│       └── example-downloader/ # 下载工具示例
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置
├── electron-builder.json     # 打包配置
├── PLUGIN_GUIDE.md           # 插件开发指南
└── README.md                 # 本文件
```

## 🔌 插件开发

### 创建新插件

1. 在用户数据目录的 `plugins` 文件夹中创建新目录:
   - **macOS**: `~/Library/Application Support/ToolsHub/plugins/`
   - **Windows**: `%APPDATA%/ToolsHub/plugins/`

2. 创建 `manifest.json` 文件:

```json
{
  "id": "my-tool",
  "name": "我的工具",
  "version": "1.0.0",
  "description": "工具描述",
  "author": "你的名字",
  "icon": "🔧",
  "entry": "index.tsx",
  "type": "tool",
  "permissions": []
}
```

3. 创建 `index.tsx` 入口文件:

```tsx
import React from 'react';

const MyTool: React.FC = () => {
  return (
    <div>
      <h1>我的工具</h1>
      <p>这是一个示例工具</p>
    </div>
  );
};

export default MyTool;
```

4. 重启 ToolsHub,你的插件将自动出现在首页

### 详细文档

查看 [插件开发指南](./PLUGIN_GUIDE.md) 了解更多信息。

## 🎯 内置示例插件

### 1. 计数器 (example-counter)

一个简单的计数器工具,演示了:
- 如何使用插件存储 API
- 数据持久化
- 基本的 UI 交互

### 2. 文件下载器 (example-downloader)

一个文件下载工具,演示了:
- 复杂的 UI 设计
- 任务管理
- 进度显示

## 🛠️ 可扩展的工具类型

你可以基于这个框架开发各种类型的工具:

- 📥 **下载工具** - HTTP/FTP 下载器
- 📊 **数据分析** - CSV/Excel 数据分析
- 📄 **报告查看器** - HTML/PDF 报告展示
- 🔍 **深度检索** - 文件内容搜索
- 🌐 **API 调试** - REST API 测试工具
- 📝 **文本处理** - 文本转换、格式化
- 🎨 **图片处理** - 图片压缩、格式转换
- 💻 **代码工具** - 代码格式化、对比
- ...更多可能

## 📋 插件准入规则

要添加新插件到 ToolsHub,需要满足以下条件:

1. ✅ 完整的 `manifest.json` 配置
2. ✅ 有效的入口文件
3. ✅ 正确的插件类型声明
4. ✅ 声明所需权限
5. ✅ 符合安全规范

详见 [插件开发指南](./PLUGIN_GUIDE.md)。

## 🔐 安全性

- 插件运行在受控的上下文中
- 需要显式声明所需权限
- 使用 Electron 的 contextBridge 进行安全通信
- 独立的数据存储,避免冲突

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🙋 FAQ

### 如何调试插件?

在开发模式下 (`npm run dev`),会自动打开 Chrome DevTools。

### 插件数据存储在哪里?

每个插件的数据存储在用户数据目录下:
- macOS: `~/Library/Application Support/ToolsHub/plugins/{plugin-id}/`
- Windows: `%APPDATA%/ToolsHub/plugins/{plugin-id}/`

### 可以使用第三方 npm 包吗?

可以!在插件目录中创建 `package.json` 并安装依赖即可。

### 如何分发我的插件?

打包插件目录为 zip 文件,用户解压到插件目录即可使用。

---

**Built with ❤️ using Electron + React + TypeScript**
