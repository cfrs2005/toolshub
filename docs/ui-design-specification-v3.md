# ToolsHub UI 设计规范 v3.0

## 一、核心问题分析

### 1.1 当前实现与期望的差距

**视觉风格差距**：
- 当前：传统的浅色/深色混合，缺乏现代感
- 期望：参考 Muset.ai 的精致深色主题，更具科技感

**布局结构差距**：
- 当前：三栏布局但职责不清晰
- 期望：清晰的三栏职责划分，左侧双区域设计

**交互逻辑差距**：
- 当前：点击历史 → 跳转插件页 → 弹窗显示结果（冗余）
- 期望：点击历史 → 直接在右侧显示完整结果（零跳转）

**渲染问题**：
- 当前：结果在弹窗中渲染，体验割裂
- 期望：结果直接在右侧工作区渲染，无弹窗

### 1.2 核心设计原则

1. **零路由跳转**：所有操作都在单页面完成
2. **即时响应**：点击即显示，无中间状态
3. **上下文保持**：切换内容时保持导航状态
4. **视觉统一**：深色主题，统一的设计语言

---

## 二、视觉设计规范

### 2.1 色彩系统（Claude.ai / Muset.ai 风格）

```css
:root {
  /* 主背景色 - 温暖深色调（类似 Claude.ai） */
  --bg-primary: #1a1915;        /* 最深背景 - 温暖黑 */
  --bg-secondary: #21201c;      /* 次级背景（左侧栏） */
  --bg-tertiary: #2a2926;       /* 三级背景（卡片、输入框） */
  --bg-elevated: #343330;       /* 悬浮元素背景 */
  --bg-surface: #3d3c38;        /* 表面元素 */

  /* 边框色 - 温暖灰调 */
  --border-subtle: #3a3935;     /* 细微边框 */
  --border-default: #4a4944;    /* 默认边框 */
  --border-focus: #5a5954;      /* 聚焦边框 */

  /* 文字色 - 温暖白 */
  --text-primary: #f5f4ef;      /* 主文字 - 米白色 */
  --text-secondary: #a8a69e;    /* 次级文字 */
  --text-tertiary: #7a786f;     /* 三级文字（提示、时间） */
  --text-disabled: #5a5850;     /* 禁用状态 */

  /* 强调色 - 橙色/琥珀色（Claude.ai 特色） */
  --accent-primary: #d97706;    /* 主强调色 - 琥珀色 */
  --accent-hover: #f59e0b;      /* 悬浮状态 - 亮琥珀 */
  --accent-active: #b45309;     /* 点击状态 - 深琥珀 */
  --accent-subtle: rgba(217, 119, 6, 0.15); /* 淡强调背景 */
  --accent-muted: rgba(217, 119, 6, 0.08);  /* 更淡的强调背景 */

  /* 次级强调色 - 用于链接等 */
  --accent-secondary: #c084fc;  /* 紫色 */

  /* 功能色 */
  --success: #22c55e;
  --warning: #fbbf24;
  --error: #f87171;
  --info: #60a5fa;

  /* 渐变 - 温暖渐变 */
  --gradient-primary: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
  --gradient-subtle: linear-gradient(180deg, rgba(217, 119, 6, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%);
  --gradient-warm: linear-gradient(135deg, #1a1915 0%, #21201c 100%);
}
```

**色彩设计说明**：
- 背景采用温暖的深棕/深灰色调，避免纯黑的冷酷感
- 文字使用米白色而非纯白，提升阅读舒适度
- 强调色使用橙色/琥珀色，与 Claude.ai 保持一致
- 整体营造温暖、专业、优雅的氛围

### 2.2 字体系统

```css
:root {
  /* 字体家族 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* 字体大小 */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-md: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 20px;
  --text-3xl: 24px;

  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* 字重 */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 2.3 间距系统

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 2.4 圆角与阴影

```css
:root {
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
}
```

---

## 三、布局架构

### 3.1 整体布局（重新定义）

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用窗口 (100vw × 100vh)                  │
├──────────┬───────────────────────────┬─────────────────────────┤
│          │                           │                         │
│  左侧栏   │      中间区域              │    右侧工作区            │
│  (双区域) │    (历史记录网格)          │   (插件输入+结果)        │
│          │                           │                         │
│  240px   │        flex-1             │       480px             │
│          │      (min: 400px)          │    (可拖拽调整)          │
│          │                           │                         │
└──────────┴───────────────────────────┴─────────────────────────┘
```

