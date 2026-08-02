"use client";

import { useCallback, useMemo } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useReactFlow, Node, Edge } from '@xyflow/react';

// Node dimensions — match the actual LearningNode card size
const NODE_WIDTH = 300;
const NODE_HEIGHT = 160;
const PADDING = 40; // Extra padding per node for breathing room

// ── Per-Layout ELK Configurations ─────────────────────────────────────────────

const getElkOptions = (layoutMode: string): Record<string, string> => {
  switch (layoutMode) {
    case 'hierarchy':
      return {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.layered.spacing.nodeNodeBetweenLayers': '180',
        'elk.spacing.nodeNode': '80',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
        'elk.layered.compaction.postCompaction.strategy': 'LEFT_RIGHT_CONSTRAINT_LOCKING',
        'elk.padding': '[top=60,left=60,bottom=60,right=60]',
        'elk.layered.unnecessaryBendpoints': 'true',
        'elk.edgeRouting': 'ORTHOGONAL',
      };

    case 'mindmap':
      return {
        'elk.algorithm': 'radial',
        'elk.radial.compactor': 'WEDGE',
        'elk.radial.optimizationCriteria': 'NONE',
        'elk.spacing.nodeNode': '90',
        'elk.radial.centerOnRoot': 'true',
        'elk.padding': '[top=80,left=80,bottom=80,right=80]',
      };

    case 'timeline':
      return {
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'elk.layered.spacing.nodeNodeBetweenLayers': '220',
        'elk.spacing.nodeNode': '70',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.nodePlacement.strategy': 'LINEAR_SEGMENTS',
        'elk.padding': '[top=80,left=80,bottom=80,right=80]',
        'elk.edgeRouting': 'SPLINES',
      };

    case 'radial':
      return {
        'elk.algorithm': 'radial',
        'elk.radial.compactor': 'NONE',
        'elk.spacing.nodeNode': '100',
        'elk.radial.sortNodes': 'true',
        'elk.padding': '[top=100,left=100,bottom=100,right=100]',
      };

    case 'free':
    default:
      // Free layout: use force-directed for an organic feel
      return {
        'elk.algorithm': 'force',
        'elk.force.repulsivePower': '1',
        'elk.spacing.nodeNode': '120',
        'elk.padding': '[top=60,left=60,bottom=60,right=60]',
      };
  }
};

// ── Collision Detection & Padding ─────────────────────────────────────────────

const resolveCollisions = (nodes: Node[]): Node[] => {
  const resolved = nodes.map(n => ({ ...n }));
  const MAX_ITERATIONS = 5;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let hasCollision = false;

    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const a = resolved[i];
        const b = resolved[j];

        const ax1 = a.position.x - PADDING;
        const ay1 = a.position.y - PADDING;
        const ax2 = a.position.x + NODE_WIDTH + PADDING;
        const ay2 = a.position.y + NODE_HEIGHT + PADDING;

        const bx1 = b.position.x - PADDING;
        const by1 = b.position.y - PADDING;
        const bx2 = b.position.x + NODE_WIDTH + PADDING;
        const by2 = b.position.y + NODE_HEIGHT + PADDING;

        const overlaps = ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;

        if (overlaps) {
          hasCollision = true;
          const overlapX = Math.min(ax2 - bx1, bx2 - ax1);
          const overlapY = Math.min(ay2 - by1, by2 - ay1);

          if (overlapX < overlapY) {
            const shift = overlapX / 2 + 10;
            resolved[i].position = { ...resolved[i].position, x: resolved[i].position.x - shift };
            resolved[j].position = { ...resolved[j].position, x: resolved[j].position.x + shift };
          } else {
            const shift = overlapY / 2 + 10;
            resolved[i].position = { ...resolved[i].position, y: resolved[i].position.y - shift };
            resolved[j].position = { ...resolved[j].position, y: resolved[j].position.y + shift };
          }
        }
      }
    }

    if (!hasCollision) break;
  }

  return resolved;
};

// ── Smart Viewport Centering ──────────────────────────────────────────────────

const centerViewportOnNodes = (fitView: Function, duration = 600): void => {
  setTimeout(() => {
    fitView({ padding: 0.12, duration, maxZoom: 1.2 });
  }, 50);
};

// ── Main Hook ─────────────────────────────────────────────────────────────────

const useAutoLayout = () => {
  const { setNodes, setEdges, fitView } = useReactFlow();

  const elk = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new ELK();
    }
    return null;
  }, []);

  const getLayoutedElements = useCallback(async (
    nodes: Node[],
    edges: Edge[],
    layoutMode: string
  ): Promise<{ nodes: Node[]; edges: Edge[] }> => {
    if (!elk || nodes.length === 0) return { nodes, edges };

    const elkOptions = getElkOptions(layoutMode);

    const graph = {
      id: 'root',
      layoutOptions: elkOptions,
      children: nodes.map((n) => ({
        id: n.id,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      })),
      edges: edges
        .filter(e => nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target))
        .map((e) => ({
          id: e.id,
          sources: [e.source],
          targets: [e.target],
        })),
    };

    try {
      const layoutedGraph = await elk.layout(graph);

      if (!layoutedGraph.children) return { nodes, edges };

      let layoutedNodes = nodes.map((node) => {
        const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
        if (layoutedNode) {
          return {
            ...node,
            position: {
              x: layoutedNode.x ?? node.position.x,
              y: layoutedNode.y ?? node.position.y,
            },
          };
        }
        return node;
      });

      // Post-layout: resolve any remaining collisions
      if (layoutMode !== 'free') {
        layoutedNodes = resolveCollisions(layoutedNodes);
      }

      // Center viewport
      centerViewportOnNodes(fitView);

      return { nodes: layoutedNodes, edges };
    } catch (error) {
      console.error('ELK Layout Error:', error);
      return { nodes, edges };
    }
  }, [elk, fitView]);

  return { getLayoutedElements };
};

export default useAutoLayout;

