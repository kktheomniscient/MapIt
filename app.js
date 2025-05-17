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

var container = document.getElementById('graph');

function saveGraphState() {
    const graphState = {
        nodes: nodes,
        edges: edges,
        texts: Array.from(nodeTexts.entries()),
        showTut: true
    };
    localStorage.setItem('mindmap_state', JSON.stringify(graphState));
}

function loadGraphState() {
    const savedState = localStorage.getItem('mindmap_state');
    if (savedState) {
        const graphState = JSON.parse(savedState);
        // Load nodes and edges
        if (graphState.nodes && graphState.nodes.length > 0) {
            nodes = graphState.nodes;
            edges = graphState.edges;
            nodeTexts = new Map(graphState.texts || []);
        } else {
            nodes = [...INITIAL_NODE];
            edges = [...INITIAL_EDGE];
        }

        // Handle showTut flag and save if needed
        if (graphState.showTut === undefined) {
            graphState.showTut = true;
            graphState.nodes = nodes;
            graphState.edges = edges;
            graphState.texts = Array.from(nodeTexts.entries());
            localStorage.setItem('mindmap_state', JSON.stringify(graphState));
        }
    } else {
        // First time setup
        nodes = [...INITIAL_NODE];
        edges = [...INITIAL_EDGE];
        saveGraphState(); // This will save with showTut = true
    }
}

loadGraphState();
var data = {
    nodes: nodes,
    edges: edges
};
var options = {
    layout: {
        hierarchical: {
            direction: "LR",
            levelSeparation: 250,
            nodeSpacing: 100,
            sortMethod: "directed",
            shakeTowards: "roots",
            parentCentralization: true,
            blockShifting: true,   // Added for better organization
            edgeMinimization: true
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
        fixed: false
    },
    edges: {
        smooth: {
            type: "cubicBezier",
            forceDirection: "horizontal"
        },
        width: 2,
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 0.5
            }
        },
    },
    physics: {
        enabled: true,
        hierarchicalRepulsion: {
            centralGravity: 0.1,
            springLength: 150,
            springConstant: 0.01,
            nodeDistance: 200,
            damping: 0.09
        },
        solver: 'hierarchicalRepulsion',
        stabilization: {
            iterations: 1000
        }
    }
};

// initialize your network!
var network = new vis.Network(container, data, options);

function zoom() {
    network.moveTo({
        position: { x: 1, y: 1 },
        scale: 1,
        offset: { x: 0, y: 0 },
        animation: true
    });
}

setTimeout(() => zoom(), 300)

function showTutorial() {
    const graphState = JSON.parse(localStorage.getItem('mindmap_state')) || {};
    if (graphState.showTut !== false) {
        document.getElementById('tutorial-popover').showPopover();
    }
}

// Add this function
function hideTutorial() {
    document.getElementById('tutorial-popover').hidePopover();
    const graphState = JSON.parse(localStorage.getItem('mindmap_state')) || {};
    graphState.showTut = false;
    localStorage.setItem('mindmap_state', JSON.stringify(graphState));
}

// Replace empty timeout with tutorial trigger
setTimeout(() => showTutorial(), 1300);

function addNode(event) {
    event.preventDefault();

    // Get values from form
    const nodeContent = document.getElementById('node-content').value;
    const nodeGroup = document.getElementById('node-group').value;
    const nodeText = document.getElementById('node-text').value;

    // Create new node with next available ID
    const newNodeId = nodes.length + 1;
    const newNode = {
        id: newNodeId,
        label: nodeContent,
        group: nodeGroup
    };

    if (nodeText) {
        nodeTexts.set(newNodeId, nodeText);
    }

    // Create new edge
    const newEdge = {
        from: selectedNode, 
        to: newNodeId
    };

    // Add new node and edge to arrays
    nodes.push(newNode);
    edges.push(newEdge);

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
        document.body.classList.add('sb-expanded');
        updateSidebarInfo(selectedNode);
    } else {
        // Nothing selected - collapse sidebar
        document.body.classList.remove('sb-expanded');
    }
});

// Auto-resize textarea on load
// document.addEventListener('DOMContentLoaded', function () {
//     const textarea = document.getElementById('node-text');
//     textarea.style.height = ''; // Reset height
//     textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
// });

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

function updateSidebarInfo(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Update sidebar info using .value instead of .textContent
    document.getElementById('node-content-sb').value = node.label || '';
    document.getElementById('node-group-sb').value = node.group || '';
    document.getElementById('node-text-sb').value = nodeTexts.get(nodeId) || '';

    const textarea = document.getElementById('node-text-sb');
    textarea.style.height = '';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

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

function downloadGraphImage() {
    // Get canvas and convert to image
    const canvas = document.getElementsByTagName('canvas')[0];
    if (!canvas) {
        console.error('No canvas found');
        return;
    }

    // Create an offscreen canvas
    const offscreenCanvas = document.createElement('canvas');
    const context = offscreenCanvas.getContext('2d');

    // Set dimensions
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    // Make background transparent by not filling it
    context.drawImage(canvas, 0, 0);

    // Create download link with PNG transparency support
    const link = document.createElement('a');
    link.download = 'mindmap.png';
    link.href = offscreenCanvas.toDataURL('image/png');

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
