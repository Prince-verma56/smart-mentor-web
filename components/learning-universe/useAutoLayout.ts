"use client";

import { useCallback, useMemo } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useReactFlow, Node, Edge } from '@xyflow/react';

const useAutoLayout = () => {
  const { setNodes, setEdges } = useReactFlow();
  
  // Lazy-initialize ELK to prevent 'Illegal constructor' SSR error
  const elk = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new ELK();
    }
    return null;
  }, []);

  const getLayoutedElements = useCallback(async (nodes: Node[], edges: Edge[], layoutMode: string) => {
    // Determine ELK algorithm based on layout mode
    let algorithm = 'layered';
    let direction = 'RIGHT';

    if (layoutMode === 'hierarchy') {
      algorithm = 'layered';
      direction = 'DOWN';
    } else if (layoutMode === 'mindmap') {
      algorithm = 'radial';
    }

    const elkOptions: any = {
      'elk.algorithm': algorithm,
      'elk.layered.spacing.nodeNodeBetweenLayers': '160',
      'elk.spacing.nodeNode': '140',
      'elk.direction': direction,
      'elk.layered.crossingMinimization.strategy': 'INTERACTIVE',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    };

    const graph = {
      id: 'root',
      layoutOptions: elkOptions,
      children: nodes.map((n) => ({
        ...n,
        width: 300, // Approximate width of a LearningNode
        height: 150, // Approximate height
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sources: [e.source],
        targets: [e.target],
      })),
    };

    if (!elk) return { nodes, edges };

    try {
      const layoutedGraph = await elk.layout(graph);
      
      if (!layoutedGraph.children) return { nodes, edges };

      const layoutedNodes = nodes.map((node) => {
        const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
        if (layoutedNode) {
          return {
            ...node,
            position: {
              x: layoutedNode.x || 0,
              y: layoutedNode.y || 0,
            },
          };
        }
        return node;
      });

      return { nodes: layoutedNodes, edges };
    } catch (error) {
      console.error('ELK Layout Error:', error);
      return { nodes, edges };
    }
  }, []);

  return { getLayoutedElements };
};

export default useAutoLayout;
