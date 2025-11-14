# YouTube 视频分析工具

基于 AI 的 YouTube 视频内容分析工具，可以自动获取视频字幕并生成智能分析报告。

## 功能特性

- 🎬 **自动获取字幕** - 支持任何有字幕的 YouTube 视频
- 🤖 **AI 智能分析** - 使用 BigModel GLM-4-Air 进行深度分析
- 📊 **多维度报告** - 生成阅读笔记、思维导图、重点分析、深度思考
- 💾 **HTML 导出** - 精美的 HTML 报告，可下载和分享
- ⚡ **高效处理** - 并行调用 AI 接口，快速生成报告

## 使用方法

### 1. 配置 API Key

1. 访问 [BigModel 开放平台](https://open.bigmodel.cn/)
2. 注册并获取 API Key
3. 在工具中输入 API Key 并保存

### 2. 分析视频

1. 复制 YouTube 视频链接
2. 粘贴到输入框中
3. 点击"开始分析"
4. 等待分析完成（通常需要 1-3 分钟）

### 3. 查看报告

分析完成后，你可以：
- 👁️ **预览报告** - 在新窗口中查看
- 💾 **下载报告** - 保存为 HTML 文件

## 报告内容

生成的报告包含以下部分：

### 📝 阅读笔记
- 视频内容的详细总结
- 按逻辑结构组织
- 突出核心观点

### 🗺️ 思维导图
- 内容的层级结构
- 主题和子主题关系
- 便于理解整体框架

### ⭐ 重点分析
- 提取 5-10 个关键要点
- 按重要性排序
- 简洁明了

### 💡 深度思考
- 内容的深层含义
- 不同观点和启发
- 实际应用建议

## 支持的视频格式

- ✅ YouTube 标准视频链接: `https://www.youtube.com/watch?v=xxxxx`
- ✅ YouTube 短链接: `https://youtu.be/xxxxx`
- ✅ 直接输入视频 ID: `xxxxx`

## 注意事项

1. **字幕要求**: 视频必须有可用的字幕（自动生成或手动添加）
2. **API 配额**: BigModel API 有使用配额限制，请合理使用
3. **网络要求**: 需要稳定的网络连接
4. **分析时间**: 根据视频长度，分析可能需要 1-5 分钟

## 技术架构

```
youtube-analyzer/
├── manifest.json          # 插件清单
├── package.json           # 依赖配置
├── index.tsx              # 主界面组件
├── youtubeService.ts      # YouTube 字幕下载服务
├── aiService.ts           # BigModel AI 分析服务
├── reportGenerator.ts     # HTML 报告生成器
└── README.md              # 说明文档
```

## 依赖项

- `youtube-transcript` - YouTube 字幕获取
- `axios` - HTTP 请求库

## 许可证

MIT License

## 问题反馈

如遇到问题，请检查：
1. YouTube 视频链接是否正确
2. 视频是否有可用字幕
3. API Key 是否有效
4. 网络连接是否正常
