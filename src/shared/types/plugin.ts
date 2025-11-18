/**
 * 插件元数据定义
 */
export interface PluginManifest {
  /** 插件唯一标识 */
  id: string;
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 插件描述 */
  description: string;
  /** 插件作者 */
  author: string;
  /** 插件图标 (可选) */
  icon?: string;
  /** 插件入口文件 */
  entry: string;
  /** Widget 组件文件 (可选) - 用于在首页展示插件摘要 */
  widget?: string;
  /** Widget 展示样式 (可选) */
  widgetStyle?: 'gallery' | 'list' | 'card';
  /** 插件类型 */
  type: 'tool' | 'service' | 'widget';
  /** 插件所需权限 */
  permissions?: PluginPermission[];
  /** 插件依赖 */
  dependencies?: string[];
}

/**
 * 插件权限类型
 */
export type PluginPermission =
  | 'file-system'     // 文件系统访问
  | 'network'         // 网络访问
  | 'database'        // 数据库访问
  | 'clipboard'       // 剪贴板访问
  | 'notifications';  // 通知权限

/**
 * 插件实例接口
 */
export interface Plugin {
  manifest: PluginManifest;
  /** 插件激活时调用 */
  activate(): Promise<void>;
  /** 插件停用时调用 */
  deactivate(): Promise<void>;
  /** 渲染插件 UI */
  render(): React.ComponentType;
  /** 渲染 Widget 组件 (可选) */
  renderWidget?(): React.ComponentType<WidgetProps>;
}

/**
 * Widget 组件属性
 */
export interface WidgetProps {
  /** 插件 ID */
  pluginId: string;
  /** 点击 Widget 时的回调 */
  onNavigate?: (pluginId: string) => void;
}

/**
 * 插件上下文 - 提供给插件的 API
 */
export interface PluginContext {
  /** 获取插件数据存储 */
  getStorage(): PluginStorage;
  /** 显示通知 */
  showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;
  /** 打开文件选择对话框 */
  openFileDialog(options?: FileDialogOptions): Promise<string[] | null>;
  /** 保存文件对话框 */
  saveFileDialog(options?: SaveDialogOptions): Promise<string | null>;
  /** 发送 HTTP 请求 */
  fetch(url: string, options?: RequestInit): Promise<Response>;
}

/**
 * 插件数据存储接口
 */
export interface PluginStorage {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
}

/**
 * 文件对话框选项
 */
export interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: { name: string; extensions: string[] }[];
  properties?: ('openFile' | 'openDirectory' | 'multiSelections')[];
}

/**
 * 保存对话框选项
 */
export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: { name: string; extensions: string[] }[];
}

/**
 * 消息类型
 */
export type MessageType = 'user' | 'system' | 'success' | 'error' | 'progress';

/**
 * 交互面板消息
 */
export interface InteractionMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  metadata?: {
    progress?: number; // 0-100
    actionButton?: {
      label: string;
      action: string;
    };
  };
}

/**
 * 插件交互面板状态
 */
export type InteractionStatus = 'idle' | 'processing' | 'completed' | 'error';

/**
 * 插件交互面板配置
 */
export interface PluginInteractionConfig {
  /** 输入框占位符 */
  inputPlaceholder?: string;
  /** 是否显示输入框 */
  showInput?: boolean;
  /** 欢迎消息 */
  welcomeMessage?: string;
}
