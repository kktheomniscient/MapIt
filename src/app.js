import { Network } from "vis-network/peer";
import "vis-network/styles/vis-network.css";
import "./style.css";

const INITIAL_NODE = [
  { id: 1, label: "Mind Mapping", group: "Mind Mapping" },

  // first-level branches
  { id: 2, label: "Habits", group: "Habits" },
  { id: 3, label: "Organization", group: "Organization" },
  { id: 4, label: "Learning Style", group: "Learning Style" },
  { id: 5, label: "Goals", group: "Goals" },
  { id: 6, label: "Motivation", group: "Motivation" },
  { id: 7, label: "Review", group: "Review" },

  // Habits → children
  { id: 8, label: "Plan", group: "Habits" },
  { id: 9, label: "Study", group: "Habits" },
  { id: 10, label: "System", group: "Habits" },

  // Organization → children
  { id: 11, label: "Breaks", group: "Organization" },

  // Learning Style → children
  { id: 12, label: "Read", group: "Learning Style" },
  { id: 13, label: "Listen", group: "Learning Style" },
  { id: 14, label: "Summarize", group: "Learning Style" },

  // Goals → children
  { id: 15, label: "Research", group: "Goals" },
  { id: 16, label: "Lecture", group: "Goals" },
  { id: 17, label: "Conclusions", group: "Goals" },

  // Motivation → children
  { id: 18, label: "Tips", group: "Motivation" },
  { id: 19, label: "Roadmap", group: "Motivation" },

  // Review → children
  { id: 20, label: "Notes", group: "Review" },
  { id: 21, label: "Method", group: "Review" },
  { id: 22, label: "Discuss", group: "Review" }
];

// ── Edges (parent → child) ─────────────────────────────
const INITIAL_EDGE = [
  // mind-map center
  { from: 1, to: 2 },  // Mind Mapping → Habits
  { from: 1, to: 3 },  // Mind Mapping → Organization
  { from: 1, to: 4 },  // Mind Mapping → Learning Style
  { from: 1, to: 5 },  // Mind Mapping → Goals
  { from: 1, to: 6 },  // Mind Mapping → Motivation
  { from: 1, to: 7 },  // Mind Mapping → Review

  // Habits
  { from: 2, to: 8 },
  { from: 2, to: 9 },
  { from: 2, to: 10 },

  // Organization
  { from: 3, to: 11 },

  // Learning Style
  { from: 4, to: 12 },
  { from: 4, to: 13 },
  { from: 4, to: 14 },

  // Goals
  { from: 5, to: 15 },
  { from: 5, to: 16 },
  { from: 5, to: 17 },

  // Motivation
  { from: 6, to: 18 },
  { from: 6, to: 19 },

  // Review
  { from: 7, to: 20 },
  { from: 7, to: 21 },
  { from: 7, to: 22 }
];

var nodes = [];
var edges = [];
let nodeTexts = new Map();
let selectedNode = null;
let Grid = true;
let connectMode = false;
let firstNodeToConnect = null;

function toggleSidebar() {
  const body = document.body;
  const isExpanded = body.classList.contains('sb-expanded');
  // console.log('Node selected:', selectedNode);
  if (isExpanded) {
    body.classList.remove('sb-expanded');
  } else {
    if (selectedNode) {
      body.classList.add('sb-expanded');
      updateSidebarInfo(selectedNode);
    } else {
      alert("Please select a node to update first!");
    }
  }
}


function updateSidebarInfo(nodeId) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;

  document.getElementById('node-content-sb').value = node.label || '';
  document.getElementById('node-group-sb').value = node.group || '';
  document.getElementById('node-text-sb').value = nodeTexts.get(nodeId) || '';

  const textarea = document.getElementById('node-text-sb');
  textarea.style.height = '';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

