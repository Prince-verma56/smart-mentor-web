/**
 * NodeExpansionService
 * 
 * Given a single node ID, expands it into a set of deeper subtopic nodes.
 * Mock implementation — replace internals with LangGraph in Phase 15.
 * Interface remains identical.
 */

import { LearningNodeType, LearningEdgeData } from '@/stores/learningUniverseStore';
import { Edge } from '@xyflow/react';

export interface NodeExpansionRequest {
  parentNodeId: string;
  parentTitle: string;
  parentType: string;
  depth?: number;           // How many levels to expand (default: 1)
  maxChildren?: number;     // Max subtopics to generate (default: 4)
  mentor_id: string;
}

export interface NodeExpansionResult {
  nodes: LearningNodeType[];
  edges: Edge<LearningEdgeData>[];
}

// Mock subtopic templates for expansion
const EXPANSION_TEMPLATES: Record<string, string[]> = {
  default: ['Introduction', 'Core Concepts', 'Practical Application', 'Advanced Topics', 'Common Pitfalls'],
  topic: ['Overview', 'Fundamentals', 'Deep Dive', 'Practice', 'Projects'],
  concept: ['Definition', 'Theory', 'Examples', 'Edge Cases', 'Interview Questions'],
  lesson: ['Setup', 'Step 1', 'Step 2', 'Exercises', 'Quiz'],
};

export class NodeExpansionService {
  /**
   * Expand a node into subtopics.
   * Swap this implementation for a LangGraph API call in Phase 15.
   */
  static async expand(request: NodeExpansionRequest): Promise<NodeExpansionResult> {
    const { parentNodeId, parentTitle, parentType, depth = 1, maxChildren = 4 } = request;
    
    // Simulate async AI call
    await new Promise(r => setTimeout(r, 600));
    
    const templates = EXPANSION_TEMPLATES[parentType] || EXPANSION_TEMPLATES.default;
    const selected = templates.slice(0, maxChildren);
    
    const timestamp = Date.now();
    const nodes: LearningNodeType[] = selected.map((title, i) => ({
      id: `${parentNodeId}-exp-${i}-${timestamp}`,
      type: 'learningNode' as const,
      position: { x: 0, y: 0 },
      data: {
        title: `${parentTitle}: ${title}`,
        description: `An expanded subtopic of ${parentTitle} focusing on ${title.toLowerCase()}.`,
        type: 'subtopic' as const,
        status: 'locked' as const,
        difficulty: 'intermediate' as const,
        xp: 30,
        estimated_time: 30,
        graph_level: 3,
        learning_order: i + 1,
        parent_node_id: parentNodeId,
        tags: [parentTitle.toLowerCase().replace(/\s+/g, '-'), title.toLowerCase().replace(/\s+/g, '-')],
        metadata: { source: 'expansion', expandedFrom: parentNodeId, createdAt: new Date().toISOString() },
      },
    }));

    const edges: Edge<LearningEdgeData>[] = nodes.map((n, i) => ({
      id: `e-${parentNodeId}-${n.id}`,
      source: i === 0 ? parentNodeId : nodes[i - 1].id,
      target: n.id,
      type: 'semanticEdge',
      animated: false,
      data: {
        semanticType: i === 0 ? 'unlock' : 'prerequisite' as any,
        reason: `${i === 0 ? 'Parent' : 'Previous'} step unlocks this subtopic`,
        weight: 0.8,
        confidence: 0.85,
        priority: 'medium' as any,
        dependency_strength: 'moderate' as any,
        metadata: { source: 'expansion' },
      },
    }));

    return { nodes, edges };
  }
}
