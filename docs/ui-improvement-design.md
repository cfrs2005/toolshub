# ToolsHub 首页 UI 改进设计文档

## 一、核心改进目标

参考 Muse 应用的设计风格，将 ToolsHub 首页改造为更现代、更直观的卡片式布局。

## 二、布局结构调整（基于 Muse UI 分析）

### 2.1 整体布局（三栏式）
```
┌────────┬──────────────────────┬─────────────────┐
│        │                      │                 │
│ 左侧   │   中间主内容区       │  右侧插件交互区 │
│ 导航   │   (活动面板+工具列表)│  (对话输入框)   │
│        │                      │                 │
│ 20%    │       50%            │      30%        │
└────────┴──────────────────────┴─────────────────┘
```

**关键理解**：
- **左侧**：文件/项目导航（类似 Muse 的"我的文档"）
- **中间**：内容展示区（活动面板 + 所有工具）
- **右侧**：**插件交互界面**（不是 AI 助手，而是当前激活插件的操作界面）

### 2.2 右侧插件交互区（核心改进）

**功能定位**：
- 当用户点击某个插件卡片时，右侧显示该插件的交互界面
- 大部分插件使用**对话输入框**作为主要交互方式
- 类似 Muse 右侧的"Muse和你一起思考"面板

**UI 结构**：
```
┌─────────────────────────────┐
│  🎬 YouTube 视频分析        │
│  ─────────────────────────  │
│                             │
│  [对话历史区域]             │
│  用户: 分析这个视频...      │
│  助手: 正在获取字幕...      │
│                             │
│  ─────────────────────────  │
│  Drop an idea, let's shape..│
│  ┌─────────────────────┐   │
│  │ 输入 YouTube 链接... │   │
│  └─────────────────────┘   │
│              [发送] 按钮    │
└─────────────────────────────┘
```

**交互流程**：
1. 用户在中间区域点击"YouTube 视频分析"卡片
2. 右侧面板展开，显示该插件的交互界面
3. 用户在输入框输入 YouTube 链接
4. 插件在右侧面板显示分析进度和结果
5. 历史记录显示在中间的活动面板

### 2.3 活动面板（Widget 区域）改进

**当前问题**：
- 图标位置在左侧，与 Muse 风格不符
- 缺少视觉层次

**改进方案**：

1. **Widget 卡片布局**（图标移到右侧）：
   ```
   ┌─────────────────────────────────────────┐
   │ 🎬 YouTube 视频分析    [查看全部 →]     │
   ├─────────────────────────────────────────┤
   │                                         │
   │  ┌────┐  ┌────┐  ┌────┐               │
   │  │缩略│  │缩略│  │缩略│      [SVG图标]│
   │  │图  │  │图  │  │图  │       64x64   │
   │  └────┘  └────┘  └────┘               │
   │  标题     标题     标题                 │
   │  时间     时间     时间                 │
   │  摘要     摘要     摘要                 │
   │                                         │
   │         [查看所有记录 (1+)]             │
   └─────────────────────────────────────────┘
   ```

2. **SVG 图标生成**：
   - 为每个插件生成独特的 SVG 图标
   - 使用 BigModel API 生成 SVG 代码
   - 图标风格：扁平化、现代、彩色
   - 示例提示词：
     ```
     生成一个 SVG 图标，代表 [插件功能]，
     要求：64x64px，扁平化设计，使用渐变色，
     主色调为 [颜色]，简洁现代
     ```

## 三、所有工具列表改进

### 3.1 当前问题
- 激活按钮位置不明显
- 卡片样式过于简单

### 3.2 改进方案

**布局结构**：
```
┌──────────────────────────────────────────┐
│  [SVG图标]  │  插件名称                  │
│   64x64     │  简短描述                  │
│             │  v1.0.0    tool            │
│             │                 [激活按钮] │
└──────────────────────────────────────────┘
```

**关键改进点**：
1. **图标位置**：左侧，64x64px SVG
2. **激活按钮**：移到右侧，更符合操作习惯
3. **按钮样式**：
   - 未激活：边框按钮，蓝色边框
   - 已激活：实心按钮，渐变背景
   - 悬停效果：轻微放大 + 阴影

