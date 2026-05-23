import axios from 'axios';
const BASE = 'http://localhost:4000/api';

export const fetchTree = () => axios.get(`${BASE}/tree`).then((r) => r.data.tree);
export const addPose = (pose) => axios.post(`${BASE}/poses`, pose).then((r) => r.data.tree);
export const deletePose = (difficulty) =>
  axios.delete(`${BASE}/poses/${difficulty}`).then((r) => r.data.tree);
export const fetchWorkoutDsu = (items) =>
  axios.post(`${BASE}/workouts/dsu`, { items }).then((r) => r.data.parent);
export const fetchWorkouts = () => axios.get(`${BASE}/workouts`).then((r) => r.data.workouts);
export const deleteWorkout = (id) => axios.delete(`${BASE}/workouts/${id}`);
export const fetchFindSet = (workoutId, pose) =>
  axios.get(`${BASE}/workouts/${workoutId}/find-set`, { params: { pose } }).then((r) => r.data);
export const mergeWorkouts = (payload) =>
  axios.post(`${BASE}/workouts/merge`, payload).then((r) => r.data.workout);
export const fetchFindSetByPose = (pose) =>
  axios.get(`${BASE}/workouts/find-set`, { params: { pose } }).then((r) => r.data);
