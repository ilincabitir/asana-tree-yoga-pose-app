export function collectPoseKeys(root) {
  const keys = [];
  const walk = (node) => {
    if (!node) return;
    walk(node.left);
    keys.push(node.key);
    walk(node.right);
  };
  walk(root);
  return keys;
}
