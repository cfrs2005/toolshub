# ToolsHub UI 架构重构设计文档

## 一、核心问题

### 1.1 当前架构的致命缺陷

**路由结构混乱**：
```
/home          → 首页（活动面板 + 工具列表）
/plugins       → 插件列表页
/plugin/:id    → 插件详情页（❌ 多余的页面）
```

**交互流程冗余**：
```
用户点击历史记录
  → 路由跳转到 /plugin/youtube-analyzer
  → 打开右侧抽屉显示结果
  → 用户困惑：为什么要经过插件页？
```

**数据流混乱**：
- 中间区域既显示"活动面板"又显示"所有工具"
- 右侧抽屉既显示"历史记录"又显示"分析结果"
- 职责不清晰，用户认知负担重

### 1.2 参考设计（Muset）

**Muset 的三栏布局**：
```
┌──────┬────────────────┬──────────────┐
│ 导航 │  项目列表      │  编辑器      │
│      │  (历史记录)    │  (工作区)    │
└──────┴────────────────┴──────────────┘
```

**核心特点**：
- 左侧：功能导航
- 中间：历史记录卡片（点击后在右侧打开）
- 右侧：工作区（输入 + 输出）

## 二、目标架构

### 2.1 路由结构（简化）

```typescript
// ❌ 删除这些路由
/plugins       // 删除独立的插件列表页
/plugin/:id    // 删除插件详情页

// ✅ 只保留这些路由
/              // Dashboard（历史记录卡片）
```

**关键点**：
- **不再有独立的插件页面**
- 所有插件交互都在右侧工作区完成
- 路由不跳转，只改变右侧工作区的内容

### 2.2 UI 布局

```
┌─────────┬──────────────────────┬─────────────────────┐
│         │                      │                     │
│  左侧   │    中间区域          │   右侧工作区        │
│  导航   │   (历史记录卡片)     │  (插件输入+结果)    │
│         │                      │                     │
│  180px  │      flex-1          │      400px          │
│         │                      │                     │
│ 首页    │  ┌────┐ ┌────┐      │  ┌───────────────┐ │
│ ─────   │  │记录│ │记录│      │  │ YouTube分析   │ │
│ 工具    │  │ 1  │ │ 2  │      │  ├───────────────┤ │
│ ├计数器 │  └────┘ └────┘      │  │               │ │
│ ├下载器 │                      │  │ [输入框]      │ │
│ └YouTube│  ┌────┐ ┌────┐      │  │ [配置选项]    │ │
│         │  │记录│ │记录│      │  │               │ │
│         │  │ 3  │ │ 4  │      │  │ [结果展示]    │ │
│         │  └────┘ └────┘      │  │               │ │
│         │                      │  └───────────────┘ │
└─────────┴──────────────────────┴─────────────────────┘
```

### 2.3 交互流程

**场景 1：点击左侧导航**
```
用户点击"YouTube视频分析"
  → 右侧工作区加载 YouTube 插件界面
  → 显示输入框 + 历史对话
  → 不跳转路由
```

**场景 2：点击历史记录卡片**
```
用户点击中间的历史记录卡片
  → 右侧工作区加载对应插件
  → 直接渲染该历史记录的结果
  → 不跳转路由
```

**场景 3：首次进入**
```
用户打开应用
  → 中间显示所有历史记录卡片
  → 右侧显示欢迎界面或最近使用的插件
```

## 三、数据结构

### 3.1 历史记录卡片

```typescript
interface HistoryCard {
  id: string;
  pluginId: string;
  pluginName: string;
  pluginIcon: string;
  title: string;           // 记录标题（如视频标题）
  thumbnail?: string;      // 缩略图
  timestamp: number;
  summary: string;         // 简短摘要
  result: any;            // 完整结果数据
}
```

**渲染逻辑**：
```tsx
<div className="history-card" onClick={() => openInWorkspace(card)}>
  <img src={card.thumbnail} />
  <div>
    <h3>{card.title}</h3>
    <p>{card.summary}</p>
    <span>{formatTime(card.timestamp)}</span>
  </div>
</div>
```

### 3.2 右侧工作区状态

