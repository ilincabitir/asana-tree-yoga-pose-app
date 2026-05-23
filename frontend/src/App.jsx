import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WorkoutsPage from './pages/WorkoutsPage';
import { fetchWorkouts, deleteWorkout, mergeWorkouts as apiMergeWorkouts } from './api';

export default function App() {
  const [workouts, setWorkouts] = useState([]);

  const reloadWorkouts = useCallback(async () => {
    const list = await fetchWorkouts();
    setWorkouts(list);
  }, []);

  useEffect(() => {
    reloadWorkouts();
  }, [reloadWorkouts]);

  const mergeWorkouts = async (leftId, rightId, name) => {
    await apiMergeWorkouts({ leftId, rightId, name: name || '' });
    await reloadWorkouts();
  };

  const removeWorkout = async (id) => {
    await deleteWorkout(id);
    await reloadWorkouts();
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/workouts"
            element={
              <WorkoutsPage
                workouts={workouts}
                onMergeWorkouts={mergeWorkouts}
                onDeleteWorkout={removeWorkout}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
