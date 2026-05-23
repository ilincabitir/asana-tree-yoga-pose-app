const express = require('express');
const cors = require('cors');
const path = require('path');
const { RBTree } = require('./rbtree');

const makeWorkouts = require('./workouts');
const makePoses = require('./poses');
const registerPoseRoutes = require('./controllers/posesController');
const registerWorkoutRoutes = require('./controllers/workoutsController');

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, 'poses.json');
const WORKOUTS_FILE = path.join(__dirname, 'workouts.json');

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

const tree = new RBTree();
let nextId = 1;

const workoutsModule = makeWorkouts(tree, WORKOUTS_FILE);
const posesModule = makePoses(tree, DATA_FILE);

const allocatePoseId = () => {
  const id = nextId;
  nextId += 1;
  return id;
};

const loadPosesAndSyncWorkouts = () => {
  const loadedNextId = posesModule.loadPoses();
  if (Number.isFinite(loadedNextId)) nextId = loadedNextId;
  workoutsModule.ensureWorkoutsForAllPoses();
  workoutsModule.reconcileWorkoutsWithTree();
};

loadPosesAndSyncWorkouts();

posesModule.watchPoses(() => {
  console.log('Detected external change to poses.json; reloading poses and reconciling workouts.');
  loadPosesAndSyncWorkouts();
});

registerPoseRoutes(app, { tree, posesModule, workoutsModule, allocatePoseId });
registerWorkoutRoutes(app, workoutsModule);

app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
