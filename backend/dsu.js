const MAXN = 10000;

//create new set containing x
function makeSet(parent, rankArr, x) {
  parent[x] = x;
  rankArr[x] = 0;  //approximate height of the tree rooted at x, used for optimizarion of union
}
//find representative of set containing x 
function findSet(parent, x) {
  if (x !== parent[x]) {
    parent[x] = findSet(parent, parent[x]);
  }
  return parent[x];
}

function link(parent, rankArr, x, y) {
  if (rankArr[x] > rankArr[y]) { //compare ranks to decide which representative becomes the parent of the other
    parent[y] = x;
  } else {
    parent[x] = y;
    if (rankArr[x] === rankArr[y]) {
      rankArr[y]++; //pick one as root, y here, and increase its rank
    }
  }
}

//merge sets containing x and y
function union(parent, rankArr, x, y) {
  link(parent, rankArr, findSet(parent, x), findSet(parent, y));
}

function buildWorkoutDsu(items) {
  const n = items.length;
  const parent = new Array(n);
  const rankArr = new Array(n);
  for (let i = 0; i < n; i++) {
    makeSet(parent, rankArr, i);
  }
  for (let i = 1; i < n; i++) {
    union(parent, rankArr, 0, i);
  }
  return { parent, rankArr };
}

module.exports = {
  MAXN,
  makeSet,
  findSet,
  link,
  union,
  buildWorkoutDsu,
};