**CSS 样式参考**：
```css
.tool-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.tool-icon {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-actions {
  display: flex;
  align-items: center;
}

.activate-button {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.activate-button.inactive {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.activate-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}
```

## 四、SVG 图标生成实现

### 4.1 技术方案
1. **生成时机**：
   - 插件首次加载时检查是否有 SVG 图标
   - 如果没有，调用 BigModel API 生成

2. **存储位置**：
   - 路径：`src/plugins/[plugin-id]/icon.svg`
   - manifest.json 添加字段：`"icon": "icon.svg"`

3. **生成流程**：
   ```typescript
   async function generatePluginIcon(pluginId: string, pluginName: string, description: string) {
     const prompt = `生成一个 SVG 图标，代表"${pluginName}"功能。
     描述：${description}
     要求：
     - 尺寸：64x64px
     - 风格：扁平化、现代
     - 使用渐变色
     - 简洁清晰
     - 只返回 SVG 代码，不要其他说明`;

     const svg = await callBigModelAPI(prompt);
     await fs.writeFile(`src/plugins/${pluginId}/icon.svg`, svg);
     return svg;
   }
   ```

### 4.2 API 集成
- 使用现有的 BigModel API 配置
- 添加新的 IPC 通道：`generate-plugin-icon`
- 主进程处理 SVG 生成和保存

## 五、右侧插件交互区详细设计

### 5.1 功能定位
- **核心作用**：插件的主要操作界面，替代传统的独立页面
- **交互方式**：以对话输入框为主，支持自然语言交互
- **状态管理**：显示插件运行状态、进度、结果

### 5.2 通用交互组件设计

**组件结构**：
```typescript
interface PluginInteractionPanel {
  pluginId: string;
  pluginName: string;
  pluginIcon: string; // SVG
  conversationHistory: Message[];
  inputPlaceholder: string;
  onSubmit: (input: string) => void;
  status: 'idle' | 'processing' | 'completed' | 'error';
}
```

**UI 布局**：
```
┌─────────────────────────────────┐
│  [SVG图标] YouTube 视频分析     │
│  ───────────────────────────────│
│                                 │
│  [对话历史滚动区域]             │
│  ┌─────────────────────────┐   │
│  │ 👤 用户                 │   │
│  │ 分析这个视频：          │   │
│  │ https://youtube.com/... │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🤖 助手                 │   │
│  │ ⏳ 正在获取字幕...      │   │
│  │ ✅ 字幕获取成功         │   │
│  │ ⏳ AI 分析中...         │   │
│  └─────────────────────────┘   │
│                                 │
│  ───────────────────────────────│
│  Drop an idea, let's shape...   │
│  ┌───────────────────────────┐ │
│  │ 输入 YouTube 链接或问题...│ │
│  │                           │ │
│  └───────────────────────────┘ │
│              [📤 发送]          │
└─────────────────────────────────┘
```

### 5.3 不同插件的适配方案

**YouTube 视频分析插件**：
- 输入：YouTube 链接
- 输出：分析进度 → 完成提示 → 查看报告按钮
- 历史：显示最近分析的视频

**文件下载器插件**：
- 输入：下载链接
- 输出：下载进度条 → 完成提示
- 历史：显示下载记录

**计数器插件**（简单示例）：
- 输入：不需要输入框，直接显示计数器控制按钮
- 输出：当前计数值
- 历史：无

### 5.4 状态显示设计

**进度指示器**：
```
⏳ 正在处理...
✅ 完成
❌ 失败
⚠️ 警告
```

**消息类型**：
```typescript
type MessageType = 'user' | 'system' | 'success' | 'error' | 'progress';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  metadata?: {
    progress?: number; // 0-100
    actionButton?: {
      label: string;
      onClick: () => void;
    };
  };
}
```

### 5.5 实现要点
- **固定位置**：右侧，宽度 30%，高度 100vh
- **独立滚动**：对话历史区域可滚动，输入框固定在底部
- **自动滚动**：新消息出现时自动滚动到底部
- **响应式**：小屏幕时可折叠或全屏显示
- **状态持久化**：对话历史保存到插件存储

