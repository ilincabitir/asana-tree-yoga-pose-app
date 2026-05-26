import React, { useEffect, useMemo, useState } from 'react';
import DSUTreeView from '../components/DSUTreeView';
import { fetchDsuState, fetchFindSetByPose, unionDsu } from '../api';
import usePoseMap from '../hooks/usePoseMap';
import '../styles/pages/workouts.css';

function findSet(parent, x) {
  if (parent[x] == null) parent[x] = x;
  if (parent[x] !== x) parent[x] = findSet(parent, parent[x]);
  return parent[x];
}

export default function WorkoutsPage() {
  const [leftRoot, setLeftRoot] = useState('');
  const [rightRoot, setRightRoot] = useState('');
  const [findPose, setFindPose] = useState('');
  const [findResult, setFindResult] = useState(null);
  const [findError, setFindError] = useState('');
  const [dsuState, setDsuState] = useState({ parent: [], rankArr: [] });
  const [dsuError, setDsuError] = useState('');

  const poseMap = usePoseMap();

  const poseKeys = useMemo(() => {
    return Object.keys(poseMap)
      .map((k) => Number(k))
      .filter((k) => Number.isFinite(k))
      .sort((a, b) => a - b);
  }, [poseMap]);

  const workouts = useMemo(() => {
    const baseParent = Array.isArray(dsuState.parent) ? dsuState.parent : [];
    const parentCopy = baseParent.slice();
    poseKeys.forEach((k) => {
      if (parentCopy[k] == null) parentCopy[k] = k;
    });

    const groups = new Map();
    poseKeys.forEach((k) => {
      const root = findSet(parentCopy, k);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(k);
    });

    return Array.from(groups.entries())
      .map(([root, items]) => ({ root, items: items.slice().sort((a, b) => a - b) }))
      .sort((a, b) => a.root - b.root);
  }, [poseKeys, dsuState.parent]);

  const workoutOptions = workouts.map((workout) => (
    <option key={workout.root} value={workout.root}>
      Workout {workout.root}
    </option>
  ));

  const reloadDsu = async () => {
    const state = await fetchDsuState();
    setDsuState({ parent: state.parent || [], rankArr: state.rankArr || [] });
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setDsuError('');
        const state = await fetchDsuState();
        if (cancelled) return;
        setDsuState({ parent: state.parent || [], rankArr: state.rankArr || [] });
      } catch (err) {
        if (cancelled) return;
        setDsuError(err?.response?.data?.error || 'Failed to load DSU state.');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMerge = (e) => {
    e.preventDefault();
    if (!leftRoot || !rightRoot || leftRoot === rightRoot) return;
    const left = Number(leftRoot);
    const right = Number(rightRoot);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return;
    unionDsu(left, right)
      .then(() => reloadDsu())
      .catch(() => {
        setDsuError('Failed to merge workouts.');
      });
    setLeftRoot('');
    setRightRoot('');
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
          <select value={leftRoot} onChange={(e) => setLeftRoot(e.target.value)}>
            <option value="">Select first workout</option>
            {workoutOptions}
          </select>
          <select value={rightRoot} onChange={(e) => setRightRoot(e.target.value)}>
            <option value="">Select second workout</option>
            {workoutOptions}
          </select>
          <button className="nav-btn" type="submit">Merge</button>
        </form>
        {dsuError && <div className="find-error">{dsuError}</div>}
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
            Representative: {findResult.representative} | Members: {findResult.members.join(', ')}
          </div>
        )}
      </section>

      <section className="workout-grid">
        {workouts.length === 0 && (
          <div className="workouts-empty">No workouts yet. Add poses and connect them to form components.</div>
        )}
        {workouts.map((workout) => {
          const items = workout.items;
          const globalParent = Array.isArray(dsuState.parent) ? dsuState.parent : [];
          const indexByPose = new Map(items.map((pose, idx) => [pose, idx]));
          const parent = items.map((pose) => {
            const parentPose = globalParent[pose] == null ? pose : globalParent[pose];
            const parentIndex = indexByPose.get(parentPose);
            return parentIndex == null ? indexByPose.get(pose) : parentIndex;
          });
          return (
            <article key={workout.root} className="workout-card">
              <div className="workout-card__header">
                <h3>
                  Workout {workout.root}
                  <span className="workout-set">{`{ ${items.join(', ')} }`}</span>
                </h3>
                <div className="workout-card__actions">
                  <span className="workout-card__meta">{items.length} poses</span>
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
