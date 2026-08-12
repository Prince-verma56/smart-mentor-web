"use client";

import { useCallback, useMemo } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useReactFlow, Node, Edge } from '@xyflow/react';

// Node dimensions
const NODE_WIDTH = 300;
const NODE_HEIGHT = 160;

// ── Per-Layout ELK Configurations ─────────────────────────────────────────────

const getElkOptions = (layoutMode: string): Record<string, string> => {
  switch (layoutMode) {
    case 'hierarchy':
      return {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
        'elk.layered.spacing.nodeNodeBetweenLayers': '180',
        'elk.spacing.nodeNode': '80',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.compaction.postCompaction.strategy': 'LEFT_RIGHT_CONSTRAINT_LOCKING',
        'elk.layered.highDegreeNode.treatment': 'true',
        'elk.layered.highDegreeNode.threshold': '4',
        'elk.alignment': 'CENTER',
        'elk.padding': '[top=80,left=80,bottom=80,right=80]',
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.layered.unnecessaryBendpoints': 'true',
      };

    case 'mindmap':
      return {
        'elk.algorithm': 'radial',
        'elk.radial.compactor': 'WEDGE',
        'elk.radial.optimizationCriteria': 'NONE',
        'elk.spacing.nodeNode': '120',
        'elk.radial.centerOnRoot': 'true',
        'elk.padding': '[top=80,left=80,bottom=80,right=80]',
      };

    case 'timeline':
      return {
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'elk.layered.nodePlacement.strategy': 'LINEAR_SEGMENTS',
        'elk.spacing.nodeNode': '80',
        'elk.layered.spacing.nodeNodeBetweenLayers': '220',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
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
      return {
        'elk.algorithm': 'force',
        'elk.force.repulsivePower': '2',
        'elk.spacing.nodeNode': '140',
        'elk.padding': '[top=60,left=60,bottom=60,right=60]',
        'elk.force.iterations': '300',
      };
  }
}


// ── Smart Viewport Centering ──────────────────────────────────────────────────

const centerViewportOnNodes = (fitView: Function, duration = 600): void => {
  setTimeout(() => {
    fitView({ padding: 0.12, duration, maxZoom: 1.2 });
  }, 50);
};

// ── Main Hook ─────────────────────────────────────────────────────────────────

const useAutoLayout = () => {
  const { fitView } = useReactFlow();

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
    if (!elk || nodes.length === 0 || layoutMode === 'free') return { nodes, edges };

    // Group nodes for edge weighting (keep primary learning path straight, branch out practice/projects)
    const practiceNodeIds = new Set(
      nodes.filter(n => 
        ['PRACTICE', 'PROJECT', 'ASSESSMENT'].includes(n.data?.nodeCategory || '') || 
        ['practice', 'quiz', 'project'].includes(n.data?.type || '')
      ).map(n => String(n.id))
    );

    const elkOptions = getElkOptions(layoutMode);

    const graph = {
      id: 'root',
      layoutOptions: elkOptions,
      children: nodes.map((n) => ({
        id: String(n.id),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        layoutOptions: practiceNodeIds.has(String(n.id)) ? {
          'elk.layered.layering.layerConstraint': 'NONE'
        } : {}
      })),
      edges: edges.map((e) => {
        // High priority for primary flow, low priority for practice branching
        const isPrimaryToPrimary = !practiceNodeIds.has(String(e.source)) && !practiceNodeIds.has(String(e.target));
        return {
          id: String(e.id),
          sources: [String(e.source)],
          targets: [String(e.target)],
          layoutOptions: {
            // Keep main flow straight, let practice branch out
            'elk.edge.weight': isPrimaryToPrimary ? '10' : '1',
          }
        };
      }),
    };

    try {
      const layoutedGraph = await elk.layout(graph);
      let layoutedNodes: Node[] = [];

      if (layoutedGraph.children) {
        layoutedNodes = nodes.map((node) => {
          const lNode = layoutedGraph.children?.find((n) => n.id === String(node.id));
          if (lNode && lNode.x !== undefined && lNode.y !== undefined) {
            return {
              ...node,
              position: { x: lNode.x, y: lNode.y },
            };
          }
          return node;
        });
      } else {
        layoutedNodes = [...nodes];
      }

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

