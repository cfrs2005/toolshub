/**
 * YouTube 字幕下载服务
 */

export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

export interface VideoInfo {
  videoId: string;
  url: string;
  transcript: string;
  transcriptItems: TranscriptItem[];
}

/**
 * 从 YouTube URL 中提取视频 ID
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 如果输入的就是视频 ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * 获取 YouTube 视频的字幕
 */
export async function fetchTranscript(videoUrl: string, proxyUrl?: string): Promise<VideoInfo> {
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    throw new Error('无效的 YouTube 视频链接');
  }

  try {
    // 使用主进程的 API 获取字幕（支持代理）
    const transcriptItems = await window.electronAPI.youtube.fetchTranscript(videoId, proxyUrl);

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error('该视频没有可用的字幕');
    }

    // 合并所有字幕文本
    const transcript = transcriptItems
      .map((item: any) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      transcript,
      transcriptItems: transcriptItems.map((item: any) => ({
        text: item.text,
        offset: item.offset,
        duration: item.duration,
      })),
    };
  } catch (error: any) {
    if (error.message?.includes('Could not find')) {
      throw new Error('无法获取视频字幕，可能该视频没有字幕或字幕不可用');
    }
    throw new Error(`获取字幕失败: ${error.message}`);
  }
}

/**
 * 格式化时间戳（毫秒转为 HH:MM:SS 格式）
 */
export function formatTimestamp(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
