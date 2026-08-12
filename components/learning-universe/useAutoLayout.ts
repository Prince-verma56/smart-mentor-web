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
        // Force nodes in the same layer to be perfectly aligned
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
        'elk.layered.spacing.nodeNodeBetweenLayers': '350', // Reserved space for Practice layer
        'elk.spacing.nodeNode': '100',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.compaction.postCompaction.strategy': 'LEFT_RIGHT_CONSTRAINT_LOCKING',
        'elk.alignment': 'CENTER',
        'elk.padding': '[top=60,left=60,bottom=60,right=60]',
        'elk.layered.unnecessaryBendpoints': 'true',
        'elk.edgeRouting': 'ORTHOGONAL',
      };

    case 'mindmap':
      return {
        'elk.algorithm': 'radial',
        'elk.radial.compactor': 'WEDGE',
        'elk.radial.optimizationCriteria': 'NONE',
        'elk.spacing.nodeNode': '200', // Room for practice clusters
        'elk.radial.centerOnRoot': 'true',
        'elk.padding': '[top=80,left=80,bottom=80,right=80]',
      };

    case 'timeline':
      return {
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'elk.layered.spacing.nodeNodeBetweenLayers': '400',
        'elk.spacing.nodeNode': '200',
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

    // 1. Separate nodes into primary (ELK layout) and secondary (Practice nodes)
    const primaryNodes = nodes.filter(n => n.data?.type !== 'practice' && n.data?.nodeCategory !== 'PRACTICE');
    const practiceNodes = nodes.filter(n => n.data?.type === 'practice' || n.data?.nodeCategory === 'PRACTICE');

    const elkOptions = getElkOptions(layoutMode);

      const graph = {
      id: 'root',
      layoutOptions: elkOptions,
      children: primaryNodes.map((n) => {
        // Find if this node has practice children to augment its ELK bounding box
        const hasPracticeChildren = edges.some(e => e.source === n.id && practiceNodes.some(pn => pn.id === e.target));
        
        let width = NODE_WIDTH;
        let height = NODE_HEIGHT;
        
        if (hasPracticeChildren) {
          if (layoutMode === 'hierarchy') {
            // Reserve right-side lane
            width = NODE_WIDTH + 300;
          } else if (layoutMode === 'timeline' || layoutMode === 'mindmap') {
            // Reserve bottom lane
            height = NODE_HEIGHT + 240;
          }
        }

        return {
          id: String(n.id),
          width,
          height,
        };
      }),
      edges: edges
        .filter(e => primaryNodes.some(n => n.id === e.source) && primaryNodes.some(n => n.id === e.target))
        .map((e) => ({
          id: String(e.id),
          sources: [String(e.source)],
          targets: [String(e.target)],
        })),
    };

    try {
      const layoutedGraph = await elk.layout(graph);

      let layoutedNodes: Node[] = [];

      if (layoutedGraph.children) {
        layoutedNodes = primaryNodes.map((node) => {
          const layoutedNode = layoutedGraph.children?.find((n) => n.id === String(node.id));
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
      } else {
        layoutedNodes = [...primaryNodes];
      }

      // 2. Attach practice nodes in their designated zones
      practiceNodes.forEach(pNode => {
        const incomingEdge = edges.find(e => e.target === pNode.id);
        if (incomingEdge) {
          const parentNode = layoutedNodes.find(n => n.id === incomingEdge.source);
          if (parentNode) {
            const siblingEdges = edges.filter(e => e.source === parentNode.id);
            const siblingIds = siblingEdges.map(e => e.target);
            const practiceSiblings = practiceNodes.filter(pn => siblingIds.includes(pn.id));
            
            const myIndex = practiceSiblings.findIndex(pn => pn.id === pNode.id);
            const totalSiblings = practiceSiblings.length;
            
            const practiceWidth = 240;
            const practiceHeight = 140;
            const gap = 30;

            let finalX = parentNode.position.x;
            let finalY = parentNode.position.y;
            
            if (layoutMode === 'hierarchy') {
              // Stack vertically on the right side
              finalX = parentNode.position.x + NODE_WIDTH + 60;
              finalY = parentNode.position.y + (myIndex * (practiceHeight + gap));
            } else {
              // Timeline/Mindmap: Layout horizontally beneath the parent
              const totalWidth = (practiceWidth * totalSiblings) + (gap * (totalSiblings - 1));
              const startX = parentNode.position.x + (NODE_WIDTH / 2) - (totalWidth / 2);
              finalX = startX + (myIndex * (practiceWidth + gap));
              finalY = parentNode.position.y + NODE_HEIGHT + 80;
            }
            
            layoutedNodes.push({
              ...pNode,
              position: { x: finalX, y: finalY }
            });
          } else {
            layoutedNodes.push(pNode);
          }
        } else {
          layoutedNodes.push(pNode);
        }
      });

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

