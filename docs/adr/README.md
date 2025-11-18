# Architecture Decision Records (ADR)

本目录包含 ToolsHub 项目的架构决策记录。

## 什么是 ADR？

架构决策记录（ADR）是一种轻量级的文档，用于记录重要的架构决策，包括决策的背景、考虑的方案和最终的选择理由。

## ADR 格式

每个 ADR 包含以下部分：

- **标题**: 简短描述决策
- **状态**: proposed（提议中）/ accepted（已接受）/ deprecated（已废弃）/ superseded（已被替代）
- **背景**: 导致这个决策的情况和问题
- **决策**: 做出的具体决策
- **后果**: 决策带来的正面和负面影响

## ADR 列表

| 编号 | 标题 | 状态 | 日期 |
|------|------|------|------|
| [001](001-plugin-system-architecture.md) | 插件系统架构设计 | accepted | 2025-11-18 |
| [002](002-dynamic-plugin-registry.md) | 动态插件注册表生成 | accepted | 2025-11-18 |

## 如何添加新的 ADR

1. 复制 `template.md` 模板
2. 按照 `NNN-title.md` 格式命名（NNN 为递增序号）
3. 填写所有必要部分
4. 更新本 README 中的 ADR 列表
5. 提交 PR 进行评审

## 参考资料

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard 的 ADR 文章](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