document.addEventListener("DOMContentLoaded", () => {

  var container = document.getElementById('graph');

  // Modify saveGraphState to only handle map data
  function saveGraphState() {
    const graphState = {
      nodes: nodes,
      edges: edges,
      texts: Array.from(nodeTexts.entries())
    };
    localStorage.setItem('mindmap_state', JSON.stringify(graphState));
  }

  // Add new function to handle tutorial state
  function saveTutorialState(show) {
    localStorage.setItem('mindmap_tutorial', JSON.stringify({ show }));
  }

  // Modify loadGraphState to only handle map data
  function loadGraphState() {
    const savedState = localStorage.getItem('mindmap_state');
    if (savedState) {
      const graphState = JSON.parse(savedState);
      if (graphState.nodes && graphState.nodes.length > 0) {
        nodes = graphState.nodes;
        edges = graphState.edges;
        nodeTexts = new Map(graphState.texts || []);
      } else {
        nodes = [...INITIAL_NODE];
        edges = [...INITIAL_EDGE];
      }
    } else {
      nodes = [...INITIAL_NODE];
      edges = [...INITIAL_EDGE];
      saveGraphState();
    }
  }

  loadGraphState();
  let nextNodeId = Math.max(...nodes.map(n => n.id)) + 1;
  var data = {
    nodes: nodes,
    edges: edges
  };

  // function toggleSidebar() {
  //   const body = document.body;
  //   const isExpanded = body.classList.contains('sb-expanded');

  //   if (isExpanded) {
  //     body.classList.remove('sb-expanded');
  //   } else {
  //     // Only expand if a node is selected
  //     if (selectedNode) {
  //       body.classList.add('sb-expanded');
  //       updateSidebarInfo(selectedNode);
  //     } else {
  //       alert("Please select a node to update first!");
  //     }
  //   }
  // }

  // var options = {
  //   layout: {
  //     hierarchical: {
  //       direction: "UD",
  //       levelSeparation: 250,
  //       nodeSpacing: 100,
  //       sortMethod: "directed",
  //       shakeTowards: "roots",
  //       parentCentralization: true,
  //       blockShifting: true,   // Added for better organization
  //       edgeMinimization: true
  //     }
  //   },
  //   nodes: {
  //     shape: "box",
  //     size: 30,
  //     font: {
  //       size: 32,
  //       color: "black",
  //     },
  //     borderWidth: 2,
  //     fixed: false
  //   },
  //   edges: {
  //     smooth: {
  //       type: "cubicBezier",
  //       forceDirection: "vertical"
  //     },
  //     width: 2,
  //     arrows: {
  //       to: {
  //         enabled: true,
  //         scaleFactor: 0.5
  //       }
  //     },
  //   },
  //   physics: {
  //     enabled: true,
  //     hierarchicalRepulsion: {
  //       centralGravity: 0.1,
  //       springLength: 150,
  //       springConstant: 0.01,
  //       nodeDistance: 220,
  //       damping: 0.09
  //     },
  //     solver: 'hierarchicalRepulsion',
  //     stabilization: {
  //       iterations: 1000
  //     }
  //   }
  // };

  var options = {
    layout: {
      hierarchical: {
        direction: "UD",
        levelSeparation: 250,
        nodeSpacing: 150,  // Increased from 100 to 150 for better horizontal spacing
        sortMethod: "directed",
        shakeTowards: "roots",
        parentCentralization: true,
        blockShifting: true,
        edgeMinimization: true,
        treeSpacing: 180,  // Added to ensure consistent spacing between branches
        levelSeparationMultiplier: 1.1  // Slight multiplier for vertical consistency
      }
    },
    nodes: {
      shape: "box",
      size: 30,
      font: {
        size: 32,
        color: "black",
      },
      borderWidth: 2,
      fixed: false,
      margin: {  // Added subtle margins to prevent edge crowding
        left: 15,
        right: 15
      }
    },
    edges: {
      smooth: {
        type: "cubicBezier",
        forceDirection: "vertical",
        roundness: 0.2  // Slight roundness for better visual flow
      },
      width: 2,
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5
        }
      },
      length: 120  // Added to maintain consistent edge lengths
    },
    physics: {
      enabled: true,
      hierarchicalRepulsion: {
        centralGravity: 0.08,  // Slightly reduced for less horizontal pull
        springLength: 160,  // Slightly increased for better spacing
        springConstant: 0.01,
        nodeDistance: 230,  // Increased from 220 for better horizontal separation
        damping: 0.09,
        avoidOverlap: 0.2  // Added to prevent slight overlaps
      },
      solver: 'hierarchicalRepulsion',
      stabilization: {
        iterations: 1000
      }
    }
  };

  // initialize your network!
  var network = new Network(container, data, options);

  function toggleConnectMode() {
    connectMode = !connectMode;
    const connectBtn = document.getElementById('connectNodesBtn');

    if (connectMode) {
      connectBtn.classList.add('bg-green-500');
      connectBtn.classList.remove('hover:bg-blue-500');
      // alert("Connect Mode: Click first node, then click second node to connect them");
    } else {
      connectBtn.classList.remove('bg-green-500');
      connectBtn.classList.add('hover:bg-blue-500');
      firstNodeToConnect = null;
      // Refresh network to remove any visual indicators
      network.setData({ nodes: nodes, edges: edges });
    }
  }

  network.on("beforeDrawing", (ctx) => {
    if (Grid) drawGrid(ctx, network);
  });

  function drawGrid(ctx, network) {
    const spacing = 70;
    const color = "rgba(0,0,0,0.2)";

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // *** Fix: reset the canvas transform ***
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const scale = network.getScale();

    const topLeft = network.DOMtoCanvas({ x: 0, y: 0 });
    const bottomRight = network.DOMtoCanvas({ x: width, y: height });

    const startX = topLeft.x - (topLeft.x % spacing);
    const endX = bottomRight.x;

    const startY = topLeft.y - (topLeft.y % spacing);
    const endY = bottomRight.y;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1 / (scale*2);

    ctx.beginPath();

    for (let x = startX; x <= endX; x += spacing) {
      const dom = network.canvasToDOM({ x, y: 0 });
      ctx.moveTo(dom.x, 0);
      ctx.lineTo(dom.x, height);
    }

    for (let y = startY; y <= endY; y += spacing) {
      const dom = network.canvasToDOM({ x: 0, y });
      ctx.moveTo(0, dom.y);
      ctx.lineTo(width, dom.y);
    }

    ctx.stroke();
    ctx.restore();
  }





  function zoom() {
    network.moveTo({
      position: { x: 1, y: 1 },
      scale: 1,
      offset: { x: 0, y: 0 },
      animation: true
    });
  }

  setTimeout(() => zoom(), 300);

  // Update tutorial functions
  function showTutorial() {
    const tutorialState = JSON.parse(localStorage.getItem('mindmap_tutorial'));
    if (!tutorialState || tutorialState.show !== false) {
      document.getElementById('tutorial-popover').showPopover();
    }
  }


  const hideBtn = document.getElementById("tutorialHideBtn");
  hideBtn.addEventListener("click", hideTutorial);
  function hideTutorial() {
    document.getElementById('tutorial-popover').hidePopover();
    saveTutorialState(false);
  }

  // Replace empty timeout with tutorial trigger
  setTimeout(() => showTutorial(), 1300);

  const addNodeBtn = document.getElementById("addNodeForm");
  addNodeBtn.addEventListener("submit", addNode);
  function addNode(event) {
    event.preventDefault();

    // Get values from form
    const nodeContent = document.getElementById('node-content').value;
    const nodeGroup = document.getElementById('node-group').value;
    const nodeText = document.getElementById('node-text').value;

    // Create new node with next available ID
    const newNodeId = nextNodeId++;
    const newNode = {
      id: newNodeId,
      label: nodeContent,
      group: nodeGroup
    };

    if (nodeText) {
      nodeTexts.set(newNodeId, nodeText);
    }

    // Create new edge

    if (selectedNode) {
      const newEdge = {
        from: selectedNode,
        to: newNodeId
      };
      // Add new edge to array
      edges.push(newEdge);
    }

    // Add new node to array
    nodes.push(newNode);
    

    // Update the network
    network.setData({ nodes: nodes, edges: edges });
    zoom();
    saveGraphState();

    // Close popover and reset form
    document.getElementById('popover').hidePopover();
    event.target.reset();
    document.body.classList.remove('sb-expanded');
  }

  network.on("select", function (params) {
    if (params.nodes.length > 0) {
      // Node is selected - expand sidebar
      selectedNode = params.nodes[0];
      // console.log('Node selected:', selectedNode);
      // document.body.classList.add('sb-expanded');
      // updateSidebarInfo(selectedNode);
      if (connectMode) {
        if (!firstNodeToConnect) {
          // First node selected
          firstNodeToConnect = selectedNode;
          // alert(`First node selected (ID: ${selectedNode}). Now select the second node to connect.`);
        } else if (firstNodeToConnect !== selectedNode) {
          // Second node selected - create connection
          const newEdge = {
            from: firstNodeToConnect,
            to: selectedNode
          };

          // Check if edge already exists
          const edgeExists = edges.some(edge =>
            (edge.from === newEdge.from && edge.to === newEdge.to) ||
            (edge.from === newEdge.to && edge.to === newEdge.from)
          );

          if (!edgeExists) {
            edges.push(newEdge);
            network.setData({ nodes: nodes, edges: edges });
            saveGraphState();
            // alert(`Connected node ${firstNodeToConnect} to node ${selectedNode}`);
          } else {
            alert("These nodes are already connected!");
          }

          // Reset connection mode
          firstNodeToConnect = null;
          connectMode = false;
          document.getElementById('connectNodesBtn').classList.remove('bg-green-500');
          document.getElementById('connectNodesBtn').classList.add('hover:bg-blue-500');
        } else {
          alert("Please select a different node to connect to.");
        }
      }
    } else {
      // Nothing selected - collapse sidebar
      selectedNode = null;
      document.body.classList.remove('sb-expanded');
    }
  });

  // Auto-resize textarea on load
  // document.addEventListener('DOMContentLoaded', function () {
  //     const textarea = document.getElementById('node-text');
  //     textarea.style.height = ''; // Reset height
  //     textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
  // });

  const connectNodesBtn = document.getElementById('connectNodesBtn');
  connectNodesBtn.addEventListener('click', toggleConnectMode);

  const nodeInfoBtn = document.getElementById("nodeInfo");
  nodeInfoBtn.addEventListener("click", toggleSidebar);

  const deleteAllBtn = document.getElementById("deleteAll")
  deleteAllBtn.addEventListener("click", deleteAll);
  function deleteAll() {
    nodes.length = 0;
    edges.length = 0;
    nodeTexts.clear();
    selectedNode = null;
    network.setData({ nodes: [], edges: [] });
    saveGraphState();
  }

  // const deleteBtn = document.getElementById("deleteSelectedNode");
  const NavdeleteBtn = document.getElementById("navDeleteNode");
  // deleteBtn.addEventListener("click",deleteSelectedNode)
  NavdeleteBtn.addEventListener("click",deleteSelectedNode)
  function deleteSelectedNode() {
    const selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length === 0) {
      alert("Please select a node to delete");
      return;
    }

    const nodeId = selectedNodes[0];

    // Remove all connected edges
    const connectedEdges = network.getConnectedEdges(nodeId);
    edges = edges.filter(edge => !connectedEdges.includes(edge.id));

    // Remove the node
    nodes = nodes.filter(node => node.id !== nodeId);

    // Remove any stored text
    nodeTexts.delete(nodeId);

    // Update the network
    network.setData({ nodes: nodes, edges: edges });
    zoom();
    saveGraphState();
    document.body.classList.remove('sb-expanded');
  }

  // function updateSidebarInfo(nodeId) {
  //   const node = nodes.find(n => n.id === nodeId);
  //   if (!node) return;

  //   // Update sidebar info using .value instead of .textContent
  //   document.getElementById('node-content-sb').value = node.label || '';
  //   document.getElementById('node-group-sb').value = node.group || '';
  //   document.getElementById('node-text-sb').value = nodeTexts.get(nodeId) || '';

  //   const textarea = document.getElementById('node-text-sb');
  //   textarea.style.height = '';
  //   textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  // }
  
  const UpdateNodeInfoBtn = document.getElementById("UpdateNodeInfo");
  UpdateNodeInfoBtn.addEventListener("click", updateNodeInfo);
  function updateNodeInfo() {
    if (!selectedNode) return;

    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return;

    // Get updated values
    const newContent = document.getElementById('node-content-sb').value;
    const newGroup = document.getElementById('node-group-sb').value;
    const newText = document.getElementById('node-text-sb').value;

    // Update node
    node.label = newContent;
    node.group = newGroup;

    // Update or remove text
    if (newText) {
      nodeTexts.set(selectedNode, newText);
    } else {
      nodeTexts.delete(selectedNode);
    }

    // Update the network
    network.setData({ nodes: nodes, edges: edges });
    zoom();
    saveGraphState();
    document.body.classList.remove('sb-expanded');
  }
  const downloadGraphImageBtn = document.getElementById("downloadGraphImage");
  downloadGraphImageBtn.addEventListener("click", downloadGraphImage);
  async function downloadGraphImage() {
    // Remove grid
    Grid = false;
    network.redraw();

    // Store current view position
    const originalView = network.getViewPosition();
    const originalScale = network.getScale();

    try {
      // Zoom out to show entire graph
      network.fit({
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad'
        }
      });

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 600));

      // Get canvas and convert to image
      const canvas = document.getElementsByTagName('canvas')[0];
      if (!canvas) {
        console.error('No canvas found');
        return;
      }

      // Create an offscreen canvas
      const offscreenCanvas = document.createElement('canvas');
      const context = offscreenCanvas.getContext('2d');

      // Set dimensions to match the network container
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;

      // Make background white (or transparent if you prefer)
      // context.fillStyle = 'white';
      // context.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

      // Draw the network
      context.drawImage(canvas, 0, 0);

      // Create download link
      const link = document.createElement('a');
      link.download = 'mindmap.png';
      link.href = offscreenCanvas.toDataURL('image/png');

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error during download:', error);
    } finally {
      // Restore original view
      network.moveTo({
        position: originalView,
        scale: originalScale,
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad'
        }
      });

      // Restore grid
      Grid = true;
      network.redraw();
    }
  }

});