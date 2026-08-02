/**
 * Intelligent Learning Universe Mock Generator
 * 
 * Simulates the exact 10-stage LangGraph pipeline:
 * Domain Analyzer → Learning Planner → Topic Planner → Subtopic Planner
 * → Relationship Planner → Difficulty Planner → Milestone Planner
 * → Project Planner → Revision Planner → Graph Validator
 * 
 * When the real LangGraph is connected, only this file needs to change.
 * All types, stores, and React Flow wiring remain identical.
 */

import { GenerateRoadmapParams } from './learningUniverseApi';
import { LearningNodeType, LearningEdgeData, EdgeSemanticType } from '@/stores/learningUniverseStore';
import { Edge } from '@xyflow/react';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Roadmap Domain Data ──────────────────────────────────────────────────────

type DomainTemplate = {
  domain: string;
  topics: TopicTemplate[];
};

type TopicTemplate = {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  estimated_time: number;
  tags: string[];
  type: 'topic' | 'subtopic' | 'concept' | 'lesson';
  subtopics?: SubtopicTemplate[];
};

type SubtopicTemplate = {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  estimated_time: number;
  tags: string[];
  type: 'subtopic' | 'concept' | 'lesson' | 'practice';
};

// A rich, multi-level fullstack roadmap that simulates what the AI would produce
const FULLSTACK_ROADMAP: DomainTemplate = {
  domain: 'Fullstack Development',
  topics: [
    {
      id: 'html',
      title: 'HTML Foundations',
      description: 'Build the structural backbone of the web with semantic, accessible HTML.',
      difficulty: 'beginner',
      xp: 80,
      estimated_time: 90,
      tags: ['html', 'web', 'markup'],
      type: 'topic',
      subtopics: [
        { id: 'html-semantic', title: 'Semantic HTML5', description: 'Use section, article, aside, header, footer correctly.', difficulty: 'beginner', xp: 20, estimated_time: 30, tags: ['html', 'semantic'], type: 'lesson' },
        { id: 'html-forms', title: 'Forms & Inputs', description: 'Build interactive forms with validation.', difficulty: 'beginner', xp: 25, estimated_time: 30, tags: ['html', 'forms'], type: 'lesson' },
        { id: 'html-a11y', title: 'Accessibility (ARIA)', description: 'ARIA roles, labels, and keyboard navigation.', difficulty: 'beginner', xp: 30, estimated_time: 30, tags: ['html', 'a11y'], type: 'concept' },
      ],
    },
    {
      id: 'css',
      title: 'CSS Mastery',
      description: 'Style and animate the web with modern CSS techniques.',
      difficulty: 'beginner',
      xp: 120,
      estimated_time: 150,
      tags: ['css', 'design', 'styling'],
      type: 'topic',
      subtopics: [
        { id: 'css-flexbox', title: 'Flexbox Layout', description: 'Master one-dimensional layouts with flexbox.', difficulty: 'beginner', xp: 25, estimated_time: 30, tags: ['css', 'layout'], type: 'lesson' },
        { id: 'css-grid', title: 'CSS Grid', description: 'Two-dimensional layout system for complex designs.', difficulty: 'intermediate', xp: 35, estimated_time: 45, tags: ['css', 'grid'], type: 'lesson' },
        { id: 'css-animations', title: 'Animations & Transitions', description: 'Create fluid motion with keyframes and transitions.', difficulty: 'intermediate', xp: 30, estimated_time: 30, tags: ['css', 'animation'], type: 'practice' },
        { id: 'css-responsive', title: 'Responsive Design', description: 'Media queries, breakpoints, and mobile-first approach.', difficulty: 'beginner', xp: 30, estimated_time: 45, tags: ['css', 'responsive'], type: 'concept' },
      ],
    },
    {
      id: 'javascript',
      title: 'JavaScript Core',
      description: 'Master the programming language of the web from fundamentals to advanced patterns.',
      difficulty: 'intermediate',
      xp: 250,
      estimated_time: 360,
      tags: ['javascript', 'programming', 'es6'],
      type: 'topic',
      subtopics: [
        { id: 'js-variables', title: 'Variables & Scope', description: 'var, let, const, and lexical scoping.', difficulty: 'beginner', xp: 20, estimated_time: 30, tags: ['js', 'scope'], type: 'lesson' },
        { id: 'js-functions', title: 'Functions & Closures', description: 'First-class functions, closures, and higher-order patterns.', difficulty: 'intermediate', xp: 40, estimated_time: 60, tags: ['js', 'closures'], type: 'concept' },
        { id: 'js-async', title: 'Async & Promises', description: 'Callbacks, Promises, async/await, and event loop.', difficulty: 'intermediate', xp: 50, estimated_time: 90, tags: ['js', 'async'], type: 'lesson' },
        { id: 'js-dom', title: 'DOM Manipulation', description: 'Query, modify, and respond to the document object model.', difficulty: 'beginner', xp: 35, estimated_time: 60, tags: ['js', 'dom'], type: 'practice' },
        { id: 'js-modules', title: 'ES6 Modules', description: 'Import/export, module patterns, and bundlers.', difficulty: 'intermediate', xp: 30, estimated_time: 30, tags: ['js', 'modules'], type: 'lesson' },
      ],
    },
    {
      id: 'react',
      title: 'React & Component Architecture',
      description: 'Build dynamic UIs with React\'s component model, hooks, and state management.',
      difficulty: 'intermediate',
      xp: 300,
      estimated_time: 420,
      tags: ['react', 'components', 'hooks'],
      type: 'topic',
      subtopics: [
        { id: 'react-components', title: 'Components & JSX', description: 'Functional components, props, and JSX syntax.', difficulty: 'beginner', xp: 30, estimated_time: 45, tags: ['react', 'jsx'], type: 'lesson' },
        { id: 'react-hooks', title: 'Hooks Deep Dive', description: 'useState, useEffect, useCallback, useMemo, custom hooks.', difficulty: 'intermediate', xp: 70, estimated_time: 120, tags: ['react', 'hooks'], type: 'concept' },
        { id: 'react-state', title: 'State Management', description: 'Context API, Zustand, Redux Toolkit patterns.', difficulty: 'advanced', xp: 80, estimated_time: 120, tags: ['react', 'state', 'zustand'], type: 'lesson' },
        { id: 'react-routing', title: 'Client-Side Routing', description: 'React Router v6, nested routes, protected routes.', difficulty: 'intermediate', xp: 40, estimated_time: 60, tags: ['react', 'routing'], type: 'practice' },
        { id: 'react-patterns', title: 'React Design Patterns', description: 'Compound components, render props, HOC patterns.', difficulty: 'advanced', xp: 80, estimated_time: 75, tags: ['react', 'patterns'], type: 'concept' },
      ],
    },
    {
      id: 'nextjs',
      title: 'Next.js & Full-Stack React',
      description: 'Build production-grade React applications with SSR, SSG, and API routes.',
      difficulty: 'advanced',
      xp: 280,
      estimated_time: 300,
      tags: ['nextjs', 'ssr', 'fullstack'],
      type: 'topic',
      subtopics: [
        { id: 'next-appdir', title: 'App Router & Server Components', description: 'Next.js 14 app directory, React Server Components.', difficulty: 'advanced', xp: 80, estimated_time: 90, tags: ['nextjs', 'rsc'], type: 'lesson' },
        { id: 'next-data', title: 'Data Fetching Strategies', description: 'SSR, SSG, ISR, and server actions.', difficulty: 'advanced', xp: 70, estimated_time: 90, tags: ['nextjs', 'data'], type: 'concept' },
        { id: 'next-api', title: 'API Routes & Middleware', description: 'Build backend APIs directly in Next.js.', difficulty: 'intermediate', xp: 60, estimated_time: 60, tags: ['nextjs', 'api'], type: 'practice' },
        { id: 'next-perf', title: 'Performance Optimization', description: 'Image optimization, code splitting, bundle analysis.', difficulty: 'advanced', xp: 70, estimated_time: 60, tags: ['nextjs', 'performance'], type: 'lesson' },
      ],
    },
    {
      id: 'backend',
      title: 'Backend & APIs',
      description: 'Design and build scalable RESTful and GraphQL APIs.',
      difficulty: 'intermediate',
      xp: 300,
      estimated_time: 360,
      tags: ['backend', 'api', 'server'],
      type: 'topic',
      subtopics: [
        { id: 'be-rest', title: 'REST API Design', description: 'HTTP methods, status codes, resource modeling, versioning.', difficulty: 'intermediate', xp: 60, estimated_time: 90, tags: ['rest', 'api'], type: 'lesson' },
        { id: 'be-auth', title: 'Authentication & Authorization', description: 'JWT, OAuth 2.0, session management, RBAC.', difficulty: 'advanced', xp: 80, estimated_time: 120, tags: ['auth', 'jwt', 'oauth'], type: 'concept' },
        { id: 'be-db', title: 'Database Design', description: 'Relational vs NoSQL, schema design, indexing, ACID.', difficulty: 'intermediate', xp: 90, estimated_time: 120, tags: ['database', 'sql', 'nosql'], type: 'lesson' },
        { id: 'be-cache', title: 'Caching Strategies', description: 'Redis, CDN, HTTP caching, cache invalidation patterns.', difficulty: 'advanced', xp: 70, estimated_time: 60, tags: ['caching', 'redis'], type: 'concept' },
      ],
    },
  ],
};

