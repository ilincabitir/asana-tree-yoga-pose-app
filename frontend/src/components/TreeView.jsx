import React, { useMemo, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import NodeCard from './NodeCard';
import { layoutTree } from '../utils/rbtree';
import '../styles/components/tree.css';

export default function TreeView({ tree, onNodeClick, highlightedId, focusNode, zoom = 1 }) {
  const { nodes, edges, width, height } = useMemo(() => layoutTree(tree), [tree]);
  const wrapperRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const updateSize = () => {
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!tree) {
    return (
      <div className="empty-tree">
        <p>Your tree is empty. Add your first pose to begin the journey.</p>
      </div>
    );
  }

  // Center on focused node if any
  let translate = { x: 0, y: 0 };
  if (focusNode) {
    const fNode = nodes.find((n) => n.data?.id === focusNode.data?.id);
    if (fNode) {
      const centerX = containerSize.width ? containerSize.width / 2 : window.innerWidth / 2;
      const topOffset = 80;
      translate = {
        x: centerX - fNode.x * zoom,
        y: topOffset - fNode.y * zoom,
      };
    }
  }

  return (
    <motion.div
      className="tree-canvas-wrapper"
      ref={wrapperRef}
      animate={{ x: translate.x, y: translate.y }}
      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
    >
      <motion.svg
        width={width}
        height={height + 200}
        animate={{ scale: zoom }}
        transition={{ duration: 0.6 }}
        style={{ transformOrigin: focusNode ? 'center center' : 'top left' }}
      >
        {edges.map((e, i) => (
          <motion.line
            key={i}
            initial={false}
            animate={{ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            stroke="#cdbfa8"
            strokeWidth={2}
          />
        ))}
        {nodes.map((n) => (
          <NodeCard
            key={n.data?.id ?? n.key}
            node={n}
            x={n.x}
            y={n.y}
            onClick={onNodeClick}
            highlighted={highlightedId === n.data?.id}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
}