### 3.2 左侧栏详细结构（核心改进）

```
┌─────────────────────────┐
│      Logo/品牌区         │  48px
├─────────────────────────┤
│                         │
│    工具列表区域          │  flex-1 (上半部分)
│    ─────────────        │
│    ▸ YouTube 分析        │  每项 40px 高
│    ▸ 视频下载器          │
│    ▸ 计数器              │
│    ▸ 更多工具...         │
│                         │
├─────────────────────────┤  分隔线
│                         │
│    历史记录区域          │  flex-1 (下半部分)
│    ─────────────        │
│    📺 如何学习编程...     │  按模块分组
│       2分钟前            │  每项 56px 高
│    📺 React教程分析      │
│       1小时前            │
│    📥 视频下载完成        │
│       3小时前            │
│    ...                  │
│                         │
├─────────────────────────┤
│    用户/设置区域         │  48px
└─────────────────────────┘
```

**关键设计点**：
- 工具列表固定在上半部分，快速访问
- 历史记录在下半部分，按时间倒序
- 历史记录项显示：图标 + 标题 + 时间
- 可折叠/展开各模块的历史

### 3.3 中间区域结构

```
┌───────────────────────────────────────┐
│  搜索栏 + 筛选器                       │  56px
│  [🔍 搜索历史记录...]  [全部▾] [时间▾]  │
├───────────────────────────────────────┤
│                                       │
│  历史记录网格                          │
│                                       │
│  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │ 缩略图   │  │ 缩略图   │  │ 缩略图  │ │
│  │─────────│  │─────────│  │────────│ │
│  │ 标题     │  │ 标题     │  │ 标题    │ │
│  │ 摘要...  │  │ 摘要...  │  │ 摘要... │ │
│  │ 🎬 2分钟 │  │ 📥 1小时 │  │ 🔢 3小时│ │
│  └─────────┘  └─────────┘  └────────┘ │
│                                       │
│  ┌─────────┐  ┌─────────┐             │
│  │ ...     │  │ ...     │             │
│  └─────────┘  └─────────┘             │
│                                       │
└───────────────────────────────────────┘
```

### 3.4 右侧工作区结构（核心改进）

```
┌─────────────────────────────────────┐
│  工作区头部                          │  56px
│  🎬 YouTube 视频分析    [⚙️] [×]     │
├─────────────────────────────────────┤
│  配置选项区（可折叠）                  │  auto
│  ┌─────────────────────────────────┐ │
│  │ 分析深度: [基础 ▾]               │ │
│  │ 语言: [中文 ▾]                   │ │
│  │ □ 生成字幕  □ 提取关键帧         │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│                                     │
│  内容/结果区域                       │  flex-1
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │    结果内容直接渲染在这里        │ │
│  │    （不是弹窗！）                │ │
│  │                                 │ │
│  │    - 视频信息                   │ │
│  │    - AI 分析报告                │ │
│  │    - 评论分析                   │ │
│  │    - ...                       │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  输入区域                            │  120px
│  ┌─────────────────────────────────┐ │
│  │ 请输入 YouTube 视频链接...       │ │
│  │                                 │ │
│  │                          [分析] │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**关键设计点**：
- 配置选项在顶部，输入框在底部（类似 ChatGPT）
- 结果直接渲染在中间区域，不使用弹窗
- 滚动区域仅在内容区域，头部和输入框固定

---

## 四、交互流程（精确定义）

### 4.1 点击左侧工具列表

```
用户点击 "YouTube 视频分析"
  │
  ├─→ 右侧工作区立即切换到 YouTube 插件界面
  │     - 显示插件头部（图标 + 名称）
  │     - 显示配置选项（可折叠）
  │     - 显示空白内容区
  │     - 显示输入框（placeholder: "请输入 YouTube 视频链接..."）
  │
  ├─→ 中间区域保持不变（继续显示所有历史记录）
  │
  └─→ 左侧导航高亮当前选中的工具