```typescript
interface WorkspaceState {
  activePluginId: string | null;
  mode: 'new' | 'history';  // 新建任务 or 查看历史
  historyId?: string;        // 如果是查看历史，记录 ID
  inputValue: string;
  messages: Message[];
  status: 'idle' | 'processing' | 'completed' | 'error';
}
```

**状态管理**：
```typescript
// 点击左侧导航
function openPlugin(pluginId: string) {
  setWorkspace({
    activePluginId: pluginId,
    mode: 'new',
    inputValue: '',
    messages: [],
    status: 'idle'
  });
}

// 点击历史记录
function openHistory(card: HistoryCard) {
  setWorkspace({
    activePluginId: card.pluginId,
    mode: 'history',
    historyId: card.id,
    inputValue: '',
    messages: reconstructMessages(card.result),
    status: 'completed'
  });
}
```

## 四、组件架构

### 4.1 核心组件

```
App
├── Sidebar (左侧导航)
│   ├── HomeLink
│   ├── ToolsSection
│   │   ├── PluginNavItem (计数器)
│   │   ├── PluginNavItem (下载器)
│   │   └── PluginNavItem (YouTube)
│   └── SettingsLink
│
├── MainContent (中间区域)
│   └── HistoryGrid
│       ├── HistoryCard
│       ├── HistoryCard
│       └── ...
│
└── Workspace (右侧工作区)
    ├── WorkspaceHeader (插件名称 + 图标)
    ├── WorkspaceContent
    │   ├── MessageList (对话历史)
    │   └── ResultView (结果展示)
    └── WorkspaceInput (输入框 + 发送按钮)
```

### 4.2 Workspace 组件设计

```tsx
interface WorkspaceProps {
  pluginId: string | null;
  mode: 'new' | 'history';
  historyData?: HistoryCard;
}

function Workspace({ pluginId, mode, historyData }: WorkspaceProps) {
  if (!pluginId) {
    return <WelcomeScreen />;
  }

  const plugin = usePlugin(pluginId);

  return (
    <div className="workspace">
      <WorkspaceHeader
        icon={plugin.icon}
        name={plugin.name}
      />

      <WorkspaceContent>
        {mode === 'history' ? (
          <ResultView data={historyData.result} />
        ) : (
          <MessageList messages={messages} />
        )}
      </WorkspaceContent>

      <WorkspaceInput
        placeholder={plugin.inputPlaceholder}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

### 4.3 HistoryCard 组件

```tsx
interface HistoryCardProps {
  card: HistoryCard;
  onClick: (card: HistoryCard) => void;
}

function HistoryCard({ card, onClick }: HistoryCardProps) {
  return (
    <div
      className="history-card"
      onClick={() => onClick(card)}
    >
      {card.thumbnail && (
        <img src={card.thumbnail} alt={card.title} />
      )}
      <div className="card-content">
        <div className="card-header">
          <img src={card.pluginIcon} className="plugin-icon" />
          <span className="plugin-name">{card.pluginName}</span>
        </div>
        <h3>{card.title}</h3>
        <p>{card.summary}</p>
        <time>{formatTime(card.timestamp)}</time>
      </div>
    </div>
  );
}
```

## 五、关键实现

### 5.1 删除插件详情页路由

**修改文件**：`src/renderer/App.tsx`

```tsx
// ❌ 删除这些路由
<Route path="/plugins" element={<PluginsPage />} />
<Route path="/plugin/:id" element={<PluginDetailPage />} />

