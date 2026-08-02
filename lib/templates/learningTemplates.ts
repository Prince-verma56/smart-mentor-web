import { LearningNodeType, LearningEdgeData } from '@/stores/learningUniverseStore';
import { Edge } from '@xyflow/react';

export interface LearningTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  nodes: LearningNodeType[];
  edges: Edge<LearningEdgeData>[];
}

export const builtInTemplates: LearningTemplate[] = [
  {
    id: 'template-interview-prep',
    name: 'Interview Preparation',
    description: 'A comprehensive roadmap for acing technical interviews including Data Structures, System Design, and Behavioral rounds.',
    tags: ['Interview', 'DSA', 'System Design'],
    nodes: [
      {
        id: 'n-1',
        position: { x: 0, y: 0 },
        type: 'learningNode',
        data: {
          title: 'Technical Interviews',
          type: 'core',
          status: 'unlocked',
          difficulty: 'intermediate',
          description: 'Master the core concepts required for software engineering interviews.'
        }
      },
      {
        id: 'n-2',
        position: { x: -200, y: 200 },
        type: 'learningNode',
        data: {
          title: 'Data Structures & Algorithms',
          type: 'topic',
          status: 'locked',
          difficulty: 'advanced',
          description: 'Arrays, Strings, Trees, Graphs, DP, and more.'
        }
      },
      {
        id: 'n-3',
        position: { x: 200, y: 200 },
        type: 'learningNode',
        data: {
          title: 'System Design',
          type: 'topic',
          status: 'locked',
          difficulty: 'advanced',
          description: 'Scalability, Load Balancing, Microservices, and Databases.'
        }
      }
    ],
    edges: [
      {
        id: 'e-1-2',
        source: 'n-1',
        target: 'n-2',
        type: 'semanticEdge',
        data: { semanticType: 'dependency' }
      },
      {
        id: 'e-1-3',
        source: 'n-1',
        target: 'n-3',
        type: 'semanticEdge',
        data: { semanticType: 'dependency' }
      }
    ]
  },
  {
    id: 'template-fullstack',
    name: 'Full Stack Web Dev',
    description: 'Learn modern web development from frontend to backend to deployment.',
    tags: ['Web', 'React', 'Node.js'],
    nodes: [
      {
        id: 'n-1',
        position: { x: 0, y: 0 },
        type: 'learningNode',
        data: {
          title: 'Full Stack Development',
          type: 'core',
          status: 'unlocked',
          difficulty: 'intermediate',
        }
      },
      {
        id: 'n-2',
        position: { x: -200, y: 200 },
        type: 'learningNode',
        data: {
          title: 'Frontend (React)',
          type: 'topic',
          status: 'locked',
          difficulty: 'intermediate',
        }
      },
      {
        id: 'n-3',
        position: { x: 200, y: 200 },
        type: 'learningNode',
        data: {
          title: 'Backend (Node & DBs)',
          type: 'topic',
          status: 'locked',
          difficulty: 'intermediate',
        }
      }
    ],
    edges: [
      { id: 'e-1-2', source: 'n-1', target: 'n-2', type: 'semanticEdge', data: { semanticType: 'dependency' } },
      { id: 'e-1-3', source: 'n-1', target: 'n-3', type: 'semanticEdge', data: { semanticType: 'dependency' } }
    ]
  }
];
