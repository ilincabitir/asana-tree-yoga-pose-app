const fs = require('fs');

module.exports = function makeWorkoutsModule(tree, WORKOUTS_FILE) {
  let workouts = [];
  let nextWorkoutId = 1;

  function loadWorkouts() {
    if (!fs.existsSync(WORKOUTS_FILE)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(WORKOUTS_FILE, 'utf8'));
      if (!Array.isArray(raw)) return;
      workouts = raw.map((workout) => ({
        id: Number(workout.id),
        name: String(workout.name || ''),
        items: Array.isArray(workout.items) ? workout.items : [],
      }));
      const maxId = workouts.reduce((acc, workout) => Math.max(acc, workout.id), 0);
      nextWorkoutId = maxId + 1;
      console.log(`Loaded ${workouts.length} workouts.`);
    } catch (e) {
      console.error('Failed to load workouts:', e);
    }
  }

  function saveWorkouts() {
    fs.writeFileSync(WORKOUTS_FILE, JSON.stringify(workouts, null, 2));
  }

  function getWorkouts() {
    return workouts;
  }

  function ensureWorkoutsForAllPoses() {
    const list = tree.toList();
    if (!list.length) return;
    let updated = false;
    list.forEach((node) => {
      const key = node.key;
      const exists = workouts.some((workout) => workout.items.includes(key));
      if (!exists) {
        workouts.push({
          id: nextWorkoutId++,
          name: node.data?.title ? node.data.title : `Pose ${key}`,
          items: [key],
        });
        updated = true;
      }
    });
    if (updated) saveWorkouts();
  }

  function reconcileWorkoutsWithTree() {
    const list = tree.toList();
    const validKeys = new Set(list.map((n) => n.key));
    let updated = false;
    workouts = workouts
      .map((workout) => {
        const items = Array.isArray(workout.items) ? workout.items.filter((item) => validKeys.has(item)) : [];
        if (items.length !== (workout.items || []).length) updated = true;
        return { ...workout, items };
      })
      .filter((w) => Array.isArray(w.items) && w.items.length > 0);
    if (updated) saveWorkouts();
  }

  function createWorkout(name, items) {
    const workout = { id: nextWorkoutId++, name: String(name || ''), items };
    workouts.push(workout);
    saveWorkouts();
    return workout;
  }

  function mergeWorkouts(leftId, rightId, name) {
    const left = workouts.find((w) => w.id === Number(leftId));
    const right = workouts.find((w) => w.id === Number(rightId));
    if (!left || !right) throw new Error('Workout not found');
    const mergedItems = Array.from(new Set([...left.items, ...right.items]));
    const conflicts = mergedItems.filter((value) =>
      workouts.some((workout) => workout.id !== left.id && workout.id !== right.id && workout.items.includes(value))
    );
    if (conflicts.length > 0) {
      const err = new Error(`poses already in a workout: ${conflicts.join(', ')}`);
      err.code = 'CONFLICTS';
      throw err;
    }
    const mergedName = name && String(name).trim() ? String(name) : `${left.name} + ${right.name}`;
    const merged = { id: nextWorkoutId++, name: mergedName, items: mergedItems };
    workouts = workouts.filter((w) => w.id !== left.id && w.id !== right.id);
    workouts.push(merged);
    saveWorkouts();
    return merged;
  }

  function deleteWorkout(id) {
    const target = workouts.find((workout) => workout.id === Number(id));
    if (!target) return false;
    workouts = workouts.filter((workout) => workout.id !== id);
    target.items.forEach((poseKey) => {
      const stillUsed = workouts.some((workout) => workout.items.includes(poseKey));
      if (!stillUsed) {
        const node = tree.search(tree.root, poseKey);
        const title = tree.isNil(node) ? `Pose ${poseKey}` : node.data?.title || `Pose ${poseKey}`;
        workouts.push({ id: nextWorkoutId++, name: title, items: [poseKey] });
      }
    });
    saveWorkouts();
    return true;
  }

  // initialize
  loadWorkouts();

  return {
    loadWorkouts,
    saveWorkouts,
    getWorkouts,
    ensureWorkoutsForAllPoses,
    reconcileWorkoutsWithTree,
    createWorkout,
    mergeWorkouts,
    deleteWorkout,
  };
};
