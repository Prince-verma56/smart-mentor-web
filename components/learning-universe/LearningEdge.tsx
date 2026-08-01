"use client";

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { LearningEdgeData } from '@/stores/learningUniverseStore';

export const LearningEdgeComponent = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps<LearningEdgeData>) => {
  // Try SmoothStep first for a clean structured look, fallback to Bezier if positions dictate
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const semanticType = data?.semanticType || 'dependency';
  
  // Style config based on semantic type
  const edgeConfig = {
    prerequisite: {
      stroke: 'stroke-primary/50',
      strokeWidth: 2,
      dasharray: 'none',
      labelBg: 'bg-primary/10 text-primary',
    },
    unlock: {
      stroke: 'stroke-blue-500/50',
      strokeWidth: 2,
      dasharray: '5,5',
      labelBg: 'bg-blue-500/10 text-blue-400',
    },
    recommendation: {
      stroke: 'stroke-amber-500/50',
      strokeWidth: 1.5,
      dasharray: '4,4',
      labelBg: 'bg-amber-500/10 text-amber-400',
    },
    dependency: {
      stroke: 'stroke-slate-500/50',
      strokeWidth: 1.5,
      dasharray: 'none',
      labelBg: 'bg-slate-500/10 text-slate-400',
    },
    optional: {
      stroke: 'stroke-muted-foreground/30',
      strokeWidth: 1.5,
      dasharray: '2,4',
      labelBg: 'bg-muted/10 text-muted-foreground',
    },
    review_loop: {
      stroke: 'stroke-rose-500/50',
      strokeWidth: 1.5,
      dasharray: '5,5',
      labelBg: 'bg-rose-500/10 text-rose-400',
    },
    ai_suggested: {
      stroke: 'stroke-emerald-500/50',
      strokeWidth: 1.5,
      dasharray: '4,4',
      labelBg: 'bg-emerald-500/10 text-emerald-400',
    },
    alternative_path: {
      stroke: 'stroke-purple-500/50',
      strokeWidth: 2,
      dasharray: 'none',
      labelBg: 'bg-purple-500/10 text-purple-400',
    }
  };

  const config = edgeConfig[semanticType] || edgeConfig.dependency;

  // Enhance styles if selected
  const strokeClass = selected ? 'stroke-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : config.stroke;
  const strokeWidth = selected ? config.strokeWidth + 1 : config.strokeWidth;

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, strokeWidth, strokeDasharray: config.dasharray }}
        className={cn('transition-all duration-300', strokeClass, selected ? 'z-10' : 'z-0')}
      />
      {/* Edge Label Rendered in an overlay */}
      {(data?.label || semanticType) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan z-20"
          >
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/5 whitespace-nowrap transition-transform hover:scale-110",
              config.labelBg,
              selected ? 'ring-1 ring-primary/50' : ''
            )}>
              {data?.label || semanticType.replace('_', ' ')}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const LearningEdge = memo(LearningEdgeComponent);
