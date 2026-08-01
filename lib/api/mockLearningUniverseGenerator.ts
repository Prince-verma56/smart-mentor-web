import { GenerateRoadmapParams } from './learningUniverseApi';
import { LearningNodeType, LearningEdgeData } from '@/stores/learningUniverseStore';
import { Edge } from '@xyflow/react';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_NODES: any[] = [
  {
    id: 'foundation',
    title: 'Foundation',
    description: 'Start your journey here by understanding the core principles.',
    type: 'milestone',
    status: 'completed',
    difficulty: 'beginner',
    xp: 50,
    estimated_time: 30,
    tags: ['basics', 'core']
  },
  {
    id: 'frontend',
    title: 'Frontend Mastery',
    description: 'Learn modern UI development with React and Next.js.',
    type: 'topic',
    status: 'in-progress',
    difficulty: 'intermediate',
    xp: 150,
    estimated_time: 120,
    tags: ['react', 'nextjs', 'ui']
  },
  {
    id: 'backend',
    title: 'Backend Systems',
    description: 'API design, databases, and server logic.',
    type: 'topic',
    status: 'unlocked',
    difficulty: 'intermediate',
    xp: 200,
    estimated_time: 180,
    tags: ['api', 'database', 'server']
  },
  {
    id: 'database',
    title: 'Database Architecture',
    description: 'SQL vs NoSQL, caching, and optimization.',
    type: 'lesson',
    status: 'locked',
    difficulty: 'advanced',
    xp: 300,
    estimated_time: 240,
    tags: ['sql', 'nosql', 'redis']
  },
  {
    id: 'auth',
    title: 'Authentication & Security',
    description: 'JWT, OAuth, and securing your applications.',
    type: 'concept',
    status: 'locked',
    difficulty: 'advanced',
    xp: 150,
    estimated_time: 90,
    tags: ['security', 'jwt', 'oauth']
  },
  {
    id: 'projects',
    title: 'Fullstack Portfolio Project',
    description: 'Build a complete SaaS application from scratch.',
    type: 'project',
    status: 'locked',
    difficulty: 'advanced',
    xp: 500,
    estimated_time: 600,
    tags: ['portfolio', 'saas', 'fullstack']
  }
];

const MOCK_EDGES: any[] = [
  { id: 'e-found-front', source: 'foundation', target: 'frontend', type: 'prerequisite' },
  { id: 'e-found-back', source: 'foundation', target: 'backend', type: 'prerequisite' },
  { id: 'e-front-proj', source: 'frontend', target: 'projects', type: 'unlock' },
  { id: 'e-back-db', source: 'backend', target: 'database', type: 'prerequisite' },
  { id: 'e-back-auth', source: 'backend', target: 'auth', type: 'prerequisite' },
  { id: 'e-db-proj', source: 'database', target: 'projects', type: 'dependency' },
  { id: 'e-auth-proj', source: 'auth', target: 'projects', type: 'dependency' },
];

export const mockGenerateLearningUniverseStream = async (params: GenerateRoadmapParams) => {
  const { onStatusUpdate, onChunk, onDone, onError } = params;

  try {
    const statuses = [
      "Analyzing Mentor...",
      "Loading Memory...",
      "Checking Knowledge Base...",
      "Building Learning Universe...",
      "Preparing Graph..."
    ];

    for (const status of statuses) {
      onStatusUpdate?.(status);
      await delay(800);
    }

    // Simulate streaming nodes progressively
    const generatedNodes: LearningNodeType[] = [];
    
    // We will emit custom chunks that can be parsed instantly
    for (let i = 0; i < MOCK_NODES.length; i++) {
      await delay(600); // delay between nodes
      const node = MOCK_NODES[i];
      const reactFlowNode: LearningNodeType = {
        id: node.id,
        type: 'learningNode',
        position: { x: 0, y: 0 }, // Initial position
        data: {
          title: node.title,
          description: node.description,
          type: node.type,
          status: node.status,
          difficulty: node.difficulty,
          xp: node.xp,
          estimated_time: node.estimated_time,
          tags: node.tags,
        }
      };
      generatedNodes.push(reactFlowNode);
      onChunk?.(JSON.stringify({ type: 'node', data: reactFlowNode }));
    }

    await delay(1000); // brief pause before edges

    // Stream edges
    const generatedEdges: Edge<LearningEdgeData>[] = [];
    for (let i = 0; i < MOCK_EDGES.length; i++) {
      await delay(300); // faster delay for edges
      const edge = MOCK_EDGES[i];
      const reactFlowEdge: Edge<LearningEdgeData> = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'semanticEdge',
        animated: true,
        data: {
          semanticType: edge.type,
        }
      };
      generatedEdges.push(reactFlowEdge);
      onChunk?.(JSON.stringify({ type: 'edge', data: reactFlowEdge }));
    }

    // Final complete JSON
    const finalResult = {
      nodes: MOCK_NODES,
      edges: MOCK_EDGES
    };
    onChunk?.(JSON.stringify({ type: 'complete', data: finalResult }));

    await delay(500);
    onDone?.();

  } catch (err: any) {
    onError?.(err.message || 'Mock Generation Failed');
  }
};
