import React, { useMemo, useState } from 'react';
import DSUTreeView from '../components/DSUTreeView';
import { fetchFindSetByPose } from '../api';
import usePoseMap from '../hooks/usePoseMap';
import useDsuMap from '../hooks/useDsuMap';
import '../styles/pages/workouts.css';

export default function WorkoutsPage({ workouts, onMergeWorkouts, onDeleteWorkout }) {
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [mergeName, setMergeName] = useState('');
  const [findPose, setFindPose] = useState('');
  const [findResult, setFindResult] = useState(null);
  const [findError, setFindError] = useState('');

  const poseMap = usePoseMap();
  const dsuMap = useDsuMap(workouts);

  const workoutOptions = workouts.map((workout) => (
    <option key={workout.id} value={workout.id}>
      {workout.name}
    </option>
  ));

  const handleMerge = (e) => {
    e.preventDefault();
    if (!leftId || !rightId || leftId === rightId) return;
    const left = Number(leftId);
    const right = Number(rightId);
    onMergeWorkouts(left, right, mergeName || '');
    setLeftId('');
    setRightId('');
    setMergeName('');
  };

  const handleFindSet = async (e) => {
    e.preventDefault();
    setFindError('');
    setFindResult(null);
    if (!findPose) return;
    try {
      const data = await fetchFindSetByPose(Number(findPose));
      setFindResult(data);
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to find set.';
      setFindError(message);
    }
  };

  const memoPoseMap = useMemo(() => poseMap, [poseMap]);

  return (
    <div className="workouts-page">
      <header className="workouts-header">
        <h1>Workouts</h1>
        <p className="subtitle">Each workout is a disjoint-set tree built from your pose list.</p>
      </header>

      <section className="workouts-merge">
        <h2>Merge workouts</h2>
        <form className="merge-form" onSubmit={handleMerge}>
          <select value={leftId} onChange={(e) => setLeftId(e.target.value)}>
            <option value="">Select first workout</option>
            {workoutOptions}
          </select>
          <select value={rightId} onChange={(e) => setRightId(e.target.value)}>
            <option value="">Select second workout</option>
            {workoutOptions}
          </select>
          <input
            type="text"
            placeholder="Merged workout name"
            value={mergeName}
            onChange={(e) => setMergeName(e.target.value)}
          />
          <button className="nav-btn" type="submit">Merge</button>
        </form>
      </section>

      <section className="workouts-merge">
        <h2>Find set</h2>
        <form className="merge-form" onSubmit={handleFindSet}>
          <input
            type="text"
            placeholder="Pose difficulty"
            value={findPose}
            onChange={(e) => setFindPose(e.target.value)}
          />
          <button className="nav-btn" type="submit">Find set</button>
        </form>
        {findError && <div className="find-error">{findError}</div>}
        {findResult && (
          <div className="find-result">
            Workout: {findResult.workoutName} | Representative: {findResult.representative} | Members: {findResult.members.join(', ')}
          </div>
        )}
      </section>

      <section className="workout-grid">
        {workouts.length === 0 && (
          <div className="workouts-empty">No workouts yet. Create one to get started.</div>
        )}
        {workouts.map((workout) => {
          const items = workout.items;
          const parent = dsuMap[workout.id] || items.map((_, i) => i);
          return (
            <article key={workout.id} className="workout-card">
              <div className="workout-card__header">
                <h3>
                  {workout.name}
                  <span className="workout-set">{`{ ${items.join(', ')} }`}</span>
                </h3>
                <div className="workout-card__actions">
                  <span className="workout-card__meta">{items.length} poses</span>
                  {items.length >= 2 && (
                    <button
                      className="nav-btn ghost"
                      type="button"
                      onClick={() => onDeleteWorkout(workout.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <DSUTreeView items={items} parent={parent} poseMap={memoPoseMap} />
            </article>
          );
        })}
      </section>
    </div>
  );
}
