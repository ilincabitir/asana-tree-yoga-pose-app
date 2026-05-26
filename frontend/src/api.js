import axios from 'axios';
const BASE = 'http://localhost:4000/api';

export const fetchTree = () => axios.get(`${BASE}/tree`).then((r) => r.data.tree);
export const addPose = (pose) => axios.post(`${BASE}/poses`, pose).then((r) => r.data.tree);
export const deletePose = (difficulty) =>
  axios.delete(`${BASE}/poses/${difficulty}`).then((r) => r.data.tree);

export const fetchDsuState = () => axios.get(`${BASE}/dsu`).then((r) => r.data);
export const unionDsu = (a, b) => axios.post(`${BASE}/dsu/union`, { a, b }).then((r) => r.data);
export const fetchFindSetByPose = (pose) =>
  axios.get(`${BASE}/dsu/find-set`, { params: { pose } }).then((r) => r.data);
