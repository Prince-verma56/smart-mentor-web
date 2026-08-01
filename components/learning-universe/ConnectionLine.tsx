import React from 'react';
import { ConnectionLineComponentProps, getBezierPath } from '@xyflow/react';

export const ConnectionLine = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineStyle,
  connectionStatus,
}: ConnectionLineComponentProps) => {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  const isValid = connectionStatus === 'valid';
  const isInvalid = connectionStatus === 'invalid';
  
  const strokeColor = isValid ? '#10b981' : isInvalid ? '#ef4444' : '#3b82f6';

  return (
    <g>
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={3}
        className="animate-pulse transition-colors duration-200 drop-shadow-md"
        d={edgePath}
        style={connectionLineStyle}
      />
      <circle cx={toX} cy={toY} fill="#fff" r={4} stroke={strokeColor} strokeWidth={2} className="transition-colors duration-200" />
    </g>
  );
};