不发生路由跳转
```

### 4.2 点击左侧历史记录项

```
用户点击左侧历史记录 "如何学习编程..."
  │
  ├─→ 右侧工作区立即加载该历史记录
  │     - 显示对应插件的头部
  │     - 显示当时使用的配置选项（只读）
  │     - 直接渲染完整的结果内容
  │     - 输入框保留（可以基于此继续分析）
  │
  ├─→ 中间区域保持不变
  │
  └─→ 左侧历史记录项高亮选中状态

不发生路由跳转，不弹出任何窗口
```

### 4.3 点击中间历史记录卡片

```
用户点击中间网格中的历史卡片
  │
  ├─→ 与点击左侧历史记录项效果完全相同
  │     - 右侧工作区加载完整结果
  │     - 直接渲染，无弹窗
  │
  └─→ 同时高亮左侧对应的历史记录项

不发生路由跳转
```

### 4.4 提交新任务

```
用户在右侧输入框输入内容并点击提交
  │
  ├─→ 输入框显示加载状态
  │
  ├─→ 内容区域显示处理进度
  │     - 步骤1: 解析链接... ✓
  │     - 步骤2: 获取视频信息... ✓
  │     - 步骤3: AI 分析中... (进行中)
  │
  ├─→ 完成后直接在内容区域渲染结果
  │
  └─→ 自动保存到历史记录
        - 左侧历史区域顶部添加新项
        - 中间网格顶部添加新卡片

结果直接渲染，无弹窗
```

### 4.5 首次打开应用

```
用户打开应用
  │
  ├─→ 左侧显示工具列表 + 历史记录
  │
  ├─→ 中间显示所有历史记录卡片网格
  │     - 无历史时显示空状态引导
  │
  └─→ 右侧显示欢迎界面
        - "选择一个工具开始使用"
        - 快捷入口：常用工具图标
```

---

## 五、组件详细设计

### 5.1 左侧导航栏组件 (Sidebar)

```tsx
interface SidebarProps {
  tools: PluginInfo[];
  history: HistoryItem[];
  selectedToolId: string | null;
  selectedHistoryId: string | null;
  onToolClick: (toolId: string) => void;
  onHistoryClick: (historyId: string) => void;
}

// 布局结构
<aside className="sidebar">
  {/* Logo 区域 */}
  <div className="sidebar-logo">
    <img src="/logo.svg" alt="ToolsHub" />
  </div>

  {/* 工具列表区域 */}
  <div className="sidebar-tools">
    <div className="sidebar-section-title">工具</div>
    {tools.map(tool => (
      <SidebarToolItem
        key={tool.id}
        tool={tool}
        isSelected={selectedToolId === tool.id}
        onClick={() => onToolClick(tool.id)}
      />
    ))}
  </div>

  {/* 分隔线 */}
  <div className="sidebar-divider" />

  {/* 历史记录区域 */}
  <div className="sidebar-history">
    <div className="sidebar-section-title">历史记录</div>
    {history.map(item => (
      <SidebarHistoryItem
        key={item.id}
        item={item}
        isSelected={selectedHistoryId === item.id}
        onClick={() => onHistoryClick(item.id)}
      />
    ))}
  </div>

  {/* 底部设置 */}
  <div className="sidebar-footer">
    <button className="sidebar-settings">
      <SettingsIcon />
      设置
    </button>
  </div>
</aside>
```

### 5.2 左侧历史记录项组件

```tsx
interface SidebarHistoryItemProps {
  item: HistoryItem;
  isSelected: boolean;
  onClick: () => void;
}

