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

    // Primary Graph Definition
    const primaryGraph = {
      id: 'root-primary',
      layoutOptions: elkOptions,
      children: primaryNodes.map((n) => ({
        id: String(n.id),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      })),
      edges: edges
        .filter(e => primaryNodes.some(n => n.id === e.source) && primaryNodes.some(n => n.id === e.target))
        .map((e) => ({
          id: String(e.id),
          sources: [String(e.source)],
          targets: [String(e.target)],
        })),
    };

    // Practice Graph Definition (uses the same base layout style for consistency)
    const practiceGraph = {
      id: 'root-practice',
      layoutOptions: { ...elkOptions, 'elk.spacing.nodeNode': '40' }, // slightly tighter spacing
      children: practiceNodes.map((n) => ({
        id: String(n.id),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      })),
      edges: edges
        .filter(e => practiceNodes.some(n => n.id === e.source) && practiceNodes.some(n => n.id === e.target))
        .map((e) => ({
          id: String(e.id),
          sources: [String(e.source)],
          targets: [String(e.target)],
        })),
    };

    try {
      let layoutedNodes: Node[] = [];

      // A. Layout Primary Nodes
      const layoutedPrimary = await elk.layout(primaryGraph);
      let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;

      if (layoutedPrimary.children) {
        layoutedNodes = primaryNodes.map((node) => {
          const lNode = layoutedPrimary.children?.find((n) => n.id === String(node.id));
          if (lNode && lNode.x !== undefined && lNode.y !== undefined) {
            pMinX = Math.min(pMinX, lNode.x);
            pMaxX = Math.max(pMaxX, lNode.x + (lNode.width || NODE_WIDTH));
            pMinY = Math.min(pMinY, lNode.y);
            pMaxY = Math.max(pMaxY, lNode.y + (lNode.height || NODE_HEIGHT));
            return {
              ...node,
              position: { x: lNode.x, y: lNode.y },
            };
          }
          return node;
        });
      } else {
        layoutedNodes = [...primaryNodes];
      }

      // If no primary nodes, set safe defaults
      if (pMinX === Infinity) { pMinX = 0; pMaxX = 0; pMinY = 0; pMaxY = 0; }

      // B. Layout Practice Nodes (if any exist)
      if (practiceNodes.length > 0) {
        const layoutedPractice = await elk.layout(practiceGraph);
        let pracMinX = Infinity, pracMinY = Infinity;
        
        // Find local bounds to normalize offsets
        if (layoutedPractice.children) {
          layoutedPractice.children.forEach(lNode => {
             if (lNode.x !== undefined && lNode.y !== undefined) {
                pracMinX = Math.min(pracMinX, lNode.x);
                pracMinY = Math.min(pracMinY, lNode.y);
             }
          });
        }
        if (pracMinX === Infinity) { pracMinX = 0; pracMinY = 0; }

        // Determine regional offset based on layout rules
        let offsetX = 0;
        let offsetY = 0;
        const GAP = 250; // visual gap between primary zone and practice zone

        if (layoutMode === 'hierarchy' || layoutMode === 'tree') {
          // Far right column
          offsetX = pMaxX + GAP - pracMinX;
          offsetY = pMinY - pracMinY; // align top
        } else if (layoutMode === 'timeline') {
          // Parallel lane below
          offsetX = pMinX - pracMinX; // align left
          offsetY = pMaxY + GAP - pracMinY;
        } else if (layoutMode === 'mindmap' || layoutMode === 'radial') {
          // Independent outer ring area (shifted heavily to bottom-right to avoid primary radial cluster)
          offsetX = pMaxX + GAP - pracMinX;
          offsetY = pMaxY + GAP - pracMinY;
        } else {
          offsetX = pMaxX + GAP - pracMinX;
          offsetY = pMinY - pracMinY;
        }

        // Apply translated positions to practice nodes
        if (layoutedPractice.children) {
          practiceNodes.forEach((node) => {
            const lNode = layoutedPractice.children?.find((n) => n.id === String(node.id));
            if (lNode && lNode.x !== undefined && lNode.y !== undefined) {
              layoutedNodes.push({
                ...node,
                position: { x: lNode.x + offsetX, y: lNode.y + offsetY },
              });
            } else {
              layoutedNodes.push(node);
            }
          });
        } else {
          layoutedNodes.push(...practiceNodes);
        }
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

