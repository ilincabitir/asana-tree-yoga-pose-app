const fs = require('fs');

const { makeSet, findSet, union } = require('./dsu');

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

module.exports = function makeDsuStore(DSU_FILE) {
  let parent = [];
  let rankArr = [];

  function load() {
    if (!fs.existsSync(DSU_FILE)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(DSU_FILE, 'utf8'));
      if (!raw || typeof raw !== 'object') return;
      if (Array.isArray(raw.parent)) parent = raw.parent;
      if (Array.isArray(raw.rankArr)) rankArr = raw.rankArr;
    } catch (e) {
      console.error('Failed to load DSU:', e);
    }
  }

  function save() {
    try {
      fs.writeFileSync(DSU_FILE, JSON.stringify({ parent, rankArr }, null, 2));
    } catch (e) {
      console.error('Failed to save DSU:', e);
    }
  }

  function ensureNode(x) {
    const id = Number(x);
    if (!isFiniteNumber(id)) return false;
    if (parent[id] === undefined) {
      makeSet(parent, rankArr, id);
    }
    if (rankArr[id] === undefined) rankArr[id] = 0;
    return true;
  }

  function ensureNodes(ids) {
    if (!Array.isArray(ids)) return;
    ids.forEach((id) => ensureNode(id));
  }

  function unionNodes(a, b) {
    ensureNode(a);
    ensureNode(b);
    union(parent, rankArr, Number(a), Number(b));
    return findSet(parent, Number(a));
  }

  function findRepresentative(x) {
    ensureNode(x);
    return findSet(parent, Number(x));
  }

  function getState() {
    return { parent, rankArr };
  }

  // initialize
  load();

  return {
    load,
    save,
    ensureNode,
    ensureNodes,
    unionNodes,
    findRepresentative,
    getState,
  };
};
