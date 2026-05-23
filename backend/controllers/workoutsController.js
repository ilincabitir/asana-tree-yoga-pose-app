const express = require('express');
const { buildWorkoutDsu, findSet } = require('../dsu');

module.exports = function registerWorkoutRoutes(app, workoutsModule) {
  const router = express.Router();

  router.get('/workouts', (req, res) => {
    res.json({ workouts: workoutsModule.getWorkouts() });
  });

  router.post('/workouts/merge', (req, res) => {
    const { leftId, rightId, name } = req.body;
    try {
      const merged = workoutsModule.mergeWorkouts(leftId, rightId, name);
      res.json({ workout: merged });
    } catch (e) {
      if (e.code === 'CONFLICTS') return res.status(400).json({ error: e.message });
      return res.status(404).json({ error: e.message || 'Workout not found' });
    }
  });

  router.delete('/workouts/:id', (req, res) => {
    const id = Number(req.params.id);
    const ok = workoutsModule.deleteWorkout(id);
    if (!ok) return res.status(404).json({ error: 'Workout not found' });
    res.json({ ok: true });
  });

  router.post('/workouts/dsu', (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });
    const { parent } = buildWorkoutDsu(items);
    res.json({ parent });
  });

  router.get('/workouts/:id/find-set', (req, res) => {
    const id = Number(req.params.id);
    const pose = Number(req.query.pose);
    if (!Number.isFinite(pose)) return res.status(400).json({ error: 'pose must be a number' });
    const workout = workoutsModule.getWorkouts().find((w) => w.id === id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    const index = workout.items.indexOf(pose);
    if (index === -1) return res.status(404).json({ error: 'Pose not in workout' });
    const { parent } = buildWorkoutDsu(workout.items);
    const rootIndex = findSet(parent, index);
    const members = workout.items.filter((_, i) => findSet(parent, i) === rootIndex);
    res.json({ representative: workout.items[rootIndex], members });
  });

  router.get('/workouts/find-set', (req, res) => {
    const pose = Number(req.query.pose);
    if (!Number.isFinite(pose)) return res.status(400).json({ error: 'pose must be a number' });
    const workout = workoutsModule.getWorkouts().find((w) => w.items.includes(pose));
    if (!workout) return res.status(404).json({ error: 'Pose not in any workout' });
    const index = workout.items.indexOf(pose);
    const { parent } = buildWorkoutDsu(workout.items);
    const rootIndex = findSet(parent, index);
    const members = workout.items.filter((_, i) => findSet(parent, i) === rootIndex);
    res.json({ representative: workout.items[rootIndex], members, workoutId: workout.id, workoutName: workout.name });
  });

  app.use('/api', router);
};
