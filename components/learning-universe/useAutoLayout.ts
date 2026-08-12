"use client";

import { useCallback, useMemo } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useReactFlow, Node, Edge } from '@xyflow/react';

// ── Node dimensions ──────────────────────────────────────────────────────────

const NODE_WIDTH = 300;
const NODE_HEIGHT = 160;

// Side-activity node categories & types (PRACTICE / QUIZ / PROJECT) 
const SIDE_CATEGORIES = new Set(['PRACTICE', 'PROJECT', 'ASSESSMENT']);
const SIDE_TYPES = new Set(['practice', 'quiz', 'project']);

const isSideNode = (n: Node): boolean =>
  SIDE_CATEGORIES.has((n.data?.nodeCategory as string) || '') ||
  SIDE_TYPES.has((n.data?.type as string) || '');

// ── Per-Layout ELK Configurations ────────────────────────────────────────────

const getElkOptions = (layoutMode: string): Record<string, string> => {
  switch (layoutMode) {

    // ── HIERARCHY: strict top-down tree.
    case 'hierarchy':
      return {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
        'elk.layered.spacing.nodeNodeBetweenLayers': '250',
        'elk.spacing.nodeNode': '150',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.alignment': 'CENTER',
        'elk.padding': '[top=100,left=120,bottom=100,right=120]',
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.layered.unnecessaryBendpoints': 'true',
        'elk.layered.mergeEdges': 'true',
        'elk.separateConnectedComponents': 'true', // PREVENTS STACKING
        'elk.spacing.componentComponent': '200',
      };

    // ── MIND MAP: true radial layout — root in center, categories spread outward.
    case 'mindmap':
      return {
        'elk.algorithm': 'radial',
        'elk.radial.compactor': 'NONE', // WEDGE often crashes on non-trees
        'elk.radial.centerOnRoot': 'true',
        'elk.spacing.nodeNode': '180',
        'elk.padding': '[top=120,left=120,bottom=120,right=120]',
        'elk.separateConnectedComponents': 'true', // PREVENTS STACKING
        'elk.spacing.componentComponent': '250',
      };

    // ── TIMELINE: strict LEFT to RIGHT progression.
    case 'timeline':
      return {
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'elk.spacing.nodeNode': '120',
        'elk.layered.spacing.nodeNodeBetweenLayers': '300',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.padding': '[top=120,left=120,bottom=120,right=120]',
        'elk.edgeRouting': 'SPLINES',
        'elk.separateConnectedComponents': 'true', // PREVENTS STACKING
        'elk.spacing.componentComponent': '200',
      };

    // ── FREE: force-directed, organic.
    case 'free':
    default:
      return {
        'elk.algorithm': 'force',
        'elk.force.repulsivePower': '4',
        'elk.spacing.nodeNode': '200',
        'elk.padding': '[top=100,left=100,bottom=100,right=100]',
        'elk.force.iterations': '500',
        'elk.separateConnectedComponents': 'true', // PREVENTS STACKING
        'elk.spacing.componentComponent': '200',
      };
  }
};

// ── Smart Viewport Centering ───────────────────────────────────────────────────

const centerViewportOnNodes = (fitView: Function, duration = 700): void => {
  setTimeout(() => {
    fitView({ padding: 0.10, duration, maxZoom: 1.0 });
  }, 80);
};

// ── Main Hook ──────────────────────────────────────────────────────────────────

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
    if (!elk || nodes.length === 0) return { nodes, edges };

    const elkOptions = getElkOptions(layoutMode);
    const sideNodeIds = new Set(nodes.filter(isSideNode).map(n => String(n.id)));

    const graph = {
      id: 'root',
      layoutOptions: elkOptions,
      children: nodes.map((n) => {
        const side = isSideNode(n);
        const nodeOpts: Record<string, string> = {};

        if (layoutMode === 'hierarchy' && side) {
          nodeOpts['elk.layered.layering.layerConstraint'] = 'NONE';
        }

        return {
          id: String(n.id),
          width: side ? Math.round(NODE_WIDTH * 0.78) : NODE_WIDTH,
          height: side ? Math.round(NODE_HEIGHT * 0.78) : NODE_HEIGHT,
          layoutOptions: nodeOpts,
        };
      }),
      edges: edges.map((e) => {
        const isPrimaryEdge =
          !sideNodeIds.has(String(e.source)) && !sideNodeIds.has(String(e.target));
        return {
          id: String(e.id),
          sources: [String(e.source)],
          targets: [String(e.target)],
          layoutOptions: {
            'elk.edge.weight': isPrimaryEdge ? '10' : '1',
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
