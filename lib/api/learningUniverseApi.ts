export interface GenerateRoadmapParams {
  mentorId: string;
  goal: string;
  preferredModel?: string;
  onStatusUpdate?: (status: string) => void;
  onChunk?: (chunk: string) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export const generateLearningUniverseStream = async (params: GenerateRoadmapParams) => {
  const { mentorId, goal, preferredModel, onStatusUpdate, onChunk, onError, onDone } = params;

  try {
    const response = await fetch('/api/learning-universe/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mentor_id: mentorId,
        goal: goal,
        preferred_model: preferredModel,
      }),
    });

    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      const lines = chunkStr.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'status') {
              onStatusUpdate?.(`Executing: ${data.node}`);
            } else if (data.type === 'chunk') {
              onChunk?.(data.content);
            } else if (data.type === 'error') {
              onError?.(data.message);
            } else if (data.type === 'done') {
              onDone?.();
            }
          } catch (e) {
            // Might be incomplete JSON chunk if chunked unexpectedly, but SSE usually ensures full messages per line
            console.error('Failed to parse SSE JSON:', e);
          }
        }
      }
    }
  } catch (error: any) {
    onError?.(error.message || 'Stream failed');
  }
};
