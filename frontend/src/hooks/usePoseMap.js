import { useEffect, useState } from 'react';
import { fetchTree } from '../api';

export default function usePoseMap() {
  const [poseMap, setPoseMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const tree = await fetchTree();
        if (cancelled) return;
        const nextMap = {};
        const walk = (node) => {
          if (!node) return;
          if (node.key != null) nextMap[node.key] = node.data || {};
          walk(node.left);
          walk(node.right);
        };
        walk(tree);
        setPoseMap(nextMap);
      } catch {
        if (!cancelled) setPoseMap({});
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return poseMap;
}