// ─── Pipeline Stage Simulators ────────────────────────────────────────────────

interface PipelineNode {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  difficulty: string;
  xp: number;
  estimated_time: number;
  tags: string[];
  graph_level: number;
  graph_depth: number;
  parent_node_id?: string;
  learning_order: number;
  summary?: string;
}

interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  semanticType: EdgeSemanticType;
  reason: string;
  priority: string;
  weight: number;
  confidence: number;
  dependency_strength: string;
}

interface PipelineResult {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

const runDomainAnalyzer = async (mentorId: string): Promise<DomainTemplate> => {
  await delay(600);
  return FULLSTACK_ROADMAP;
};

const runLearningPlanner = async (domain: DomainTemplate): Promise<{ foundationId: string }> => {
  await delay(500);
  return { foundationId: 'foundation' };
};

const runTopicPlanner = (domain: DomainTemplate): PipelineNode[] => {
  const nodes: PipelineNode[] = [];
  
  // Foundation milestone
  nodes.push({
    id: 'foundation',
    title: `${domain.domain} Foundation`,
    description: 'Start your journey here. Understand the principles, tools, and mindset needed to succeed.',
    type: 'milestone',
    status: 'completed',
    difficulty: 'beginner',
    xp: 100,
    estimated_time: 60,
    tags: ['foundation', 'start', 'overview'],
    graph_level: 0,
    graph_depth: 0,
    learning_order: 0,
    summary: 'The entry point of your learning path.',
  });

  // Main topics
  domain.topics.forEach((topic, i) => {
    nodes.push({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      type: topic.type,
      status: i === 0 ? 'in-progress' : i === 1 ? 'unlocked' : 'locked',
      difficulty: topic.difficulty,
      xp: topic.xp,
      estimated_time: topic.estimated_time,
      tags: topic.tags,
      graph_level: 1,
      graph_depth: 1,
      parent_node_id: 'foundation',
      learning_order: i + 1,
      summary: `Core ${topic.title} skills needed for professional development.`,
    });
  });

  return nodes;
};

const runSubtopicPlanner = (domain: DomainTemplate, topicNodes: PipelineNode[]): PipelineNode[] => {
  const subtopicNodes: PipelineNode[] = [];
  
  domain.topics.forEach(topic => {
    if (!topic.subtopics) return;
    topic.subtopics.forEach((sub, i) => {
      subtopicNodes.push({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        type: sub.type,
        status: 'locked',
        difficulty: sub.difficulty,
        xp: sub.xp,
        estimated_time: sub.estimated_time,
        tags: sub.tags,
        graph_level: 2,
        graph_depth: 2,
        parent_node_id: topic.id,
        learning_order: i + 1,
        summary: sub.description,
      });
    });
  });

  return subtopicNodes;
};

const runMilestonePlanner = (domain: DomainTemplate): PipelineNode[] => {
  return [
    {
      id: 'milestone-frontend',
      title: 'Frontend Certified',
      description: 'You have mastered HTML, CSS, and JavaScript. You are ready to build any UI.',
      type: 'milestone',
      status: 'locked',
      difficulty: 'intermediate',
      xp: 250,
      estimated_time: 0,
      tags: ['milestone', 'frontend', 'certificate'],
      graph_level: 1,
      graph_depth: 2,
      learning_order: 99,
      summary: 'Milestone unlocked after completing all frontend fundamentals.',
    },
    {
      id: 'milestone-fullstack',
      title: 'Fullstack Engineer',
      description: 'You can design, build, and deploy complete web applications end-to-end.',
      type: 'milestone',
      status: 'locked',
      difficulty: 'advanced',
      xp: 500,
      estimated_time: 0,
      tags: ['milestone', 'fullstack', 'final'],
      graph_level: 0,
      graph_depth: 4,
      learning_order: 100,
      summary: 'The final milestone of the fullstack journey.',
    },
  ];
};

const runProjectPlanner = (): PipelineNode[] => {
  return [
    {
      id: 'project-portfolio',
      title: 'Personal Portfolio Website',
      description: 'Build and deploy a stunning portfolio showcasing your skills.',
      type: 'mini_project',
      status: 'locked',
      difficulty: 'intermediate',
      xp: 200,
      estimated_time: 480,
      tags: ['project', 'portfolio', 'deployment'],
      graph_level: 2,
      graph_depth: 3,
      learning_order: 1,
      summary: 'Apply HTML, CSS, and JS fundamentals in a real deployable project.',
    },
    {
      id: 'project-saas',
      title: 'Fullstack SaaS Application',
      description: 'Build a production-grade SaaS with auth, dashboard, payments, and real users.',
      type: 'project',
      status: 'locked',
      difficulty: 'advanced',
      xp: 800,
      estimated_time: 1200,
      tags: ['project', 'saas', 'fullstack', 'production'],
      graph_level: 1,
      graph_depth: 4,
      learning_order: 2,
      summary: 'The capstone project of the fullstack journey.',
    },
  ];
};

const runRevisionPlanner = (): PipelineNode[] => {
  return [
    {
      id: 'revision-js',
      title: 'JavaScript Review & Drill',
      description: 'Consolidate your JS knowledge with flashcards, quizzes, and coding challenges.',
      type: 'revision',
      status: 'locked',
      difficulty: 'intermediate',
      xp: 100,
      estimated_time: 120,
      tags: ['revision', 'javascript', 'review'],
      graph_level: 2,
      graph_depth: 3,
      learning_order: 50,
      summary: 'Revision checkpoint before advancing to frameworks.',
    },
  ];
};

const runInterviewPlanner = (): PipelineNode[] => {
  return [
    {
      id: 'interview-frontend',
      title: 'Frontend Interview Prep',
      description: 'Common interview questions, live coding challenges, and system design basics.',
      type: 'interview',
      status: 'locked',
      difficulty: 'advanced',
      xp: 300,
      estimated_time: 300,
      tags: ['interview', 'frontend', 'prep'],
      graph_level: 1,
      graph_depth: 4,
      learning_order: 98,
      summary: 'Prepare for frontend engineering interviews at top companies.',
    },
  ];
};

const runRelationshipPlanner = (nodes: PipelineNode[]): PipelineEdge[] => {
  const edges: PipelineEdge[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  const addEdge = (
    source: string, target: string,
    semanticType: EdgeSemanticType,
    reason: string,
    weight: number = 0.8,
    depStrength: string = 'strong'
  ) => {
    if (!nodeMap.has(source) || !nodeMap.has(target)) return;
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      semanticType,
      reason,
      priority: weight > 0.8 ? 'critical' : weight > 0.5 ? 'high' : 'medium',
      weight,
      confidence: 0.92,
      dependency_strength: depStrength,
    });
  };

