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
    let doneCalled = false;

    const processLine = (line: string) => {
      if (!line.startsWith('data: ')) return;
      const dataStr = line.slice(6).trim();
      if (!dataStr) return;
      try {
        const data = JSON.parse(dataStr);
        if (data.type === 'status') {
          onStatusUpdate?.(`Executing: ${data.node}`);
        } else if (data.type === 'chunk') {
          onChunk?.(data.content);
        } else if (data.type === 'error') {
          if (!doneCalled) {
            doneCalled = true;
            onError?.(data.message);
          }
        } else if (data.type === 'done') {
          if (!doneCalled) {
            doneCalled = true;
            onDone?.();
          }
        }
      } catch (e) {
        console.error('Failed to parse SSE JSON:', e, dataStr);
      }
    };

    while (true) {
      const { done, value } = await reader.read();

      if (value) {
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          processLine(line);
        }
      }

      if (done) {
        // Process any remaining data left in the buffer
        if (buffer.trim()) {
          processLine(buffer.trim());
        }
        // CRITICAL: Always fire onDone when the stream physically ends,
        // even if the backend never sent a "done" event (e.g., on network drop).
        // This prevents the canvas from being permanently stuck in "generating" state.
        if (!doneCalled) {
          doneCalled = true;
          onDone?.();
        }
        break;
      }
    }
  } catch (error: any) {
    onError?.(error.message || 'Stream failed');
  }
};