function SidebarHistoryItem({ item, isSelected, onClick }: SidebarHistoryItemProps) {
  return (
    <div
      className={`history-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="history-item-icon">
        {getPluginIcon(item.pluginId)}
      </div>
      <div className="history-item-content">
        <div className="history-item-title">{item.title}</div>
        <div className="history-item-time">{formatRelativeTime(item.timestamp)}</div>
      </div>
    </div>
  );
}
```

样式规范：
```css
.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.history-item:hover {
  background: var(--bg-tertiary);
}

.history-item.selected {
  background: var(--accent-subtle);
  border-left: 2px solid var(--accent-primary);
}

.history-item-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.history-item-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
```

### 5.3 右侧工作区组件 (Workspace)

```tsx
interface WorkspaceProps {
  activePlugin: PluginInfo | null;
  historyData: HistoryItem | null;
  mode: 'new' | 'history';
}

function Workspace({ activePlugin, historyData, mode }: WorkspaceProps) {
  if (!activePlugin) {
    return <WorkspaceWelcome />;
  }

  return (
    <div className="workspace">
      {/* 固定头部 */}
      <WorkspaceHeader plugin={activePlugin} />

      {/* 可折叠配置区 */}
      <WorkspaceConfig
        plugin={activePlugin}
        readOnly={mode === 'history'}
      />

      {/* 滚动内容区 */}
      <div className="workspace-content">
        {mode === 'history' && historyData ? (
          <WorkspaceResult data={historyData.result} pluginId={activePlugin.id} />
        ) : (
          <WorkspaceMessages />
        )}
      </div>

      {/* 固定输入区 */}
      <WorkspaceInput
        plugin={activePlugin}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

### 5.4 结果渲染组件 (WorkspaceResult)

```tsx
interface WorkspaceResultProps {
  data: any;
  pluginId: string;
}

function WorkspaceResult({ data, pluginId }: WorkspaceResultProps) {
  // 根据插件类型选择渲染器
  const Renderer = getResultRenderer(pluginId);

  return (
    <div className="workspace-result">
      <Renderer data={data} />
    </div>
  );
}

// YouTube 分析结果渲染器
function YouTubeResultRenderer({ data }: { data: YouTubeAnalysisResult }) {
  return (
    <div className="youtube-result">
      {/* 视频预览 */}
      <div className="result-video-preview">
        <img src={data.thumbnail} alt={data.title} />
        <div className="video-duration">{formatDuration(data.duration)}</div>
      </div>

      {/* 视频信息 */}
      <div className="result-video-info">
        <h2 className="video-title">{data.title}</h2>
        <div className="video-meta">
          <span>{data.channelName}</span>
          <span>{formatNumber(data.viewCount)} 次观看</span>
          <span>{formatDate(data.publishedAt)}</span>
        </div>
      </div>

      {/* AI 分析报告 - 直接渲染，不是弹窗 */}
      <div className="result-analysis">
        <h3>AI 分析报告</h3>
        <div className="analysis-content">
          <ReactMarkdown>{data.analysis}</ReactMarkdown>
        </div>
      </div>

      {/* 其他分析模块 */}
      {data.comments && (
        <div className="result-comments">
          <h3>评论分析</h3>
          <CommentsList comments={data.comments} />
        </div>
      )}
    </div>
  );
}
```

样式规范：
```css
.workspace-result {
  padding: var(--space-5);
}

.youtube-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.result-video-preview {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.result-video-preview img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
  background: rgba(0, 0, 0, 0.8);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.result-analysis {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.result-analysis h3 {
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.analysis-content {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
```

---

## 六、状态管理

### 6.1 全局状态结构

```typescript
interface AppState {
  // UI 状态
  sidebar: {
    selectedToolId: string | null;
    selectedHistoryId: string | null;
    isCollapsed: boolean;
  };

  // 工作区状态
  workspace: {
    activePluginId: string | null;
    mode: 'welcome' | 'new' | 'history';
    historyId: string | null;
    config: Record<string, any>;
    status: 'idle' | 'loading' | 'processing' | 'completed' | 'error';
    error: string | null;
  };

  // 数据
  plugins: PluginInfo[];
  history: HistoryItem[];
}
```

### 6.2 状态更新逻辑

```typescript
// 点击左侧工具
function handleToolClick(toolId: string) {
  setState({
    sidebar: {
      ...state.sidebar,
      selectedToolId: toolId,
      selectedHistoryId: null,
    },
    workspace: {
      activePluginId: toolId,
      mode: 'new',
      historyId: null,
      config: getDefaultConfig(toolId),
      status: 'idle',
      error: null,
    },
  });
}

// 点击历史记录（左侧或中间）
function handleHistoryClick(historyId: string) {
  const historyItem = state.history.find(h => h.id === historyId);
  if (!historyItem) return;

  setState({
    sidebar: {
      ...state.sidebar,
      selectedToolId: null,
      selectedHistoryId: historyId,
    },
    workspace: {
      activePluginId: historyItem.pluginId,
      mode: 'history',
      historyId: historyId,
      config: historyItem.config,
      status: 'completed',
      error: null,
    },
  });
}
```

---

## 七、实现优先级

### P0：核心架构重构（必须完成）

1. **删除弹窗机制**
   - 移除所有使用 Dialog/Modal 显示结果的代码
   - 结果直接渲染在 Workspace 组件中

2. **重构左侧导航**
   - 上半部分：工具列表
   - 下半部分：历史记录列表
   - 实现选中状态同步

3. **实现直接结果渲染**
   - 点击历史 → 直接加载结果到 Workspace
   - 无中间跳转，无弹窗

4. **应用深色主题**
   - 按照色彩系统规范更新所有组件

### P1：体验完善（重要）

5. **优化结果渲染器**
   - YouTube 分析结果的完整渲染
   - 其他插件结果的渲染支持

6. **配置选项区域**
   - 可折叠的配置面板
   - 历史查看时显示只读配置

7. **状态管理优化**
   - 统一的状态流转
   - 加载/错误状态处理

### P2：细节打磨（锦上添花）

8. **动画过渡**
   - 工作区切换动画
   - 列表项悬浮效果

9. **快捷键支持**
   - Cmd/Ctrl + K 搜索
   - Esc 关闭配置面板

10. **响应式适配**
    - 侧边栏折叠
    - 工作区宽度拖拽

---

## 八、文件修改清单

### 需要删除的文件
- `src/renderer/components/HistoryDrawer.tsx` （如果存在弹窗组件）
- `src/renderer/components/ResultModal.tsx` （如果存在）

### 需要大幅修改的文件
1. `src/renderer/App.tsx` - 简化路由，只保留根路由
2. `src/renderer/components/Layout.tsx` - 新的三栏布局
3. `src/renderer/pages/Home.tsx` - 改为 Dashboard
4. `src/plugins/youtube-analyzer/index.tsx` - 移除弹窗，适配直接渲染

### 需要新建的文件
1. `src/renderer/styles/theme.css` - 主题变量定义
2. `src/renderer/components/Sidebar/` - 新的侧边栏组件目录
   - `Sidebar.tsx`
   - `SidebarToolItem.tsx`
   - `SidebarHistoryItem.tsx`
3. `src/renderer/components/Workspace/` - 新的工作区组件目录
   - `Workspace.tsx`
   - `WorkspaceHeader.tsx`
   - `WorkspaceConfig.tsx`
   - `WorkspaceResult.tsx`
   - `WorkspaceInput.tsx`
4. `src/renderer/components/HistoryGrid/` - 中间网格组件
   - `HistoryGrid.tsx`
   - `HistoryCard.tsx`
5. `src/renderer/hooks/useAppState.ts` - 状态管理 Hook
6. `src/renderer/utils/resultRenderers.ts` - 结果渲染器注册

---

## 九、验收标准

### 功能验收
- [ ] 点击左侧工具，右侧显示该工具的输入界面
- [ ] 点击左侧历史，右侧直接显示完整结果（无弹窗）
- [ ] 点击中间卡片，右侧直接显示完整结果（无弹窗）
- [ ] 提交任务后结果直接渲染在右侧
- [ ] 历史记录自动保存并在左侧列表更新

### 交互验收
- [ ] 全程无路由跳转
- [ ] 全程无弹窗/Modal
- [ ] 选中状态正确同步（左侧高亮）
- [ ] 切换流畅无闪烁

### 视觉验收
- [ ] 深色主题正确应用
- [ ] 色彩符合规范
- [ ] 间距和圆角统一
- [ ] 字体大小和行高正确

---

**文档版本**：v3.0
**创建日期**：2025-11-18
**核心改进**：
1. 细化视觉设计规范（色彩、字体、间距）
2. 重新定义左侧导航结构（工具+历史双区域）
3. 强调无弹窗、直接渲染的交互模式
4. 提供详细的组件实现示例
