/**
 * RoadmapPayload — the exact structured schema sent to LangGraph.
 * 
 * When AI is connected, this payload is assembled on the frontend
 * and sent to the backend planning pipeline. The mock implementation
 * uses this schema to simulate realistic responses.
 */

export interface RoadmapPayload {
  // Core goal
  goal: string;                         // e.g. "Become a fullstack developer"
  career_goal?: string;                  // e.g. "Senior Software Engineer at FAANG"
  
  // Learner profile
  current_skill: 'none' | 'beginner' | 'intermediate' | 'advanced';
  learning_style: 'visual' | 'reading' | 'practice' | 'mixed';
  difficulty_preference: 'easy' | 'balanced' | 'challenging';
  
  // Time constraints
  available_hours_per_week: number;
  target_completion_weeks?: number;
  
  // Preferences
  preferred_language?: string;           // e.g. "Python", "TypeScript"
  preferred_framework?: string;          // e.g. "React", "FastAPI"
  include_projects: boolean;
  include_revision: boolean;
  include_interview_prep: boolean;
  
  // Existing context
  existing_node_ids?: string[];          // Nodes already on this canvas
  completed_node_ids?: string[];         // Nodes the user has completed
  
  // Resources
  preferred_resource_types?: ('video' | 'article' | 'book' | 'course' | 'documentation')[];
  budget_preference?: 'free' | 'paid' | 'mixed';
  
  // Canvas context
  canvas_id?: string;
  mentor_id: string;
}

/**
 * GraphResult — the output from the planning pipeline.
 * Both mock and real LangGraph return this same shape.
 */
export interface GraphResult {
  nodes: any[];  // LearningNodeType[]
  edges: any[];  // Edge<LearningEdgeData>[]
  metadata: {
    domain: string;
    total_learning_hours: number;
    total_xp: number;
    node_count: number;
    edge_count: number;
    generated_at: string;
    generator: 'mock' | 'langgraph';
    pipeline_stages_completed: string[];
  };
}

/**
 * LearningPlanner — orchestrates AI or mock roadmap generation.
 * Replace `mockGenerate` with LangGraph call in Phase 15.
 */
export class LearningPlanner {
  static createDefaultPayload(mentorId: string, goal: string): RoadmapPayload {
    return {
      goal,
      mentor_id: mentorId,
      current_skill: 'beginner',
      learning_style: 'mixed',
      difficulty_preference: 'balanced',
      available_hours_per_week: 10,
      include_projects: true,
      include_revision: true,
      include_interview_prep: false,
    };
  }

  static validatePayload(payload: Partial<RoadmapPayload>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!payload.goal || payload.goal.trim().length < 3) errors.push('Goal is required');
    if (!payload.mentor_id) errors.push('Mentor ID is required');
    if (!payload.current_skill) errors.push('Current skill level is required');
    if (!payload.available_hours_per_week || payload.available_hours_per_week < 1) errors.push('Must have at least 1 hour/week');
    return { valid: errors.length === 0, errors };
  }

  /**
   * Placeholder — will be replaced with actual LangGraph SSE stream in Phase 15.
   * The frontend streaming infrastructure is already in place via mockGenerateLearningUniverseStream.
   */
  static async generate(payload: RoadmapPayload, callbacks: {
    onStatus?: (msg: string) => void;
    onNodeAdded?: (node: any) => void;
    onEdgeAdded?: (edge: any) => void;
    onComplete?: (result: GraphResult) => void;
    onError?: (err: string) => void;
  }): Promise<void> {
    const { mockGenerateLearningUniverseStream } = await import('@/lib/api/mockLearningUniverseGenerator');
    
    return mockGenerateLearningUniverseStream({
      mentorId: payload.mentor_id,
      goal: "Generate a comprehensive roadmap",
      onStatusUpdate: callbacks.onStatus,
      onChunk: (chunk: string) => {
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.type === 'node') callbacks.onNodeAdded?.(parsed.data);
          if (parsed.type === 'edge') callbacks.onEdgeAdded?.(parsed.data);
          if (parsed.type === 'complete') {
            callbacks.onComplete?.({
              nodes: parsed.data.nodes,
              edges: parsed.data.edges,
              metadata: {
                domain: 'Fullstack Development',
                total_learning_hours: 0,
                total_xp: 0,
                node_count: parsed.data.nodes?.length || 0,
                edge_count: parsed.data.edges?.length || 0,
                generated_at: new Date().toISOString(),
                generator: 'mock',
                pipeline_stages_completed: ['domain_analyzer', 'topic_planner', 'subtopic_planner', 'relationship_planner', 'milestone_planner', 'project_planner', 'revision_planner'],
              }
            });
          }
        } catch {}
      },
      onDone: () => {},
      onError: callbacks.onError,
    });
  }
}
