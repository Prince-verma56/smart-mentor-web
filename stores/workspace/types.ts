import { Edge, Node, Viewport } from '@xyflow/react';

export type NodeStatus = 'locked' | 'unlocked' | 'in-progress' | 'completed' | 'skipped';

export type NodeType = 
  | 'topic' | 'lesson' | 'concept' | 'quiz' | 'flashcards' 
  | 'practice' | 'project' | 'ai_challenge' | 'interview' 
  | 'revision' | 'milestone' | 'bookmark' | 'notes' 
  | 'resource' | 'certificate' | 'subtopic' | 'mini_project' | 'core';

// Semantic edge types — each has a specific meaning in the learning graph
export type EdgeSemanticType = 
  | 'PREREQUISITE' | 'DEPENDS_ON' | 'PART_OF' 
  | 'PRACTICE_FOR' | 'PROJECT_FOR' | 'LEADS_TO'
  // Fallbacks for legacy/local edges
  | 'prerequisite' | 'dependency' | 'unlock' | 'optional' 
  | 'recommended' | 'parallel' | 'alternative' | 'revision' 
  | 'project_requirement' | 'interview_requirement' | 'challenge' 
  | 'reference' | 'knowledge_bridge';

export interface NodeResource {
  id: string;
  title: string;
  url?: string;
  type: 'video' | 'article' | 'book' | 'course' | 'documentation' | 'exercise' | 'tool';
  description?: string;
  duration_minutes?: number;
  is_free?: boolean;
}

export interface NodeAIContent {
  summary?: string;
  explanation?: string;
  examples?: string[];
  code_snippets?: string[];
  memory_references?: string[];
  key_concepts?: string[];
}

export type LearningNodeData = {
  title: string;
  description?: string;
  summary?: string;
  type: NodeType;
  nodeCategory?: 'DOMAIN' | 'CATEGORY' | 'FOUNDATION' | 'CORE_CONCEPT' | 'ADVANCED_CONCEPT' | 'PRACTICE' | 'PROJECT' | 'MILESTONE' | 'ASSESSMENT' | 'RESOURCE';
  learningStage?: 'foundation' | 'core' | 'specialization' | 'project' | 'career'; // The learning journey stage
  status: NodeStatus;
  progress?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  
  // Learning graph structure
  graph_level?: number;      // 0 = root/milestone, 1 = topic, 2 = subtopic, 3 = leaf
  graph_depth?: number;      // Distance from root
  parent_node_id?: string;
  children_ids?: string[];
  learning_order?: number;   // Sequential order among siblings
  
  // Gamification
  xp?: number;
  xp_reward?: number;
  estimated_time?: number;   // in minutes
  
  tags?: string[];
  prerequisites?: string[];
  resources?: NodeResource[];
  ai_content?: NodeAIContent;
  metadata?: Record<string, any>;
};

export type LearningNodeType = Node<LearningNodeData>;

export type LearningEdgeData = {
  semanticType: EdgeSemanticType;
  label?: string;
  
  // Intelligence metadata — AI will populate these
  reason?: string;             // Why this relationship exists
  priority?: 'low' | 'medium' | 'high' | 'critical';
  weight?: number;             // 0-1, strength of relationship
  confidence?: number;         // 0-1, AI confidence in this relationship
  learning_order?: number;     // Order in which to traverse edges
  dependency_strength?: 'weak' | 'moderate' | 'strong' | 'required';
  
  metadata?: Record<string, any>;
};

export type LayoutMode = 'free' | 'hierarchy' | 'mindmap' | 'timeline' | 'radial';
export type ThemeMode = 'cyber' | 'minimal' | 'education' | 'glass' | 'dark' | 'professional';

export interface GraphHistoryState {
  nodes: LearningNodeType[];
  edges: Edge<LearningEdgeData>[];
}

// ─── Graph Statistics ─────────────────────────────────────────────────────────

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  completedNodes: number;
  inProgressNodes: number;
  lockedNodes: number;
  totalXP: number;
  earnedXP: number;
  totalHours: number;
  completionPercentage: number;
  branchCount: number;
  projectCount: number;
  milestoneCount: number;
  difficultyBreakdown: { beginner: number; intermediate: number; advanced: number };
  typeBreakdown: Record<string, number>;
}

