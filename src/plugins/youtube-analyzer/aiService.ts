/**
 * BigModel AI 分析服务
 */
import axios from 'axios';

export interface AnalysisResult {
  summary: string;        // 阅读笔记
  mindMap: string;        // 思维导图（Markdown格式）
  keyPoints: string[];    // 重点分析
  insights: string;       // 个人认知
}

export interface AIServiceConfig {
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

const DEFAULT_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const DEFAULT_MODEL = 'glm-4-air';

/**
 * BigModel AI 服务类
 */
export class BigModelService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config: AIServiceConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || DEFAULT_API_URL;
    this.model = config.model || DEFAULT_MODEL;
  }

  /**
   * 调用 BigModel API
   */
  private async callAPI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API 调用失败: ${error.response.data?.error?.message || error.message}`);
      }
      throw new Error(`网络请求失败: ${error.message}`);
    }
  }

  /**
   * 生成阅读笔记
   */
  async generateSummary(transcript: string): Promise<string> {
    const prompt = `请基于以下YouTube视频的字幕内容，生成一份详细的阅读笔记。要求：
1. 总结视频的主要内容和核心观点
2. 按照逻辑结构组织内容
3. 使用清晰的段落和标题
4. 突出重要信息

字幕内容：
${transcript}

请以Markdown格式输出阅读笔记：`;

    return await this.callAPI(prompt);
  }

  /**
   * 生成思维导图
   */
  async generateMindMap(transcript: string): Promise<string> {
    const prompt = `请基于以下YouTube视频的字幕内容，生成一个思维导图。要求：
1. 提取主题和子主题的层级关系
2. 使用Markdown的列表格式表示
3. 最多3-4层嵌套
4. 每个节点简洁明了

字幕内容：
${transcript}

请以Markdown格式输出思维导图（使用- 和缩进表示层级）：`;

    return await this.callAPI(prompt);
  }

  /**
   * 生成重点分析
   */
  async generateKeyPoints(transcript: string): Promise<string[]> {
    const prompt = `请基于以下YouTube视频的字幕内容，提取5-10个关键要点。要求：
1. 每个要点应该是独立的观点或信息
2. 按重要性排序
3. 简洁明了，每个要点1-2句话

字幕内容：
${transcript}

请以JSON数组格式输出，例如：["要点1", "要点2", "要点3"]`;

    const result = await this.callAPI(prompt);

    try {
      // 尝试解析 JSON
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果不是 JSON 格式，尝试按行分割
      return result
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[\d\-\.\*\s]+/, '').trim())
        .filter(line => line.length > 0);
    } catch (error) {
      // 解析失败时返回原文本的行数组
      return result.split('\n').filter(line => line.trim());
    }
  }

  /**
   * 生成个人认知/深度思考
   */
  async generateInsights(transcript: string): Promise<string> {
    const prompt = `请基于以下YouTube视频的字幕内容，从以下角度进行深度分析：
1. 这个内容的深层含义和价值
2. 可能存在的不同观点或争议
3. 对观众的启发和实际应用
4. 相关的扩展思考

字幕内容：
${transcript}

请以Markdown格式输出深度分析：`;

    return await this.callAPI(prompt);
  }

  /**
   * 完整分析（并行执行所有分析任务）
   */
  async analyzeVideo(transcript: string): Promise<AnalysisResult> {
    try {
      const [summary, mindMap, keyPoints, insights] = await Promise.all([
        this.generateSummary(transcript),
        this.generateMindMap(transcript),
        this.generateKeyPoints(transcript),
        this.generateInsights(transcript),
      ]);

      return {
        summary,
        mindMap,
        keyPoints,
        insights,
      };
    } catch (error: any) {
      throw new Error(`AI 分析失败: ${error.message}`);
    }
  }
}