  // Foundation → all topics
  addEdge('foundation', 'html', 'unlock', 'Foundation unlocks the first HTML topic', 1.0, 'required');
  addEdge('foundation', 'css', 'prerequisite', 'CSS requires HTML basics', 0.9, 'required');
  addEdge('foundation', 'javascript', 'prerequisite', 'JavaScript is unlocked after foundation', 0.9, 'strong');

  // HTML → CSS (parallel possible but CSS benefits from HTML knowledge)
  addEdge('html', 'css', 'recommended', 'CSS is most useful when you know HTML structure', 0.85, 'moderate');

  // HTML subtopics
  addEdge('html', 'html-semantic', 'unlock', 'Semantic HTML is a direct subtopic', 1.0, 'required');
  addEdge('html', 'html-forms', 'unlock', 'Forms build on semantic HTML knowledge', 0.9, 'strong');
  addEdge('html-semantic', 'html-a11y', 'prerequisite', 'Accessibility builds on semantic markup', 0.85, 'strong');

  // CSS subtopics
  addEdge('css', 'css-flexbox', 'unlock', 'Flexbox is the first CSS layout system', 1.0, 'required');
  addEdge('css-flexbox', 'css-grid', 'prerequisite', 'Grid is learned after Flexbox mastery', 0.9, 'strong');
  addEdge('css', 'css-animations', 'recommended', 'Animations make sense after core CSS', 0.7, 'moderate');
  addEdge('css-grid', 'css-responsive', 'knowledge_bridge', 'Grid and responsive design are deeply related', 0.85, 'strong');

