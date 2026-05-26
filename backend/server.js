const express = require('express');
const cors = require('cors');
const path = require('path');
const { RBTree } = require('./rbtree');

const makePoses = require('./poses');
const makeDsuStore = require('./dsuStore');
const registerPoseRoutes = require('./controllers/posesController');
const registerWorkoutRoutes = require('./controllers/workoutsController');

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, 'poses.json');
const DSU_FILE = path.join(__dirname, 'dsu.json');

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

const tree = new RBTree();
let nextId = 1;

const posesModule = makePoses(tree, DATA_FILE);
const dsuStore = makeDsuStore(DSU_FILE);

const allocatePoseId = () => {
  const id = nextId;
  nextId += 1;
  return id;
};

const loadPosesAndSyncDsu = () => {
  const loadedNextId = posesModule.loadPoses();
  if (Number.isFinite(loadedNextId)) nextId = loadedNextId;
  const poseKeys = tree.toList().map((n) => n.key);
  dsuStore.ensureNodes(poseKeys);
  dsuStore.save();
};

loadPosesAndSyncDsu();

posesModule.watchPoses(() => {
  console.log('Detected external change to poses.json; reloading poses and syncing DSU nodes.');
  loadPosesAndSyncDsu();
});

registerPoseRoutes(app, { tree, posesModule, dsuStore, allocatePoseId });
registerWorkoutRoutes(app, { tree, dsuStore });

app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
