import React from 'react';
import { motion } from 'framer-motion';
import '../styles/components/node-card.css';

export default function NodeCard({ node, x, y, size = 140, onClick, highlighted }) {
  const isRed = node.color === 'red';
  const ringColor = isRed ? '#c97b7b' : node.color === 'black' ? '#3a3a3a' : '#6b6b6b';
  const radius = size / 2;
  const imgRadius = radius - 8;
  const clipId = `node-clip-${node.data?.id ?? node.key}`;
  const glowColor = isRed ? 'rgba(201,123,123,0.45)' : 'rgba(58,58,58,0.35)';
  return (
    <motion.g
      layout
      layoutId={`node-${node.data?.id ?? node.key}`}
      initial={false}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{ cursor: 'pointer' }}
      onClick={() => onClick && onClick(node)}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r={imgRadius} />
        </clipPath>
      </defs>
      <circle
        className="node-card__ring"
        cx="0"
        cy="0"
        r={radius}
        stroke={ringColor}
        strokeWidth={highlighted ? 5 : 2.5}
        style={{
          filter: highlighted
            ? `drop-shadow(0 0 18px ${glowColor})`
            : 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
        }}
      />
      {node.data?.photo ? (
        <image
          href={node.data.photo}
          x={-imgRadius}
          y={-imgRadius}
          width={imgRadius * 2}
          height={imgRadius * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <circle cx="0" cy="0" r={imgRadius} fill="#efe7d8" />
      )}
      <text
        className="node-card__label"
        x={0}
        y={radius + 18}
        textAnchor="middle"
      >
        {node.data?.title ?? `Key ${node.key}`}
      </text>
      <text
        className="node-card__meta"
        x={0}
        y={radius + 34}
        textAnchor="middle"
        fill={ringColor}
      >
        difficulty {node.key}
      </text>
    </motion.g>
  );
}
