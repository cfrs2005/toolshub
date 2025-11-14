# ToolsHub 架构设计文档

## 📐 系统架构

ToolsHub 采用经典的 Electron 双进程架构 + 插件化设计。

```
┌─────────────────────────────────────────────────────────┐
│                     ToolsHub Application                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐        ┌──────────────────┐   │
│  │   Main Process     │◄──IPC─►│ Renderer Process │   │
│  │                    │        │                  │   │
│  │  • App Lifecycle   │        │  • React UI      │   │
│  │  • Window Manager  │        │  • Plugin View   │   │
│  │  • Plugin Loader   │        │  • Home Page     │   │
│  │  • Storage Manager │        │                  │   │
│  └────────────────────┘        └──────────────────┘   │
│           │                              │              │
│           ├──────────────────────────────┘              │
│           │                                             │
│           ▼                                             │
│  ┌──────────────────────────────────────────────┐     │
│  │              Plugin System                    │     │
│  │                                               │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │     │
│  │  │ Plugin A │  │ Plugin B │  │ Plugin C │  │     │
│  │  └──────────┘  └──────────┘  └──────────┘  │     │
│  │                                               │     │
│  │  • Independent Storage                       │     │
│  │  • Isolated Execution                        │     │
│  │  • Permission Control                        │     │
│  └──────────────────────────────────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ 核心组件

### 1. 主进程 (Main Process)

位置: `src/main/`

#### 职责
- 应用生命周期管理
- 窗口创建和管理
- 插件加载和卸载
- IPC 通信处理
- 数据存储管理

#### 核心文件

**index.ts**
- 应用入口
- 窗口创建
- IPC 处理器注册

**plugin-loader.ts**
- 插件发现和加载
- 插件生命周期管理
- 插件存储隔离

**preload.ts**
- 安全的 IPC 桥接
- API 暴露给渲染进程

### 2. 渲染进程 (Renderer Process)

位置: `src/renderer/`

#### 职责
- UI 渲染
- 用户交互
- 插件展示
- 状态管理

#### 核心组件

**App.tsx**
- 应用根组件
- 路由管理
- 全局状态

**PluginList.tsx**
- 插件列表展示
- 卡片式布局
- 搜索和过滤

**PluginView.tsx**
- 插件容器
- 插件激活
- 返回导航

### 3. 插件系统

位置: `src/plugins/` (开发), 用户数据目录 (生产)

#### 插件结构

```
plugin-name/
├── manifest.json    # 插件清单
├── index.tsx        # React 组件入口
├── style.css        # 样式文件
└── package.json     # 依赖声明 (可选)
```

#### 插件生命周期

```
加载 → 激活 → 运行 → 停用 → 卸载
  ↓      ↓      ↓      ↓      ↓
发现   显示   交互   隐藏   清理
```

## 🔄 数据流

### 插件加载流程

```
1. 应用启动
   ↓
2. PluginLoader.loadPlugins()
   ↓
3. 扫描插件目录
   ↓
4. 读取 manifest.json
   ↓
5. 验证插件有效性
   ↓
6. 创建插件存储
   ↓
7. 添加到插件列表
   ↓
8. 渲染进程获取插件列表
   ↓
9. 显示在首页
```

### IPC 通信流程

```
渲染进程                     主进程
   │                          │
   │  window.electronAPI      │
   │  .getPlugins()          │
   ├─────────────────────────►│
   │                          │
   │                     处理请求
   │                          │
   │                     返回数据
   │◄─────────────────────────┤
   │                          │
   │  更新 UI 状态            │
   │                          │
```

## 💾 数据存储

### 存储架构

```
用户数据目录/
├── plugins/              # 插件目录
│   ├── plugin-a/
│   │   ├── manifest.json
│   │   ├── index.tsx
│   │   └── config.json   # electron-store 生成
│   └── plugin-b/
│       └── ...
└── app-settings.json     # 应用设置
```

### 存储隔离

每个插件有独立的存储空间:
- 使用 `electron-store`
- 数据保存在插件目录下
- 自动序列化/反序列化
- 类型安全的 API

## 🔐 安全机制

### 1. 进程隔离

- 主进程和渲染进程分离
- 禁用 nodeIntegration
- 启用 contextIsolation

### 2. 权限控制

```typescript
// 插件声明所需权限
"permissions": ["file-system", "network"]

