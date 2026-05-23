import React, { useMemo } from 'react';
import { layoutDsuForest } from '../utils/dsuTreeLayout';
import '../styles/components/dsu-tree.css';

export default function DSUTreeView({ items, parent, poseMap = {} }) {
  const { nodes, edges, width, height } = useMemo(() => {
    if (!items.length) return { nodes: [], edges: [], width: 0, height: 0 };
    return layoutDsuForest(items, parent);
  }, [items, parent]);
  const padding = 50;
  const size = 92;
  const radius = size / 2;
  const imgRadius = radius - 8;

  if (!items.length) {
    return <div className="dsu-empty">No poses in this workout yet.</div>;
  }

  return (
    <div className="dsu-canvas">
      <svg width={width + padding * 2} height={height + padding * 2}>
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={edge.x1 + padding}
            y1={edge.y1 + padding}
            x2={edge.x2 + padding}
            y2={edge.y2 + padding}
            stroke="#cdbfa8"
            strokeWidth={2}
          />
        ))}
        {nodes.map((node) => {
          const pose = poseMap[node.label] || {};
          const clipId = `dsu-clip-${node.id}`;
          return (
            <g key={node.id} transform={`translate(${node.x + padding}, ${node.y + padding})`}>
              <defs>
                <clipPath id={clipId}>
                  <circle cx="0" cy="0" r={imgRadius} />
                </clipPath>
              </defs>
              <circle className="dsu-node" r={radius} />
              {pose.photo ? (
                <image
                  href={pose.photo}
                  x={-imgRadius}
                  y={-imgRadius}
                  width={imgRadius * 2}
                  height={imgRadius * 2}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${clipId})`}
                />
              ) : (
                <circle className="dsu-node__fill" r={imgRadius} />
              )}
              <text className="dsu-label" textAnchor="middle" y={radius + 18}>
                {pose.title || `Pose ${node.label}`}
              </text>
              <text className="dsu-meta" textAnchor="middle" y={radius + 34}>
                difficulty {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
