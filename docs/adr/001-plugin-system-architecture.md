# ADR-001: 插件系统架构设计

## 状态

accepted

## 背景

ToolsHub 需要一个插件系统来支持：

- 动态加载和卸载功能模块
- 插件之间的隔离和安全性
- 统一的插件存储管理
- 跨进程通信（Electron 主进程与渲染进程）

主要挑战：

1. Electron 的进程隔离模型限制了直接的代码共享
2. 需要平衡安全性（禁用 nodeIntegration）和功能性
3. 插件需要持久化存储能力
4. 开发和生产环境的插件加载路径不同

## 决策

采用 **双层插件加载架构**：

1. **主进程插件加载器** (`PluginLoader` 类)
   - 负责发现、验证和管理插件元数据
   - 管理每个插件的独立存储（electron-store）
   - 通过 IPC 向渲染进程暴露 API

2. **渲染进程插件注册表** (`pluginRegistry.tsx`)
   - 负责加载 React 组件
   - 在构建时静态导入（通过代码生成）
   - 提供组件查找功能

3. **IPC 通信桥**
   - 使用 `contextBridge` 安全暴露 API
   - 所有存储操作通过主进程代理

## 考虑的方案

### 方案 A: 纯渲染进程插件系统

所有插件逻辑都在渲染进程中运行。

**优点:**
- 实现简单
- 无需 IPC 通信

**缺点:**
- 无法访问 Node.js API
- 无法实现安全的文件系统操作
- 难以实现插件隔离存储

### 方案 B: 纯主进程插件系统（类似 VS Code）

所有插件都运行在主进程或独立的扩展主机进程中。

**优点:**
- 更好的安全隔离
- 完整的 Node.js 访问能力
- 可以实现真正的沙箱

**缺点:**
- 复杂度高
- UI 渲染需要复杂的序列化/IPC
- 对于简单工具来说过度设计

### 方案 C: 双层架构（已选择）

主进程处理存储和系统操作，渲染进程处理 UI。

**优点:**
- 平衡了安全性和开发体验
- 利用 React 生态系统
- 适合中等复杂度的应用
- 清晰的职责分离

**缺点:**
- 需要维护两套加载逻辑
- IPC 通信增加了一定复杂度
- 插件组件需要在构建时确定

## 后果

### 正面影响

- 插件可以使用完整的 React 功能
- 每个插件有独立的持久化存储
- 主进程可以安全地执行文件操作
- 架构清晰，易于理解和维护

### 负面影响

- 第三方插件需要重新构建才能加载（无法运行时动态导入）
- 主进程和渲染进程的插件列表需要同步

### 中性影响

- 需要自动生成插件注册表代码
- 插件开发需要遵循特定的目录结构

## 参考资料

- [VS Code Extension Architecture](https://code.visualstudio.com/api/advanced-topics/extension-host)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [electron-store](https://github.com/sindresorhus/electron-store)