// ✅ 只保留
<Route path="/" element={<Dashboard />} />
```

### 5.2 Dashboard 组件

```tsx
function Dashboard() {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    activePluginId: null,
    mode: 'new',
    inputValue: '',
    messages: [],
    status: 'idle'
  });

  const history = useHistory(); // 获取所有历史记录

  return (
    <div className="dashboard">
      <Sidebar onPluginClick={(id) => openPlugin(id, setWorkspace)} />

      <MainContent>
        <HistoryGrid
          cards={history}
          onCardClick={(card) => openHistory(card, setWorkspace)}
        />
      </MainContent>

      <Workspace {...workspace} />
    </div>
  );
}
```

### 5.3 历史记录存储

**修改插件保存逻辑**：

```typescript
// 插件完成任务后保存历史记录
async function saveHistory(pluginId: string, data: {
  title: string;
  thumbnail?: string;
  summary: string;
  result: any;
}) {
  const card: HistoryCard = {
    id: generateId(),
    pluginId,
    pluginName: getPluginName(pluginId),
    pluginIcon: getPluginIcon(pluginId),
    timestamp: Date.now(),
    ...data
  };

  // 保存到全局历史记录
  await window.electronAPI.pluginStorage.set(
    'global',
    `history:${card.id}`,
    card
  );

  // 同时保存到插件自己的存储
  await window.electronAPI.pluginStorage.set(
    pluginId,
    `history:${card.id}`,
    card
  );
}
```

### 5.4 右侧工作区渲染历史结果

```tsx
function ResultView({ data }: { data: any }) {
  // 根据插件类型渲染不同的结果视图

  // YouTube 插件的结果
  if (data.type === 'youtube-analysis') {
    return (
      <div className="youtube-result">
        <h2>{data.title}</h2>
        <video src={data.videoUrl} controls />
        <div className="analysis">
          <h3>AI 分析报告</h3>
          <ReactMarkdown>{data.analysis}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // 通用结果渲染
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## 六、样式设计

### 6.1 布局 CSS

```css
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 180px;
  background: #1a1a1a;
  color: white;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f5f5f5;
}

.workspace {
  width: 400px;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
```

### 6.2 历史记录卡片样式

```css
.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.history-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.history-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.history-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.plugin-icon {
  width: 20px;
  height: 20px;
}

.plugin-name {
  font-size: 12px;
  color: #666;
}

.history-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-card p {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.history-card time {
  font-size: 12px;
  color: #999;
}
```

### 6.3 右侧工作区样式

```css
.workspace {
  display: flex;
  flex-direction: column;
}

.workspace-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.workspace-header img {
  width: 32px;
  height: 32px;
}

.workspace-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.workspace-input {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.workspace-input textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
}

.workspace-input button {
  margin-top: 12px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.workspace-input button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

## 七、实现步骤

### P0（核心架构）
1. ✅ 删除 /plugins 和 /plugin/:id 路由
2. ✅ 创建 Dashboard 组件（三栏布局）
3. ✅ 实现 Workspace 组件（右侧工作区）
4. ✅ 实现 HistoryCard 组件
5. ✅ 实现点击历史记录直接加载结果

### P1（功能完善）
6. 实现历史记录存储逻辑
7. 实现不同插件的结果渲染
8. 实现左侧导航点击切换插件
9. 实现输入框提交逻辑

### P2（优化）
10. 添加加载动画
11. 添加错误处理
12. 优化响应式布局
13. 添加键盘快捷键

## 八、文件修改清单

### 需要删除的文件
- `src/renderer/pages/PluginsPage.tsx`
- `src/renderer/pages/PluginDetailPage.tsx`

### 需要修改的文件
1. `src/renderer/App.tsx` - 删除路由
2. `src/renderer/pages/Home.tsx` - 改为 Dashboard
3. `src/plugins/youtube-analyzer/index.tsx` - 适配新架构

### 需要新建的文件
1. `src/renderer/components/Dashboard.tsx`
2. `src/renderer/components/Workspace.tsx`
3. `src/renderer/components/HistoryCard.tsx`
4. `src/renderer/components/HistoryGrid.tsx`
5. `src/renderer/components/ResultView.tsx`
6. `src/services/historyManager.ts`

## 九、验收标准

### 功能验收
- [ ] 点击历史记录直接在右侧显示结果（不跳转路由）
- [ ] 点击左侧导航在右侧打开插件输入界面
- [ ] 插件执行完成后自动保存历史记录
- [ ] 历史记录卡片显示缩略图、标题、摘要

### 交互验收
- [ ] 没有任何路由跳转（除了首页）
- [ ] 右侧工作区切换流畅无闪烁
- [ ] 历史记录卡片悬停效果正常
- [ ] 输入框提交后显示加载状态

### 视觉验收
- [ ] 布局与 Muset 参考图一致
- [ ] 历史记录卡片样式美观
- [ ] 右侧工作区样式统一
- [ ] 响应式布局正常

---

**文档版本**：v2.0
**创建日期**：2025-11-18
**核心改进**：删除插件详情页，实现单页面架构
