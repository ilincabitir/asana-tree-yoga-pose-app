const express = require('express');

module.exports = function registerPoseRoutes(app, { tree, posesModule, dsuStore, allocatePoseId }) {
  const router = express.Router();

  router.get('/tree', (req, res) => {
    res.json({ tree: tree.serialize() });
  });

  router.post('/poses', (req, res) => {
    const { title, description, photo, difficulty } = req.body;
    if (!title || difficulty == null) {
      return res.status(400).json({ error: 'title and difficulty required' });
    }
    const id = allocatePoseId();
    const node = tree.createNode(Number(difficulty), {
      id,
      title,
      description: description || '',
      photo: photo || '',
      difficulty: Number(difficulty),
    });
    tree.RBInsert(node);
    posesModule.savePoses();
    const key = Number(difficulty);
    dsuStore.ensureNode(key);
    dsuStore.save();
    res.json({ tree: tree.serialize(), id });
  });

  router.delete('/poses/:difficulty', (req, res) => {
    const key = Number(req.params.difficulty);
    const node = tree.search(tree.root, key);
    if (tree.isNil(node)) {
      return res.status(404).json({ error: 'Pose not found' });
    }
    tree.RBDelete(node);
    posesModule.savePoses();
    res.json({ tree: tree.serialize() });
  });

  app.use('/api', router);
};