## 六、实现优先级

### P0（必须实现）
1. ✅ 图标位置调整（左→右）
2. ✅ 激活按钮位置调整（左→右）
3. ✅ SVG 图标生成功能

### P1（重要）
4. 卡片样式优化
5. 悬停效果增强
6. 响应式布局调整

### P2（可选）
7. 右侧 AI 助手面板
8. 动画效果优化
9. 主题切换支持

## 七、文件修改清单

### 需要修改的文件
1. **src/renderer/pages/Home.tsx**
   - 调整整体布局结构
   - 添加右侧 AI 助手面板容器

2. **src/plugins/youtube-analyzer/widget.tsx**
   - 图标位置从左移到右
   - 调整卡片内部布局

3. **src/renderer/components/PluginCard.tsx**（新建）
   - 统一的插件卡片组件
   - 图标在左，激活按钮在右

4. **src/main/index.ts**
   - 添加 `generate-plugin-icon` IPC 处理器

5. **src/shared/types/plugin.ts**
   - 添加 `icon?: string` 字段到 PluginManifest

### 需要新建的文件
1. **src/services/iconGenerator.ts**
   - SVG 图标生成服务
   - 调用 BigModel API

2. **src/renderer/components/AIAssistant.tsx**
   - 右侧 AI 助手面板组件

## 八、设计原则

### 8.1 视觉层次
1. **主要操作**：激活按钮 - 右侧，视觉突出
2. **次要信息**：版本号、类型 - 小字体，低对比度
3. **装饰元素**：图标 - 左侧，吸引注意但不干扰

### 8.2 交互反馈
- 所有可点击元素必须有悬停效果
- 状态变化要有过渡动画（0.3s）
- 按钮点击要有视觉反馈

### 8.3 一致性
- 所有插件卡片使用统一组件
- 颜色方案保持一致（主色：#667eea）
- 圆角统一为 12px
- 间距使用 8px 倍数

## 九、技术实现细节

### 9.1 SVG 图标缓存策略
```typescript
// 内存缓存
const iconCache = new Map<string, string>();

async function getPluginIcon(pluginId: string): Promise<string> {
  // 1. 检查内存缓存
  if (iconCache.has(pluginId)) {
    return iconCache.get(pluginId)!;
  }

  // 2. 检查文件系统
  const iconPath = `src/plugins/${pluginId}/icon.svg`;
  if (await fs.exists(iconPath)) {
    const svg = await fs.readFile(iconPath, 'utf-8');
    iconCache.set(pluginId, svg);
    return svg;
  }

  // 3. 生成新图标
  const svg = await generatePluginIcon(pluginId);
  iconCache.set(pluginId, svg);
  return svg;
}
```

### 9.2 响应式断点
```css
/* 桌面 */
@media (min-width: 1200px) {
  .main-content { width: 70%; }
  .ai-assistant { width: 30%; }
}

/* 平板 */
@media (max-width: 1199px) {
  .main-content { width: 100%; }
  .ai-assistant { display: none; }
}

/* 手机 */
@media (max-width: 768px) {
  .tool-card { flex-direction: column; }
  .activate-button { width: 100%; }
}
```

## 十、验收标准

### 功能验收
- [ ] 所有插件图标显示在正确位置（工具列表左侧，Widget 右侧）
- [ ] 激活按钮在卡片右侧且功能正常
- [ ] SVG 图标自动生成并缓存
- [ ] 悬停效果流畅无卡顿

### 视觉验收
- [ ] 布局与 Muse 参考图相似度 > 80%
- [ ] 颜色方案统一
- [ ] 间距和圆角符合设计规范
- [ ] 响应式布局在不同屏幕尺寸下正常

### 性能验收
- [ ] 首屏加载时间 < 1s
- [ ] SVG 图标生成不阻塞 UI
- [ ] 动画帧率 > 60fps

---

**文档版本**：v1.0
**创建日期**：2025-11-18
**最后更新**：2025-11-18
**负责人**：ToolsHub Team