  // JS subtopics
  addEdge('javascript', 'js-variables', 'unlock', 'Variables are the entry point of JS', 1.0, 'required');
  addEdge('js-variables', 'js-functions', 'prerequisite', 'Functions build on variable knowledge', 0.95, 'required');
  addEdge('js-functions', 'js-async', 'prerequisite', 'Async/Await requires understanding functions and closures', 0.9, 'required');
  addEdge('js-functions', 'js-dom', 'parallel', 'DOM and functions can be learned in parallel', 0.7, 'moderate');
  addEdge('js-modules', 'react', 'prerequisite', 'ES6 modules are required before React', 0.95, 'required');
  addEdge('js-async', 'js-modules', 'recommended', 'Modules are naturally learned after async patterns', 0.8, 'moderate');

  // JavaScript → Frontend Milestone
  addEdge('javascript', 'revision-js', 'revision', 'Revise JS before advancing to frameworks', 0.8, 'strong');
  addEdge('revision-js', 'react', 'prerequisite', 'Complete JS revision before starting React', 0.9, 'required');

  // React subtopics
  addEdge('react', 'react-components', 'unlock', 'Components are the entry point to React', 1.0, 'required');
  addEdge('react-components', 'react-hooks', 'prerequisite', 'Hooks require understanding components', 0.95, 'required');
  addEdge('react-hooks', 'react-state', 'prerequisite', 'State management builds on hooks knowledge', 0.9, 'strong');
  addEdge('react-components', 'react-routing', 'recommended', 'Routing is natural after components', 0.8, 'moderate');
  addEdge('react-hooks', 'react-patterns', 'knowledge_bridge', 'Patterns deepen hooks understanding', 0.85, 'strong');

