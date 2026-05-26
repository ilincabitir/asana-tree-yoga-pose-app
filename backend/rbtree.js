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

//configure Nil node 
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

  //left rotation on x
    //  x               y
    //  \              /
    //   y    ->      x
    //  /              \
    // T                 T
  LeftRotate(x) {
    const y = x.right;
    x.right = y.left;   // move T to become x's right child
    if (y.left !== Nil) 
      y.left.parent = x;

    y.parent = x.parent;
    if (x.parent === Nil) 
      this.root = y;
    else if (x === x.parent.left) 
      x.parent.left = y;
    else 
      x.parent.right = y;
    y.left = x;
    x.parent = y;
  }


    //   y                x
    //  /                  \
    // x          ->        y
    //  \                  /
    //   T                T


  RightRotate(y) {
    const x = y.left;
    y.left = x.right;  //make T the left child of y
    if (x.right !== Nil) 
      x.right.parent = y; //make y the parent of T
    x.parent = y.parent;
    if (y.parent === Nil) 
      this.root = x;
    else if (y === y.parent.left) 
      y.parent.left = x;
    else 
      y.parent.right = x;
    x.right = y;
    y.parent = x;
  }


  RBInsert(z) {
    //normal BST insertion  
    let y = Nil;  //remembers parent of x
    let x = this.root;  //walks through tree
    while (x !== Nil) {
      y = x;
      if (z.key < x.key) 
        x = x.left;
      else
         x = x.right;
    }
    z.parent = y;
    if (y === Nil) 
      this.root = z;
    else if (z.key < y.key) 
      y.left = z;
    else 
      y.right = z;

    //initialize node 
    z.left = Nil;
    z.right = Nil;
    z.color = RED;  
    this.RBInsertFixup(z);
  }

  RBInsertFixup(z) {
    //restore red black balance after insertion 
    //main issue: red parent, red child -> need to fix it
    while (z.parent.color === RED) {   //while z parent is red, we have an issue 
      if (z.parent === z.parent.parent.left) {
        const y = z.parent.parent.right;  //uncle node of z, z parent is left child of its parent, so uncle is right child
        if (y.color === RED) { //case 1: uncle is red, recolor uncle black, parent of z black, grandparent of z red
          z.parent.color = BLACK;
          y.color = BLACK;
          z.parent.parent.color = RED;
          z = z.parent.parent; //move upward to continue checking for issues
        } else {
          if (z === z.parent.right) {  //case 2: uncle is black & z is right child 
            z = z.parent; //move z up to parent, then left rotate on z to make it case 3
            this.LeftRotate(z); 
          }
          //case 3: uncle is black & z is left child
          //make parent black, grandparent red and rotate right at grandparent to fix issue
          z.parent.color = BLACK;         
          z.parent.parent.color = RED;
          this.RightRotate(z.parent.parent);
        }
      } else {  //symmetric to above, z parent is right child of its parent, so uncle is left child
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

  //next bigger node after z
  successor(z) {
    if (z.right !== Nil) 
      return this.minimum(z.right); //minimum of right subrtree 
    let y = z.parent;   //case of no right subtree, start from parent 
    while (y !== Nil && z === y.right) { //find first ancestor of z that is a left child, then return their parent
      z = y;
      y = y.parent;
    }
    return y;
  }

  predecessor(z) {
    if (z.left !== Nil) //maximum of left subtree
      return this.maximum(z.left);
    let y = z.parent; //case of no left subtree, start from parent
    while (y !== Nil && z === y.left) { //find first ancestor of z that is a right child, then return their parent
      z = y;
      y = y.parent;
    }
    return y;
  }

  search(node, key) {
    while (node !== Nil && key !== node.key) {
      if (key < node.key) 
        node = node.left;
      else 
        node = node.right;
    }
    return node;
  }

  RBDelete(z) {
    let y, x; //y node to remove, x child to replace y with
    if (z.left === Nil || z.right === Nil)  //z is leaf o rhas only one child, then just replace it 
      y = z;
    else 
      y = this.successor(z); //z has two children, remove its successor and copy its key into z
    //why successor? it never has a left child

    const yOriginalColor = y.color;

    if (y.left !== Nil) 
      x = y.left;
    else 
      x = y.right;

    x.parent = y.parent;

    if (y.parent === Nil) 
      this.root = x;
    else if (y === y.parent.left)
       y.parent.left = x;
    else 
      y.parent.right = x;

    if (y !== z) {
      z.key = y.key;
      z.data = y.data;
    }

    if (yOriginalColor === BLACK) this.RBDeleteFixup(x);  //if node was black, we may have violated black height, needs fixup
    return y;
  }

  RBDeleteFixup(x) {
    while (x !== this.root && x.color === BLACK) {
      if (x === x.parent.left) { //if x is left child 
        let w = x.parent.right; //sibling of x 
        if (w.color === RED) { //case 1: sibling is red
          w.color = BLACK; //color it black
          x.parent.color = RED; //color parent red
          this.LeftRotate(x.parent); //left rotate on parent 
          w = x.parent.right;
        }//case 1 becomes case 2,3 or 4 
        if (w.left.color === BLACK && w.right.color === BLACK) {
          w.color = RED; //make sibling red, shift problem up to parent 
          x = x.parent;
        } else {
          if (w.right.color === BLACK) {
            w.left.color = BLACK;
            w.color = RED;
            this.RightRotate(w);   
            w = x.parent.right;
          } //case 3 turns into 4
          w.color = x.parent.color;
          x.parent.color = BLACK;
          w.right.color = BLACK;
          this.LeftRotate(x.parent);
          x = this.root;
        }
      } else {   //mirroring of above, x is right child
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
