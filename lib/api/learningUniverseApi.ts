export interface GenerateRoadmapParams {
  mentorId: string;
  canvasId?: string;
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
        canvas_id: params.canvasId,
        goal: goal,
        preferred_model: preferredModel,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (value) {
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
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
              console.error('Failed to parse SSE JSON:', e);
            }
          }
        }
      }

      if (done) {
        if (buffer.trim().startsWith('data: ')) {
           try {
             const data = JSON.parse(buffer.trim().slice(6));
             if (data.type === 'done') onDone?.();
           } catch(e) {}
        }
        break;
      }
    }
  } catch (error: any) {
    onError?.(error.message || 'Stream failed');
  }
};
