const express = require('express');

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

module.exports = function registerWorkoutRoutes(app, { tree, dsuStore }) {
  const router = express.Router();

  router.get('/workouts', (req, res) => {
    const poseKeys = tree.toList().map((n) => n.key);
    const groups = new Map();
    poseKeys.forEach((key) => {
      const root = dsuStore.findRepresentative(key);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(key);
    });
    const workouts = Array.from(groups.entries())
      .map(([root, items]) => ({
        id: root,
        name: `Workout ${root}`,
        items: items.slice().sort((a, b) => a - b),
      }))
      .sort((a, b) => a.id - b.id);

    res.json({ workouts });
  });

  router.get('/dsu', (req, res) => {
    const { parent, rankArr } = dsuStore.getState();
    res.json({ parent, rankArr });
  });

  router.post('/dsu/union', (req, res) => {
    const a = Number(req.body?.a);
    const b = Number(req.body?.b);
    if (!isFiniteNumber(a) || !isFiniteNumber(b)) {
      return res.status(400).json({ error: 'a and b must be numbers' });
    }
    const representative = dsuStore.unionNodes(a, b);
    dsuStore.save();
    const { parent, rankArr } = dsuStore.getState();
    res.json({ representative, parent, rankArr });
  });

  router.post('/dsu/reset', (req, res) => {
    const nodes = tree.toList();
    const state = dsuStore.resetDSU(nodes);
    res.json(state);
  });

  router.get('/dsu/find-set', (req, res) => {
    const pose = Number(req.query.pose);
    if (!isFiniteNumber(pose)) return res.status(400).json({ error: 'pose must be a number' });

    const node = tree.search(tree.root, pose);
    if (tree.isNil(node)) return res.status(404).json({ error: 'Pose not found' });

    const root = dsuStore.findRepresentative(pose);
    const poseKeys = tree.toList().map((n) => n.key);
    const members = poseKeys.filter((key) => dsuStore.findRepresentative(key) === root).sort((a, b) => a - b);
    res.json({ representative: root, members });
  });

  app.use('/api', router);
};