export const calculateGraphStats = (nodes: LearningNodeType[], edges: Edge<LearningEdgeData>[]): GraphStats => {
  const completed = nodes.filter(n => n.data.status === 'completed');
  const inProgress = nodes.filter(n => n.data.status === 'in-progress');
  const typeBreakdown: Record<string, number> = {};
  nodes.forEach(n => { typeBreakdown[n.data.type] = (typeBreakdown[n.data.type] || 0) + 1; });
  const outDegree: Record<string, number> = {};
  edges.forEach(e => { outDegree[e.source] = (outDegree[e.source] || 0) + 1; });
  
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    completedNodes: completed.length,
    inProgressNodes: inProgress.length,
    lockedNodes: nodes.filter(n => n.data.status === 'locked').length,
    totalXP: nodes.reduce((sum, n) => sum + (n.data.xp || 0), 0),
    earnedXP: completed.reduce((sum, n) => sum + (n.data.xp || 0), 0),
    totalHours: Math.round(nodes.reduce((sum, n) => sum + (n.data.estimated_time || 0), 0) / 60),
    completionPercentage: nodes.length > 0 ? Math.round((completed.length / nodes.length) * 100) : 0,
    branchCount: Object.values(outDegree).filter(d => d > 1).length,
    projectCount: nodes.filter(n => n.data.type === 'project' || n.data.type === 'mini_project').length,
    milestoneCount: nodes.filter(n => n.data.type === 'milestone').length,
    difficultyBreakdown: {
      beginner: nodes.filter(n => n.data.difficulty === 'beginner').length,
      intermediate: nodes.filter(n => n.data.difficulty === 'intermediate').length,
      advanced: nodes.filter(n => n.data.difficulty === 'advanced').length,
    },
    typeBreakdown,
  };
};

// ─── Hierarchy Numbering ──────────────────────────────────────────────────────

export const calculateHierarchy = (nodes: LearningNodeType[], edges: Edge<LearningEdgeData>[]): LearningNodeType[] => {
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  nodes.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });
  
  const roots = nodes.filter(n => inDegree[n.id] === 0);
  roots.sort((a, b) => (a.data.learning_order ?? 999) - (b.data.learning_order ?? 999) || ((a.position?.y ?? 0) - (b.position?.y ?? 0)));
  
  const hierarchyMap: Record<string, string> = {};
  let standardCounter = 1;
  let projectCounter = 1;
  let challengeCounter = 1;
  let optionalCounter = 1;

  const getPrefix = (node: LearningNodeType) => {
    if (node.data.metadata?.optional) return `O${optionalCounter++}`;
    if (node.data.type === 'project' || node.data.type === 'mini_project') return `P${projectCounter++}`;
    if (node.data.type === 'ai_challenge') return `C${challengeCounter++}`;
    return String(standardCounter++).padStart(2, '0');
  };
  
  roots.forEach(r => { hierarchyMap[r.id] = getPrefix(r); });
  
  const queue = [...roots];
  const visited = new Set<string>();
  
  while(queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr.id)) continue;
    visited.add(curr.id);
    
    const childNodes = (adj[curr.id] || [])
      .map(cid => nodes.find(n => n.id === cid))
      .filter(Boolean) as LearningNodeType[];
    childNodes.sort((a, b) => (a.data.learning_order ?? 999) - (b.data.learning_order ?? 999));
    
    let childIndex = 1;
    for (const child of childNodes) {
      if (!hierarchyMap[child.id]) {
        if (child.data.type === 'project' || child.data.type === 'mini_project') hierarchyMap[child.id] = `P${projectCounter++}`;
        else if (child.data.type === 'ai_challenge') hierarchyMap[child.id] = `C${challengeCounter++}`;
        else if (child.data.metadata?.optional) hierarchyMap[child.id] = `O${optionalCounter++}`;
        else hierarchyMap[child.id] = `${hierarchyMap[curr.id]}.${childIndex++}`;
        queue.push(child);
      }
    }
  }
  
  for (const n of nodes) {
    if (!hierarchyMap[n.id]) hierarchyMap[n.id] = getPrefix(n);
  }
  
  return nodes.map(n => ({
    ...n,
    data: { ...n.data, metadata: { ...n.data.metadata, hierarchyIndex: hierarchyMap[n.id] } }
  }));
};


