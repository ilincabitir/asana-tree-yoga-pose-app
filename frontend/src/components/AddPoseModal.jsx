import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/components/modal.css';

export default function AddPoseModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [photo, setPhoto] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!title.trim() || difficulty === '') return;
    onSubmit({ title, description, difficulty: Number(difficulty), photo });
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2>Add a new pose</h2>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tree Pose" />
        <label>Short description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A grounding standing pose..."
        />
        <label>Difficulty (number — used as tree key)</label>
        <input
          type="number"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          placeholder="e.g. 3"
        />
        <label>Photo</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {photo && <img src={photo} alt="preview" className="preview" />}
        <div className="modal-actions">
          <button className="nav-btn ghost" onClick={onClose}>Cancel</button>
          <button className="nav-btn" onClick={submit}>Add pose</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
