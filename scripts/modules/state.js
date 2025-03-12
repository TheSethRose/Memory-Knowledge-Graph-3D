// Global state variables
export let Graph = null;
export let graphData = null;
export let selectedNode = null;
export const highlightNodes = new Set();
export const highlightLinks = new Set();
export let showLabels = true;
export let showObservations = true;

// Function to update the global graph reference
export function setGraph(graph) {
    Graph = graph;
    console.log('Graph instance set:', graph ? 'success' : 'null');
}

// Function to update the graph data
export function setGraphData(data) {
    graphData = data;
    console.log('Graph data updated:', data ? `${data.nodes?.length || 0} nodes, ${data.links?.length || 0} links` : 'null');
}

// Function to update the selected node
export function setSelectedNode(node) {
    selectedNode = node;
    console.log('Selected node updated:', node ? node.id : 'null');
}

// Function to clear highlights
export function clearHighlights() {
    highlightNodes.clear();
    highlightLinks.clear();
    console.log('Highlights cleared');
}