  // React → Frontend Milestone
  addEdge('css-responsive', 'milestone-frontend', 'project_requirement', 'Responsive design mastery required for frontend milestone', 0.9, 'required');
  addEdge('react-state', 'milestone-frontend', 'project_requirement', 'State management mastery required for frontend milestone', 0.9, 'required');

  // Portfolio Project
  addEdge('milestone-frontend', 'project-portfolio', 'unlock', 'Frontend milestone unlocks portfolio project', 0.95, 'required');
  addEdge('html-a11y', 'project-portfolio', 'project_requirement', 'Accessibility knowledge required for portfolio', 0.7, 'moderate');

  // Next.js subtopics
  addEdge('react-patterns', 'nextjs', 'prerequisite', 'Advanced React patterns needed for Next.js', 0.9, 'required');
  addEdge('nextjs', 'next-appdir', 'unlock', 'App Router is the entry to Next.js', 1.0, 'required');
  addEdge('next-appdir', 'next-data', 'prerequisite', 'Data fetching builds on App Router understanding', 0.95, 'required');
  addEdge('next-data', 'next-api', 'recommended', 'API routes are naturally learned after data fetching', 0.85, 'strong');
  addEdge('next-api', 'next-perf', 'recommended', 'Performance is the final Next.js optimization step', 0.8, 'moderate');

