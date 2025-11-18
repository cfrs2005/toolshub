// 历史记录项类型定义

export interface HistoryItem {
  id: string;
  pluginId: string;
  pluginName: string;
  pluginIcon: string;
  title: string;
  thumbnail?: string;
  timestamp: number;
  summary: string;
  result: any;
  config?: Record<string, any>;
}

export interface WorkspaceState {
  activePluginId: string | null;
  mode: 'welcome' | 'new' | 'history';
  historyId: string | null;
  config: Record<string, any>;
  status: 'idle' | 'loading' | 'processing' | 'completed' | 'error';
  error: string | null;
  messages: InteractionMessage[];
}

export interface InteractionMessage {
  id: string;
  type: 'user' | 'system' | 'success' | 'error' | 'progress';
  content: string;
  timestamp: number;
  metadata?: {
    progress?: number;
    result?: any;
  };
}
