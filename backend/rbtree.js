const RED = 'red';
const BLACK = 'black';

class RBNode {
  constructor(key, data = null) {
    this.key = key;
    this.data = data; // { id, title, description, photo }
    this.color = RED;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}


const Nil = new RBNode(0);
Nil.color = BLACK;
Nil.left = Nil.right = Nil.parent = Nil;

class RBTree {
  constructor() {
    this.root = Nil;
    this.Nil = Nil;
  }

  isNil(n) {
    return n === Nil;
  }

  createNode(key, data) {
    return new RBNode(key, data);
  }

  LeftRotate(x) {
    const y = x.right;
    x.right = y.left;
    if (y.left !== Nil) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === Nil) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  RightRotate(y) {
    const x = y.left;
    y.left = x.right;
    if (x.right !== Nil) x.right.parent = y;
    x.parent = y.parent;
    if (y.parent === Nil) this.root = x;
    else if (y === y.parent.left) y.parent.left = x;
    else y.parent.right = x;
    x.right = y;
    y.parent = x;
  }

  RBInsert(z) {
    let y = Nil;
    let x = this.root;
    while (x !== Nil) {
      y = x;
      if (z.key < x.key) x = x.left;
      else x = x.right;
    }
    z.parent = y;
    if (y === Nil) this.root = z;
    else if (z.key < y.key) y.left = z;
    else y.right = z;

    z.left = Nil;
    z.right = Nil;
    z.color = RED;
    this.RBInsertFixup(z);
  }

  RBInsertFixup(z) {
    while (z.parent.color === RED) {
      if (z.parent === z.parent.parent.left) {
        const y = z.parent.parent.right;
        if (y.color === RED) {
          z.parent.color = BLACK;
          y.color = BLACK;
          z.parent.parent.color = RED;
          z = z.parent.parent;
        } else {
          if (z === z.parent.right) {
            z = z.parent;
            this.LeftRotate(z);
          }
          z.parent.color = BLACK;
          z.parent.parent.color = RED;
          this.RightRotate(z.parent.parent);
        }
      } else {
        const y = z.parent.parent.left;
        if (y.color === RED) {
          z.parent.color = BLACK;
          y.color = BLACK;
          z.parent.parent.color = RED;
          z = z.parent.parent;
        } else {
          if (z === z.parent.left) {
            z = z.parent;
            this.RightRotate(z);
          }
          z.parent.color = BLACK;
          z.parent.parent.color = RED;
          this.LeftRotate(z.parent.parent);
        }
      }
    }
    this.root.color = BLACK;
  }

  minimum(x) {
    while (x.left !== Nil) x = x.left;
    return x;
  }

  maximum(x) {
    while (x.right !== Nil) x = x.right;
    return x;
  }

  successor(z) {
    if (z.right !== Nil) return this.minimum(z.right);
    let y = z.parent;
    while (y !== Nil && z === y.right) {
      z = y;
      y = y.parent;
    }
    return y;
  }

  predecessor(z) {
    if (z.left !== Nil) return this.maximum(z.left);
    let y = z.parent;
    while (y !== Nil && z === y.left) {
      z = y;
      y = y.parent;
    }
    return y;
  }

  search(node, key) {
    while (node !== Nil && key !== node.key) {
      if (key < node.key) node = node.left;
      else node = node.right;
    }
    return node;
  }

  RBDelete(z) {
    let y, x;
    if (z.left === Nil || z.right === Nil) y = z;
    else y = this.successor(z);

    const yOriginalColor = y.color;

    if (y.left !== Nil) x = y.left;
    else x = y.right;

    x.parent = y.parent;

    if (y.parent === Nil) this.root = x;
    else if (y === y.parent.left) y.parent.left = x;
    else y.parent.right = x;

    if (y !== z) {
      z.key = y.key;
      z.data = y.data;
    }

    if (yOriginalColor === BLACK) this.RBDeleteFixup(x);
    return y;
  }

  RBDeleteFixup(x) {
    while (x !== this.root && x.color === BLACK) {
      if (x === x.parent.left) {
        let w = x.parent.right;
        if (w.color === RED) {
          w.color = BLACK;
          x.parent.color = RED;
          this.LeftRotate(x.parent);
          w = x.parent.right;
        }
        if (w.left.color === BLACK && w.right.color === BLACK) {
          w.color = RED;
          x = x.parent;
        } else {
          if (w.right.color === BLACK) {
            w.left.color = BLACK;
            w.color = RED;
            this.RightRotate(w);
            w = x.parent.right;
          }
          w.color = x.parent.color;
          x.parent.color = BLACK;
          w.right.color = BLACK;
          this.LeftRotate(x.parent);
          x = this.root;
        }
      } else {
        let w = x.parent.left;
        if (w.color === RED) {
          w.color = BLACK;
          x.parent.color = RED;
          this.RightRotate(x.parent);
          w = x.parent.left;
        }
        if (w.right.color === BLACK && w.left.color === BLACK) {
          w.color = RED;
          x = x.parent;
        } else {
          if (w.left.color === BLACK) {
            w.right.color = BLACK;
            w.color = RED;
            this.LeftRotate(w);
            w = x.parent.left;
          }
          w.color = x.parent.color;
          x.parent.color = BLACK;
          w.left.color = BLACK;
          this.RightRotate(x.parent);
          x = this.root;
        }
      }
    }
    x.color = BLACK;
  }

  // Serialize tree to JSON-friendly structure
  serialize() {
    const helper = (node) => {
      if (node === Nil) return null;
      return {
        key: node.key,
        color: node.color,
        data: node.data,
        left: helper(node.left),
        right: helper(node.right),
      };
    };
    return helper(this.root);
  }

  // Inorder list of all poses (for persistence)
  toList() {
    const out = [];
    const walk = (n) => {
      if (n === Nil) return;
      walk(n.left);
      out.push({ key: n.key, data: n.data });
      walk(n.right);
    };
    walk(this.root);
    return out;
  }
}

module.exports = { RBTree, RED, BLACK };