  // Backend subtopics
  addEdge('javascript', 'backend', 'parallel', 'Backend learning can begin after JS fundamentals', 0.7, 'moderate');
  addEdge('backend', 'be-rest', 'unlock', 'REST API design is the entry to backend', 1.0, 'required');
  addEdge('be-rest', 'be-auth', 'prerequisite', 'Authentication builds on REST API knowledge', 0.9, 'required');
  addEdge('be-rest', 'be-db', 'prerequisite', 'Database design is foundational for APIs', 0.9, 'required');
  addEdge('be-db', 'be-cache', 'prerequisite', 'Caching requires database understanding', 0.85, 'strong');

  // Final project
  addEdge('next-perf', 'project-saas', 'project_requirement', 'Next.js mastery required for SaaS project', 0.9, 'required');
  addEdge('be-auth', 'project-saas', 'project_requirement', 'Authentication is required for SaaS', 1.0, 'required');
  addEdge('be-cache', 'project-saas', 'project_requirement', 'Caching knowledge enhances SaaS architecture', 0.7, 'moderate');

  // Interview prep
  addEdge('project-portfolio', 'interview-frontend', 'interview_requirement', 'Portfolio is required to demonstrate skills in interviews', 0.85, 'strong');
  addEdge('milestone-frontend', 'interview-frontend', 'recommended', 'Milestone completion recommends interview prep', 0.8, 'moderate');

  // Final milestone
  addEdge('project-saas', 'milestone-fullstack', 'unlock', 'Completing the SaaS project unlocks the fullstack milestone', 1.0, 'required');
  addEdge('interview-frontend', 'milestone-fullstack', 'project_requirement', 'Interview preparation is part of the fullstack journey', 0.85, 'strong');

  return edges;
};

// ─── React Flow Node Builder ──────────────────────────────────────────────────

const buildReactFlowNode = (node: PipelineNode): LearningNodeType => ({
  id: node.id,
  type: 'learningNode',
  position: { x: 0, y: 0 }, // ELK handles positioning
  data: {
    title: node.title,
    description: node.description,
    summary: node.summary,
    type: node.type as any,
    status: node.status as any,
    difficulty: node.difficulty as any,
    xp: node.xp,
    estimated_time: node.estimated_time,
    tags: node.tags,
    graph_level: node.graph_level,
    graph_depth: node.graph_depth,
    parent_node_id: node.parent_node_id,
    learning_order: node.learning_order,
    metadata: {
      source: 'ai_mock',
      createdBy: 'pipeline',
      generatedAt: new Date().toISOString(),
    },
  },
});

