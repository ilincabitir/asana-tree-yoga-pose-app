import { useCallback, useEffect, useState } from 'react';
import { fetchTree, addPose as apiAddPose, deletePose as apiDeletePose } from '../api';

export function useTreeData() {
  const [tree, setTree] = useState(null);

  const reload = useCallback(async () => {
    const t = await fetchTree();
    setTree(t);
    return t;
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addPose = useCallback(
    async (pose) => {
      const newTree = await apiAddPose(pose);
      setTree(newTree);
      return newTree;
    },
    []
  );

  const deletePose = useCallback(
    async (difficulty) => {
      const newTree = await apiDeletePose(difficulty);
      setTree(newTree);
      return newTree;
    },
    []
  );

  return { tree, reload, addPose, deletePose };
}
