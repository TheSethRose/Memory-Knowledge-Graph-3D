// Global state variables
export let Graph = null;
export let graphData = null;
export let selectedNode = null;
export let highlightNodes = new Set();
export let highlightLinks = new Set();
export let showLabels = true;
export let showObservations = true;

// Function to update the global graph reference
export function setGraph(graph) {
    Graph = graph;
}

// Function to update the graph data
export function setGraphData(data) {
    graphData = data;
}

// Function to update the selected node
export function setSelectedNode(node) {
    selectedNode = node;
}

// Function to clear highlights
export function clearHighlights() {
    highlightNodes.clear();
    highlightLinks.clear();
}
