// Assigns x,y coordinates to each node for SVG rendering
export function layoutTree(root, nodeSize = 180, levelHeight = 200) {
  if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

  const nodes = [];
  const edges = [];
  let x = 0;

  const assign = (node, depth) => {
    if (!node) return;
    assign(node.left, depth + 1);
    const myX = x * nodeSize;
    const myY = depth * levelHeight;
    node._x = myX;
    node._y = myY;
    nodes.push({ ...node, x: myX, y: myY });
    x++;
    assign(node.right, depth + 1);
  };
  assign(root, 0);

  // build edges using stored coordinates
  const walk = (node) => {
    if (!node) return;
    if (node.left) {
      edges.push({ x1: node._x, y1: node._y, x2: node.left._x, y2: node.left._y });
      walk(node.left);
    }
    if (node.right) {
      edges.push({ x1: node._x, y1: node._y, x2: node.right._x, y2: node.right._y });
      walk(node.right);
    }
  };
  walk(root);

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const width = Math.max(...xs) - Math.min(...xs) + nodeSize * 2;
  const height = Math.max(...ys) + levelHeight;
  const minX = Math.min(...xs);

  // normalize so minX is some padding
  const padding = nodeSize;
  nodes.forEach((n) => (n.x = n.x - minX + padding));
  edges.forEach((e) => {
    e.x1 = e.x1 - minX + padding;
    e.x2 = e.x2 - minX + padding;
  });

  return { nodes, edges, width: width + padding, height: height + nodeSize };
}

// Find a node in serialized tree by id (data.id)
export function findNodeById(root, id) {
  if (!root) return null;
  if (root.data && root.data.id === id) return root;
  return findNodeById(root.left, id) || findNodeById(root.right, id);
}

// Build parent map for navigation
export function buildParentMap(root, parent = null, map = new Map()) {
  if (!root) return map;
  if (root.data) map.set(root.data.id, parent);
  buildParentMap(root.left, root, map);
  buildParentMap(root.right, root, map);
  return map;
}