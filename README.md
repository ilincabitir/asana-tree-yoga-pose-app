# Asana Tree – a yoga pose application
An application I implemented as my final project for my Advanced Data Structures course. It works as both a yoga application as well as a data structure visualizer.


**Data Structures Implemented**: Red-Black Tree & Disjoint Sets  

**Technologies used**:

- Backend: Node.js, Express

- Frontend: React, Axios, Framer Motion

## 1. Application Overview 

Asana Tree is a full stack web application designed to help people organize their yoga workouts. Users can add different yoga poses, track them by difficulty and visualize them in the form of a Red-Black Tree, which they can parse and see the poses in order of their difficulty.When yoga poses are added or removed, the page updates dynamically to mirror structural balancing operations executing on the server. Users can also combine poses into workouts using disjoint sets and visualize these workouts as trees. 

Traditional software usually uses relational databases for organizing and querying data. This application takes a different approach by using efficient data structures directly in the backend to keep data accurate and organized and to group components effectively. 





**Home Page**


<img width="1898" height="990" alt="image" src="https://github.com/user-attachments/assets/d01d2ae6-6fec-4196-93fc-02deaf8ed7b8" />


**Red-Black Tree and yoga pose visualizer**


<img width="1898" height="994" alt="image" src="https://github.com/user-attachments/assets/079e8ec6-5dce-4b05-95b4-edc5cd41d0e8" />



**Navigating the tree**



<img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/0659d0d9-d2d2-461c-a8ca-5a8db6f952a3" />


**Workouts page** 



<img width="1893" height="1002" alt="image" src="https://github.com/user-attachments/assets/67e9aa69-cc00-488d-aa1a-06082e0b7ffe" />



**Set union and new workout tree**


<img width="1843" height="719" alt="image" src="https://github.com/user-attachments/assets/3b6d5e43-34f3-4481-8483-90327b7fca77" />




## 2.Theoretical background and implementation of data structures

### Data Structure 1: Red-Black Tree 
A Red-Black Tree is a type of Binary Search Tree that automatically keeps itself balanced by assigning each node a color: red or black. This balancing ensures that operations like searching, adding, and removing data remain fast and efficient, with a time complexity of O(log⁡n).


The main logic for the RBTree is fully implemented in the backend, in the file ```rbtree.js``` . 

This logic enforces 5 RBTree rules:

- Every node is either red or black.
- The root node is always black.
- Every leaf node (Nil) is black.
- If a node is red, both its children must be black (no adjacent red nodes).
For each node, all paths from the node to descendant leaves contain the exact same number of black nodes (the "black-height").


<img width="655" height="418" alt="Screenshot 2026-05-23 150648" src="https://github.com/user-attachments/assets/e4a0e7ac-8b3b-468d-a3cf-2d0e2514fc81" />




This is used in the application in the following way:

**Insertion** (```RBInsert``` & ```RBInsertFixup```  functions): New poses use their difficulty score as the tree's sorting key. Poses are initially placed in the tree using standard BST rules and colored Red. The application then calls RBInsertFixup to handle color violations. It fixes imbalances by checking the color of the node's uncle and executing structural shifts using LeftRotate or RightRotate operations. 

**Deletion** (```RBDelete``` & ```RBDeleteFixup``` functions): When a pose is removed via its difficulty value, the server uses tree.search to find its location. If the node has two children, successor and minimum functions swap its value with the next smallest node. If a black node is removed, it triggers RBDeleteFixup, which runs through a four-case balancing routine to maintain the tree's overall black-height balance. 





### Data Structure 2: Disjoint Set Union

The Disjoint Set Union data structure tracks elements partitioned into a number of disjoint (non-overlapping) subsets. In this application, DSU manages the organization of poses within specific workouts. It lets users group distinct poses into a single training routine. 


Union by Rank (link): When merging sets, the tree with the smaller depth (rank) is attached under the root of the tree with the larger depth. This minimizes tree heights and prevents performance degradation.


<img width="892" height="354" alt="Screenshot 2026-05-23 170849" src="https://github.com/user-attachments/assets/9b7bbb45-4584-4e41-bf7f-c2e9b5296e37" />


Path Compression (findSet): During set lookup operations, every visited node is updated to point directly to its root representative. This flattens the internal tree structure, giving a time complexity of almost O(1). 


<img width="1023" height="446" alt="Screenshot 2026-05-23 170923" src="https://github.com/user-attachments/assets/e36e80d3-c770-4db6-acfa-6e9663af8777" />



This is used in the application in the following way:


**Initialization** (```makeSet``` & ```buildWorkoutDsu``` functions): Every item in a workout array starts as an isolated root node pointing directly to itself (parent[x] = x) with an initial rank of zero. 

**Merging & Subset Analysis** (```union``` / ```find-set``` functions): The server uses union to automatically connect poses into unified sequences. When a user queries a pose inside a workout, the server evaluates its structure using a recursive path-compressing findSet(parent, index) function. It identifies the primary "representative" item of that set and filters out all other poses sharing that same root node to display them as a single connected sequence. 


## 3. UI bridging 

The application separates the backend’s mathematical processing from the frontend’s visual rendering. Frontend utility modules like rbtree.js and dsuTreeLayout.js convert raw JSON data into color-coded SVG graphics and screen coordinates. This allows custom React components to display and animate clear, structured visualizations of the trees directly in the browser.


## 4. How to Run and Install the Application

Prerequisites: Ensure you have ```Node.js``` (v16.x or newer recommended) and ```npm``` installed on your machine.

### Step 1: Clone and Set Up the Backend 

- Open a terminal window, navigate to the directory where you want to save the project, and clone the repository using your GitHub URL:

  
  ```git clone https://github.com/ilincabitir/asana-tree-yoga-pose-app.git```

- Navigate into the root directory containing your project's backend.

  ```cd asana-tree-yoga-pose-ap/backend ```

- Initialize and install dependencies by running:

 
 ```npm install express cors```

 - Start the backend server:


 ``` node server.js ```

 ### Step 2:  Set Up and Launch the Frontend React Client 

- Open a separate terminal window and navigate into your React application directory.

```cd ../asana-tree-yoga-pose-ap/backend ```

- Install the necessary frontend dependencies (including Axios for API requests and Framer Motion for animation layouts):

  ``` npm install axios framer-motion ```

- Start the local development server:


```npm start ```

-Open your web browser and navigate to the local address provided by the compiler (usually **http://localhost:3000**). You can now add poses, remove difficulty ranks and inspect the balanced structural layouts in real time!



 



