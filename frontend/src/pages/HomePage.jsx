import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TreeView from '../components/TreeView';
import PoseModal from '../components/PoseModal';
import AddPoseModal from '../components/AddPoseModal';
import { useTreeData } from '../hooks/useTreeData';
import { fetchWorkouts } from '../api';
import { findNodeById } from '../utils/rbtree';
import '../styles/components/modal.css';
import '../styles/pages/home.css';

export default function HomePage() {
  const { tree, addPose, deletePose } = useTreeData();
  const [focusNode, setFocusNode] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [removeKey, setRemoveKey] = useState('');

  const handleAdd = async (pose) => {
    const newTree = await addPose(pose);
    setFocusNode(null);
    setShowAdd(false);
    return newTree;
  };

  const handleRemove = async () => {
    if (removeKey === '') return;
    const newTree = await deletePose(Number(removeKey));
    try {
      await fetchWorkouts();
    } catch {
      // ignore; workouts will refresh on next load
    }
    setShowRemove(false);
    setRemoveKey('');
    if (focusNode && focusNode.key === Number(removeKey)) setFocusNode(null);
    return newTree;
  };

  const handleNavigate = (dir) => {
    if (!focusNode || !tree) return;
    let next = null;
    if (dir === 'next') {
      next = inorderSuccessor(tree, focusNode);
    } else if (dir === 'prev') {
      next = inorderPredecessor(tree, focusNode);
    }
    if (next && next.data) {
      const fresh = findNodeById(tree, next.data.id);
      if (fresh) setFocusNode(fresh);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <p className="subtitle">A gentle path through every pose, ordered by difficulty.</p>
        <div className="home-actions">
          <button className="nav-btn" onClick={() => setShowAdd(true)}>Add Pose</button>
          <button className="nav-btn ghost" onClick={() => setShowRemove(true)}>Remove Pose</button>
        </div>
      </section>

      <main className="tree-area">
        <TreeView
          tree={tree}
          onNodeClick={(node) => setFocusNode(node)}
          focusNode={focusNode}
          highlightedId={focusNode?.data?.id}
          zoom={focusNode ? 1.6 : 1}
        />
      </main>

      <AnimatePresence>
        {focusNode && (
          <PoseModal
            node={focusNode}
            onClose={() => setFocusNode(null)}
            onNavigate={handleNavigate}
          />
        )}
        {showAdd && <AddPoseModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
        {showRemove && (
          <div className="modal-backdrop" onClick={() => setShowRemove(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Remove a pose</h2>
              <label>Difficulty (key) of pose to remove</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={removeKey}
                onChange={(e) => setRemoveKey(e.target.value)}
              />
              <div className="modal-actions">
                <button className="nav-btn ghost" onClick={() => setShowRemove(false)}>
                  Cancel
                </button>
                <button className="nav-btn" onClick={handleRemove}>Remove</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function inorderSuccessor(root, node) {
  const list = [];
  const walk = (n) => {
    if (!n) return;
    walk(n.left);
    list.push(n);
    walk(n.right);
  };
  walk(root);
  const idx = list.findIndex((n) => n.data?.id === node.data?.id);
  return idx >= 0 && idx + 1 < list.length ? list[idx + 1] : null;
}

function inorderPredecessor(root, node) {
  const list = [];
  const walk = (n) => {
    if (!n) return;
    walk(n.left);
    list.push(n);
    walk(n.right);
  };
  walk(root);
  const idx = list.findIndex((n) => n.data?.id === node.data?.id);
  return idx > 0 ? list[idx - 1] : null;
}
