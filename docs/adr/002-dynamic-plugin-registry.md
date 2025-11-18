# ADR-002: 动态插件注册表生成

## 状态

accepted

## 背景

在 ADR-001 确定的双层架构中，渲染进程需要一个插件注册表来映射插件 ID 到 React 组件。

最初实现使用硬编码的静态导入：

```typescript
// 手动维护的映射
export const pluginComponents = {
  'example-counter': ExampleCounter,
  'example-downloader': ExampleDownloader,
};
```

这种方式存在问题：

1. 添加新插件需要手动修改注册表
2. 容易遗漏或出错
3. 插件 ID 和导入路径可能不一致
4. 无法自动包含 Widget 组件

## 决策

实现 **构建时自动生成插件注册表**：

1. 创建 `scripts/generate-plugin-registry.ts` 脚本
2. 扫描 `src/plugins/` 目录读取所有 `manifest.json`
3. 自动生成 `src/renderer/pluginRegistry.tsx`
4. 在 `npm run dev` 和 `npm run build` 时自动执行

生成的注册表包含：
- 所有插件组件的导入
- Widget 组件的导入（如果有）
- 插件和 Widget 的 ID 映射
- 辅助函数（查询、检查注册状态等）

## 考虑的方案

### 方案 A: 保持手动维护

继续手动维护 pluginRegistry.tsx。

**优点:**
- 无需额外工具
- 完全控制注册内容

**缺点:**
- 容易出错
- 开发体验差
- 不可扩展

### 方案 B: 运行时动态导入

使用 Vite 的 `import.meta.glob` 或动态 import。

```typescript
const modules = import.meta.glob('../plugins/*/index.tsx');
```

**优点:**
- 真正的动态加载
- 无需代码生成

**缺点:**
- 类型安全性差
- 无法在构建时验证插件
- 难以处理不同的导出格式

### 方案 C: 构建时代码生成（已选择）

通过脚本扫描插件目录，生成类型安全的注册表。

**优点:**
- 完整的类型安全
- 构建时验证
- 生成的代码清晰可读
- 可以自动处理 Widget 等可选特性

**缺点:**
- 需要在构建前运行生成脚本
- 生成的文件需要纳入版本控制（或 .gitignore）

## 后果

### 正面影响

- 添加新插件只需创建目录和 manifest.json
- 自动发现和注册 Widget 组件
- 构建时捕获错误（缺失的导出等）
- 生成的代码包含时间戳，便于追踪

### 负面影响

- 开发者需要知道运行 `npm run generate:plugins`
- 生成的文件可能造成 git 冲突（已通过注释警告缓解）

### 中性影响

- `dev` 和 `build` 命令需要先执行生成脚本
- 需要 `ts-node` 作为开发依赖

## 实现细节

生成脚本的关键逻辑：

1. 扫描 `src/plugins/*/manifest.json`
2. 验证必需字段（id, name, version, entry）
3. 检测可选的 widget 配置
4. 将 kebab-case ID 转换为 PascalCase 变量名
5. 生成带有完整类型注解的 TypeScript 代码

## 参考资料

- [Vite Glob Import](https://vitejs.dev/guide/features.html#glob-import)
- [TypeScript Code Generation Patterns](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html)
