import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/components/pose-modal.css';

export default function PoseModal({ node, onClose, onNavigate }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNavigate]);

  if (!node || !node.data) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="pose-detail-panel"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <div className="pose-detail-inner">
          <div className="pose-info">
            <h2>{node.data.title}</h2>
            <p className="pose-desc">{node.data.description}</p>
            <div className="pose-meta">
              <span className="difficulty-tag">difficulty {node.key}</span>
            </div>
            <div className="pose-nav">
              <div className="nav-actions" aria-label="Tree navigation">
                <button className="nav-action" onClick={() => onNavigate('prev')}>
                  Back
                </button>
                <button className="nav-action" onClick={() => onNavigate('next')}>
                  Next
                </button>
              </div>
              <button className="nav-btn ghost" onClick={onClose}>Back to tree</button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