const buildReactFlowEdge = (edge: PipelineEdge): Edge<LearningEdgeData> => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  type: 'semanticEdge',
  animated: edge.semanticType === 'prerequisite' || edge.semanticType === 'unlock',
  data: {
    semanticType: edge.semanticType,
    reason: edge.reason,
    priority: edge.priority as any,
    weight: edge.weight,
    confidence: edge.confidence,
    dependency_strength: edge.dependency_strength as any,
    metadata: { source: 'pipeline', createdBy: 'relationship_planner' },
  },
});

// ─── Main Export ──────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { name: 'Domain Analyzer', description: 'Analyzing mentor expertise and learning domain...' },
  { name: 'Learning Planner', description: 'Building your personalized learning plan...' },
  { name: 'Topic Planner', description: 'Organizing main learning topics...' },
  { name: 'Subtopic Planner', description: 'Expanding topics into detailed subtopics...' },
  { name: 'Relationship Planner', description: 'Mapping relationships and prerequisites...' },
  { name: 'Difficulty Planner', description: 'Calibrating difficulty and XP values...' },
  { name: 'Milestone Planner', description: 'Placing milestones and checkpoints...' },
  { name: 'Project Planner', description: 'Designing hands-on projects...' },
  { name: 'Revision Planner', description: 'Adding revision and review loops...' },
  { name: 'Graph Validator', description: 'Validating graph integrity and layout...' },
];

export const mockGenerateLearningUniverseStream = async (params: GenerateRoadmapParams) => {
  const { mentorId, onStatusUpdate, onChunk, onDone, onError } = params;

  try {
    // Stage 1–10: Simulate pipeline stages
    for (const stage of PIPELINE_STAGES) {
      onStatusUpdate?.(`[${stage.name}] ${stage.description}`);
      await delay(400);
    }

    onStatusUpdate?.('Streaming your Learning Universe...');
    await delay(300);

    // --- Run the 10-stage pipeline ---
    const domain = await runDomainAnalyzer(mentorId);
    const topicNodes = runTopicPlanner(domain);
    const subtopicNodes = runSubtopicPlanner(domain, topicNodes);
    const milestoneNodes = runMilestonePlanner(domain);
    const projectNodes = runProjectPlanner();
    const revisionNodes = runRevisionPlanner();
    const interviewNodes = runInterviewPlanner();

    const allPipelineNodes = [
      ...topicNodes,
      ...subtopicNodes,
      ...milestoneNodes,
      ...projectNodes,
      ...revisionNodes,
      ...interviewNodes,
    ];

    const allEdges = runRelationshipPlanner(allPipelineNodes);

    // --- Stream nodes progressively in learning_order ---
    const sortedNodes = [...allPipelineNodes].sort((a, b) => {
      if (a.graph_level !== b.graph_level) return a.graph_level - b.graph_level;
      return a.learning_order - b.learning_order;
    });

    for (const pNode of sortedNodes) {
      await delay(120);
      const rfNode = buildReactFlowNode(pNode);
      onChunk?.(JSON.stringify({ type: 'node', data: rfNode }));
    }

    await delay(500);

    // --- Stream edges in dependency order ---
    const sortedEdges = [...allEdges].sort((a, b) => b.weight - a.weight);
    for (const pEdge of sortedEdges) {
      await delay(60);
      const rfEdge = buildReactFlowEdge(pEdge);
      onChunk?.(JSON.stringify({ type: 'edge', data: rfEdge }));
    }

    await delay(300);
    onChunk?.(JSON.stringify({ type: 'complete', data: { nodes: sortedNodes, edges: allEdges } }));
    await delay(200);
    onDone?.();

  } catch (err: any) {
    onError?.(err.message || 'Pipeline generation failed');
  }
};
