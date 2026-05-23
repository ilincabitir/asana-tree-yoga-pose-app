export function layoutDsuForest(items, parent, options = {}) {
  const nodeSize = options.nodeSize ?? 90;
  const levelHeight = options.levelHeight ?? 120;
  const siblingGap = options.siblingGap ?? 30;
  const treeGap = options.treeGap ?? 90;

  const unitWidth = nodeSize + siblingGap;
  const treeGapUnits = treeGap / unitWidth;

  const childrenMap = new Map();
  const depths = new Map();

  for (let i = 0; i < items.length; i++) {
    const p = parent[i];
    if (p !== i) {
      if (!childrenMap.has(p)) childrenMap.set(p, []);
      childrenMap.get(p).push(i);
    }
  }

  const roots = items
    .map((_, i) => i)
    .filter((i) => parent[i] === i)
    .sort((a, b) => items[a] - items[b]);

  const positions = new Map();

  const layoutSubtree = (index, depth, xOffsetUnits) => {
    depths.set(index, depth);
    const children = childrenMap.get(index) || [];
    if (children.length === 0) {
      positions.set(index, xOffsetUnits + 0.5);
      return 1;
    }

    let width = 0;
    let cursor = xOffsetUnits;
    children.forEach((child) => {
      const childWidth = layoutSubtree(child, depth + 1, cursor);
      cursor += childWidth;
      width += childWidth;
    });

    positions.set(index, xOffsetUnits + width / 2);
    return width;
  };

  let cursor = 0;
  roots.forEach((root) => {
    const widthUnits = layoutSubtree(root, 0, cursor);
    cursor += widthUnits + treeGapUnits;
  });

  const nodes = items.map((value, index) => ({
    id: index,
    label: value,
    x: positions.get(index) * unitWidth,
    y: (depths.get(index) ?? 0) * levelHeight,
  }));

  const edges = [];
  for (let i = 0; i < items.length; i++) {
    if (parent[i] !== i) {
      const from = nodes[parent[i]];
      const to = nodes[i];
      edges.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
    }
  }

  const width = Math.max(cursor * unitWidth, nodeSize * 2);
  const maxDepth = Math.max(0, ...nodes.map((n) => n.y));
  const height = maxDepth + nodeSize * 2;

  return { nodes, edges, width, height };
}
