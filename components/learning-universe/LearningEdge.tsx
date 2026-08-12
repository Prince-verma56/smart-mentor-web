"use client";

import React, { memo, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath, Position, useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { useCanvasStore, useSelectionStore, LearningEdgeData, EdgeSemanticType } from '@/stores/learningUniverseStore';
import { EdgeTypeSelector } from './EdgeTypeSelector';

export type LearningEdgeProps = EdgeProps<LearningEdgeData & import('@xyflow/react').Edge>;

export const LearningEdgeComponent = ({
  id,
  source,
  target,
  sourceX: defaultSourceX,
  sourceY: defaultSourceY,
  targetX: defaultTargetX,
  targetY: defaultTargetY,
  sourcePosition: defaultSourcePosition,
  targetPosition: defaultTargetPosition,
  sourceHandleId,
  targetHandleId,
  data,
  style = {},
  markerEnd,
  selected,
}: LearningEdgeProps) => {
  const { getNode } = useReactFlow();
  const updateEdge = useCanvasStore(s => s.updateEdge);
  const editingEdgeId = useSelectionStore(s => s.editingEdgeId);
  const setEditingEdgeId = useSelectionStore(s => s.setEditingEdgeId);
  const isEditing = editingEdgeId === id;

  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  // Dynamic Routing Logic (Smart Edges)
  let sourceX = defaultSourceX;
  let sourceY = defaultSourceY;
  let targetX = defaultTargetX;
  let targetY = defaultTargetY;
  let sourcePosition = defaultSourcePosition;
  let targetPosition = defaultTargetPosition;

  // Only auto-route if the edge doesn't have explicit handles (e.g. AI generated)
  const isAutoRouted = !sourceHandleId && !targetHandleId;

  if (isAutoRouted && sourceNode && targetNode && sourceNode.measured && targetNode.measured) {
    const sW = sourceNode.measured.width || 260;
    const sH = sourceNode.measured.height || 150;
    const tW = targetNode.measured.width || 260;
    const tH = targetNode.measured.height || 150;

    const sCenterX = sourceNode.position.x + sW / 2;
    const sCenterY = sourceNode.position.y + sH / 2;
    const tCenterX = targetNode.position.x + tW / 2;
    const tCenterY = targetNode.position.y + tH / 2;

    const dx = tCenterX - sCenterX;
    const dy = tCenterY - sCenterY;

    // Determine the dominant direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal routing
      if (dx > 0) {
        // Target is to the right
        sourcePosition = Position.Right;
        targetPosition = Position.Left;
        sourceX = sourceNode.position.x + sW;
        sourceY = sCenterY;
        targetX = targetNode.position.x;
        targetY = tCenterY;
      } else {
        // Target is to the left
        sourcePosition = Position.Left;
        targetPosition = Position.Right;
        sourceX = sourceNode.position.x;
        sourceY = sCenterY;
        targetX = targetNode.position.x + tW;
        targetY = tCenterY;
      }
    } else {
      // Vertical routing
      if (dy > 0) {
        // Target is below
        sourcePosition = Position.Bottom;
        targetPosition = Position.Top;
        sourceX = sCenterX;
        sourceY = sourceNode.position.y + sH;
        targetX = tCenterX;
        targetY = targetNode.position.y;
      } else {
        // Target is above
        sourcePosition = Position.Top;
        targetPosition = Position.Bottom;
        sourceX = sCenterX;
        sourceY = sourceNode.position.y;
        targetX = tCenterX;
        targetY = targetNode.position.y + tH;
      }
    }
  }

  const isPracticeEdge = targetNode?.data?.type === 'practice' || targetNode?.data?.nodeCategory === 'PRACTICE';

  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  // Use SmoothStep for structured roadmap, Bezier for practice attachments
  const [edgePath, labelX, labelY] = isPracticeEdge 
    ? getBezierPath(pathParams)
    : getSmoothStepPath({ ...pathParams, borderRadius: 24 });

  const semanticType = (data?.semanticType as EdgeSemanticType) || 'dependency';
  
  // Style config based on semantic type
  const edgeConfig: Record<EdgeSemanticType, { stroke: string; strokeWidth: number; dasharray: string; labelBg: string }> = {
    // Original Lowercase Mappings
    prerequisite: { stroke: 'stroke-primary/50', strokeWidth: 2, dasharray: 'none', labelBg: 'bg-primary/10 text-primary' },
    dependency: { stroke: 'stroke-slate-500/50', strokeWidth: 1.5, dasharray: 'none', labelBg: 'bg-slate-500/10 text-slate-400' },
    unlock: { stroke: 'stroke-blue-500/50', strokeWidth: 2, dasharray: '5,5', labelBg: 'bg-blue-500/10 text-blue-400' },
    optional: { stroke: 'stroke-muted-foreground/30', strokeWidth: 1.5, dasharray: '2,4', labelBg: 'bg-muted/10 text-muted-foreground' },
    recommended: { stroke: 'stroke-amber-500/50', strokeWidth: 1.5, dasharray: '4,4', labelBg: 'bg-amber-500/10 text-amber-400' },
    parallel: { stroke: 'stroke-teal-500/50', strokeWidth: 1.5, dasharray: '3,3', labelBg: 'bg-teal-500/10 text-teal-400' },
    alternative: { stroke: 'stroke-purple-500/50', strokeWidth: 2, dasharray: 'none', labelBg: 'bg-purple-500/10 text-purple-400' },
    revision: { stroke: 'stroke-rose-500/50', strokeWidth: 1.5, dasharray: '5,5', labelBg: 'bg-rose-500/10 text-rose-400' },
    project_requirement: { stroke: 'stroke-orange-500/50', strokeWidth: 2, dasharray: 'none', labelBg: 'bg-orange-500/10 text-orange-400' },
    interview_requirement: { stroke: 'stroke-yellow-500/50', strokeWidth: 2, dasharray: 'none', labelBg: 'bg-yellow-500/10 text-yellow-400' },
    challenge: { stroke: 'stroke-cyan-500/50', strokeWidth: 2, dasharray: '10,5', labelBg: 'bg-cyan-500/10 text-cyan-400' },
    reference: { stroke: 'stroke-emerald-500/50', strokeWidth: 1.5, dasharray: '4,4', labelBg: 'bg-emerald-500/10 text-emerald-400' },
    knowledge_bridge: { stroke: 'stroke-indigo-500/50', strokeWidth: 1.5, dasharray: '6,4', labelBg: 'bg-indigo-500/10 text-indigo-400' },
    
    // New Uppercase Semantic Types Mappings
    PREREQUISITE: { stroke: 'stroke-primary/50', strokeWidth: 2.5, dasharray: 'none', labelBg: 'bg-primary/10 text-primary' },
    DEPENDS_ON: { stroke: 'stroke-slate-400/50', strokeWidth: 1.5, dasharray: 'none', labelBg: 'bg-slate-500/10 text-slate-400' },
    PART_OF: { stroke: 'stroke-teal-500/50', strokeWidth: 2, dasharray: 'none', labelBg: 'bg-teal-500/10 text-teal-400' },
    NEXT_STEP: { stroke: 'stroke-blue-400/50', strokeWidth: 2, dasharray: '4,4', labelBg: 'bg-blue-500/10 text-blue-400' },
    PRACTICE_OF: { stroke: 'stroke-purple-500/50', strokeWidth: 1.5, dasharray: '3,3', labelBg: 'bg-purple-500/10 text-purple-400' },
    PROJECT_OF: { stroke: 'stroke-orange-500/50', strokeWidth: 3, dasharray: 'none', labelBg: 'bg-orange-500/10 text-orange-400' },
    RELATED_TO: { stroke: 'stroke-emerald-500/50', strokeWidth: 1.5, dasharray: '2,4', labelBg: 'bg-emerald-500/10 text-emerald-400' },
    REQUIRES: { stroke: 'stroke-red-500/50', strokeWidth: 2, dasharray: 'none', labelBg: 'bg-red-500/10 text-red-400' },
    UNLOCK: { stroke: 'stroke-blue-500/50', strokeWidth: 2, dasharray: '5,5', labelBg: 'bg-blue-500/10 text-blue-400' },
    RECOMMENDED: { stroke: 'stroke-amber-500/50', strokeWidth: 1.5, dasharray: '4,4', labelBg: 'bg-amber-500/10 text-amber-400' },
    PARALLEL: { stroke: 'stroke-teal-500/50', strokeWidth: 1.5, dasharray: '3,3', labelBg: 'bg-teal-500/10 text-teal-400' },
    REVISION: { stroke: 'stroke-rose-500/50', strokeWidth: 1.5, dasharray: '5,5', labelBg: 'bg-rose-500/10 text-rose-400' }
  };

  const config = edgeConfig[semanticType] || edgeConfig.dependency;

  // Enhance styles if selected, and dampen practice edges
  const strokeClass = selected 
    ? 'stroke-primary filter drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' 
    : isPracticeEdge ? cn(config.stroke, 'opacity-40') : config.stroke;
    
  const strokeWidth = selected ? config.strokeWidth + 1 : isPracticeEdge ? 1 : config.strokeWidth;
  const dasharray = isPracticeEdge ? '5,5' : config.dasharray;

  return (
    <>
      {/* Invisible thicker interaction path for easier clicking/selecting */}
      <BaseEdge 
        path={edgePath} 
        style={{ strokeWidth: 20, strokeOpacity: 0, cursor: 'pointer' }}
        className="react-flow__edge-interaction z-10"
      />
      {/* Visual Edge */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd}
        style={{ 
          ...style,
          strokeWidth, 
          strokeDasharray: dasharray,
          animation: selected ? 'dash 1s linear infinite' : 'none'
        }}
        className={cn(strokeClass, "transition-colors duration-300", selected ? 'z-10' : 'z-0')}
      />
      {/* Edge Label Rendered in an overlay */}
      
      {((data?.label as string) || semanticType) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan z-20 group"
          >
            <div 
              onPointerDown={(e) => {
                e.stopPropagation();
                setEditingEdgeId(id);
              }}
              className={cn(
              "flex flex-col items-center px-3 py-1 rounded-2xl text-[10px] font-bold tracking-wide backdrop-blur-xl border transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer overflow-hidden",
              config.labelBg,
              selected ? 'ring-2 ring-primary/50 border-primary/50' : 'border-white/10'
            )}>
              <span className="uppercase whitespace-nowrap">{(data?.label as string) || semanticType.replace('_', ' ')}</span>
              <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-1 group-hover:mb-1 transition-all duration-300 text-[9px] font-normal text-current/70 max-w-[120px] text-center leading-tight">
                Click to edit relationship.
              </div>
            </div>
            
            {isEditing && (
              <EdgeTypeSelector 
                isRelative={true}
                onSelect={(newType) => {
                  updateEdge(id, { semanticType: newType, label: newType.replace('_', ' ') });
                  setEditingEdgeId(null);
                }}
                onCancel={() => setEditingEdgeId(null)}
              />
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const LearningEdge = memo(LearningEdgeComponent);