// 框架根据权限提供对应 API
```

### 3. 安全通信

```typescript
// preload.ts 中使用 contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  // 只暴露安全的 API
});
```

## 🎨 UI 架构

### 组件层次

```
App
├── Header (首页模式)
│   ├── Logo
│   └── Title
├── PluginList (首页模式)
│   └── PluginCard[]
│       ├── Icon
│       ├── Name
│       ├── Description
│       └── Meta
└── PluginView (插件模式)
    ├── Header
    │   ├── BackButton
    │   └── Title
    └── Content
        └── DynamicPluginComponent
```

### 状态管理

使用 React Hooks 进行状态管理:

```typescript
// 全局状态
- plugins: 插件列表
- selectedPlugin: 当前选中的插件
- loading: 加载状态

// 插件状态
- 每个插件管理自己的状态
- 通过 Storage API 持久化
```

## 📦 构建和打包

### 开发模式

```
npm run dev
  │
  ├─► npm run dev:main
  │   └─► tsc -p tsconfig.main.json
  │       └─► electron .
  │
  └─► npm run dev:renderer
      └─► vite (localhost:3000)
```

### 生产构建

```
npm run build
  │
  ├─► npm run build:main
  │   └─► tsc → dist/main/
  │
  └─► npm run build:renderer
      └─► vite build → dist/renderer/
```

### 应用打包

```
npm run package
  │
  └─► electron-builder
      ├─► macOS: .dmg, .zip
      └─► Windows: .exe, .nsis
```

## 🔌 插件 API

### 存储 API

```typescript
interface PluginStorage {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
}
```

### 使用示例

```typescript
// 保存数据
await window.electronAPI.pluginStorage.set(
  'my-plugin',
  'settings',
  { theme: 'dark' }
);

// 读取数据
const settings = await window.electronAPI.pluginStorage.get(
  'my-plugin',
  'settings'
);
```

## 🚀 扩展性设计

### 1. 插件类型扩展

当前支持的类型:
- `tool`: 独立工具应用
- `service`: 后台服务
- `widget`: UI 小组件

未来可扩展:
- `theme`: 主题插件
- `language`: 语言包
- `integration`: 第三方集成

### 2. API 扩展

在 `preload.ts` 中添加新的 API:

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // 现有 API
  getPlugins: () => ipcRenderer.invoke('get-plugins'),

  // 新增 API
  openExternal: (url: string) =>
    ipcRenderer.invoke('open-external', url),
});
```

### 3. 权限系统扩展

在 `src/shared/types/plugin.ts` 中添加新权限:

```typescript
export type PluginPermission =
  | 'file-system'
  | 'network'
  | 'database'
  | 'clipboard'
  | 'notifications'
  | 'camera'        // 新增
  | 'microphone';   // 新增
```

## 📊 性能优化

### 1. 懒加载

- 插件仅在需要时加载
- 使用 React.lazy() 动态导入

### 2. 虚拟滚动

- 插件列表使用虚拟滚动
- 处理大量插件时保持流畅

### 3. 存储优化

- 使用 electron-store 的缓存机制
- 批量操作减少 I/O

## 🧪 测试策略

### 单元测试
- 核心逻辑测试
- 工具函数测试

### 集成测试
- IPC 通信测试
- 插件加载测试

### E2E 测试
- 用户流程测试
- 跨平台兼容性测试

## 🎯 最佳实践

### 插件开发
1. 遵循 manifest 规范
2. 使用 TypeScript
3. 响应式设计
4. 错误处理
5. 数据验证

### 框架开发
1. 保持 API 稳定
2. 向后兼容
3. 详细的文档
4. 安全第一
5. 性能监控

---

更新日期: 2024-01-01
版本: 1.0.0
