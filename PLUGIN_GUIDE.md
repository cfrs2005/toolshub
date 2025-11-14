# ToolsHub 插件开发指南

本指南详细说明如何为 ToolsHub 开发插件。

## 📋 目录

- [插件概述](#插件概述)
- [插件结构](#插件结构)
- [准入规则](#准入规则)
- [开发步骤](#开发步骤)
- [API 参考](#api-参考)
- [示例插件](#示例插件)

## 插件概述

ToolsHub 采用插件化架构,每个工具都是独立的插件。插件特点:

- ✅ **独立性**: 每个插件有独立的数据存储
- ✅ **隔离性**: 插件运行在独立的上下文中
- ✅ **可插拔**: 可以动态加载和卸载
- ✅ **跨平台**: 自动支持 macOS/Windows

## 插件结构

每个插件必须是一个独立的目录,包含以下文件:

```
my-plugin/
├── manifest.json       # 插件清单(必需)
├── index.tsx           # 插件入口(必需)
├── package.json        # 依赖声明(可选)
└── assets/            # 资源文件(可选)
```

### manifest.json

插件清单文件定义插件的元信息:

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "插件功能描述",
  "author": "作者名",
  "icon": "🔧",
  "entry": "index.tsx",
  "type": "tool",
  "permissions": ["file-system", "network"],
  "dependencies": []
}
```

#### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 插件唯一标识,使用小写字母和连字符 |
| `name` | string | ✅ | 插件显示名称 |
| `version` | string | ✅ | 插件版本号,遵循语义化版本 |
| `description` | string | ✅ | 插件简短描述,50字以内 |
| `author` | string | ✅ | 插件作者 |
| `icon` | string | ❌ | 插件图标,可以是 emoji 或图片路径 |
| `entry` | string | ✅ | 插件入口文件路径 |
| `type` | string | ✅ | 插件类型: `tool`/`service`/`widget` |
| `permissions` | array | ❌ | 插件所需权限列表 |
| `dependencies` | array | ❌ | 依赖的其他插件 ID |

### 插件类型

- **tool**: 独立的工具应用,有完整的 UI 界面
- **service**: 后台服务,提供 API 给其他插件
- **widget**: 小组件,显示在首页或侧边栏

### 权限列表

- `file-system`: 文件系统访问权限
- `network`: 网络访问权限
- `database`: 数据库访问权限
- `clipboard`: 剪贴板访问权限
- `notifications`: 系统通知权限

## 准入规则

### 必需条件

1. ✅ **完整的 manifest.json**
   - 所有必需字段都已填写
   - ID 在系统中唯一
   - 版本号符合语义化版本规范

2. ✅ **入口文件存在**
   - entry 字段指定的文件必须存在
   - 入口文件必须导出 React 组件

3. ✅ **类型定义正确**
   - 插件类型必须是 `tool`/`service`/`widget` 之一
   - 权限列表中的权限必须是预定义的权限

4. ✅ **依赖声明完整**
   - 如果使用外部依赖,必须在 package.json 中声明
   - 依赖的其他插件必须已安装

### 推荐实践

1. 📝 **提供详细的 README**
   - 说明插件功能和使用方法
   - 列出所需权限及原因

2. 🎨 **界面设计规范**
   - 遵循 ToolsHub 的设计语言
   - 响应式布局,适配不同窗口大小

3. 💾 **数据持久化**
   - 使用提供的存储 API
   - 定期保存用户数据

4. ⚡ **性能优化**
   - 避免阻塞主进程
   - 大量数据使用虚拟滚动

5. 🔒 **安全性**
   - 验证用户输入
   - 不存储敏感信息(密码等)

## 开发步骤

### 1. 创建插件目录

```bash
mkdir -p plugins/my-plugin
cd plugins/my-plugin
```

### 2. 创建 manifest.json

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "一个示例插件",
  "author": "Your Name",
  "icon": "🔧",
  "entry": "index.tsx",
  "type": "tool",
  "permissions": []
}
```

### 3. 创建入口文件

```tsx
// index.tsx
import React, { useState } from 'react';

const MyPlugin: React.FC = () => {
  const [data, setData] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h1>我的插件</h1>
      <p>这是一个示例插件</p>
    </div>
  );
};

export default MyPlugin;
```

### 4. 测试插件

将插件目录复制到用户数据目录:

- **macOS**: `~/Library/Application Support/ToolsHub/plugins/`
- **Windows**: `%APPDATA%/ToolsHub/plugins/`

重启 ToolsHub,插件将自动加载。

## API 参考

### 存储 API

插件可以使用存储 API 保存数据:

```tsx
import React, { useEffect, useState } from 'react';

const MyPlugin: React.FC = () => {
  const [count, setCount] = useState(0);
  const pluginId = 'my-plugin';

  // 加载数据
  useEffect(() => {
    window.electronAPI.pluginStorage.get(pluginId, 'count')
      .then(value => setCount(value || 0));
  }, []);

  // 保存数据
  const handleIncrement = async () => {
    const newCount = count + 1;
    await window.electronAPI.pluginStorage.set(pluginId, 'count', newCount);
    setCount(newCount);
  };

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={handleIncrement}>增加</button>
    </div>
  );
};
```

### TypeScript 类型

```typescript
interface Window {
  electronAPI: {
    // 插件管理
    getPlugins: () => Promise<PluginManifest[]>;
    getPlugin: (pluginId: string) => Promise<PluginManifest | null>;
    activatePlugin: (pluginId: string) => Promise<boolean>;
    deactivatePlugin: (pluginId: string) => Promise<boolean>;

    // 插件存储
    pluginStorage: {
      get: (pluginId: string, key: string) => Promise<any>;
      set: (pluginId: string, key: string, value: any) => Promise<void>;
      delete: (pluginId: string, key: string) => Promise<void>;
      clear: (pluginId: string) => Promise<void>;
      has: (pluginId: string, key: string) => Promise<boolean>;
      keys: (pluginId: string) => Promise<string[]>;
    };
  };
}
```

## 示例插件

### 示例 1: 下载工具

```tsx
import React, { useState } from 'react';

const Downloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    // 下载逻辑
    setDownloading(false);
  };

  return (
    <div>
      <h2>文件下载器</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="输入下载链接"
      />
      <button onClick={handleDownload} disabled={downloading}>
        {downloading ? '下载中...' : '开始下载'}
      </button>
    </div>
  );
};

export default Downloader;
```

### 示例 2: 数据分析工具

```tsx
import React, { useState } from 'react';

const DataAnalytics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  const handleImport = async () => {
    // 导入数据逻辑
  };

  return (
    <div>
      <h2>数据分析</h2>
      <button onClick={handleImport}>导入数据</button>
      <div>
        {/* 数据可视化 */}
      </div>
    </div>
  );
};

export default DataAnalytics;
```

## 常见问题

### Q: 如何调试插件?

A: 使用 Chrome DevTools,在开发模式下会自动打开。

### Q: 插件可以访问文件系统吗?

A: 可以,但需要在 manifest.json 中声明 `file-system` 权限。

### Q: 如何在插件间通信?

A: 目前不支持插件间直接通信,可以通过共享存储实现。

### Q: 插件更新后需要重启应用吗?

A: 是的,目前需要重启 ToolsHub 来加载新版本。

## 资源

- [TypeScript 文档](https://www.typescriptlang.org/)
- [React 文档](https://react.dev/)
- [Electron 文档](https://www.electronjs.org/)

---

如有问题或建议,请提交 Issue 或 Pull Request。
