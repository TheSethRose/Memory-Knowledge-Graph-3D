import { Graph, graphData, highlightNodes, highlightLinks, setSelectedNode } from './state.js';

// Filter graph based on search term and category
export function filterGraph(searchTerm, category) {
    if (!Graph || !graphData) return;

    // Clear highlights
    highlightNodes.clear();
    highlightLinks.clear();

    // Clear selected node
    setSelectedNode(null);
    document.getElementById('selected-node-info').innerHTML = '<h2>Select a node to see details</h2>';

    // If no search term and category is 'All', show all nodes
    if (!searchTerm && (category === 'All' || !category)) {
        Graph.graphData(graphData);
        return;
    }

    // Filter nodes based on search term and category
    const filteredNodes = graphData.nodes.filter(node => {
        // Check if node matches search term
        const matchesSearch = !searchTerm ||
            node.name.toLowerCase().includes(searchTerm) ||
            (node.type && node.type.toLowerCase().includes(searchTerm));

        // Check if node matches category
        const matchesCategory = category === 'All' || !category ||
            (node.type && node.type.toUpperCase() === category.toUpperCase());

        return matchesSearch && matchesCategory;
    });

    // Get IDs of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));

    // Filter links that connect filtered nodes
    const filteredLinks = graphData.links.filter(link =>
        filteredNodeIds.has(typeof link.source === 'object' ? link.source.id : link.source) &&
        filteredNodeIds.has(typeof link.target === 'object' ? link.target.id : link.target)
    );

    // Update graph with filtered data
    Graph.graphData({
        nodes: filteredNodes,
        links: filteredLinks
    });

    // Highlight filtered nodes and links
    filteredNodes.forEach(node => highlightNodes.add(node));
    filteredLinks.forEach(link => highlightLinks.add(link));

    // Zoom to fit
    Graph.zoomToFit(1000, 50);
}

// Get node by ID
export function getNodeById(id) {
    if (!graphData) return null;
    return graphData.nodes.find(node => node.id === id);
}

// Get links for a node
export function getLinksForNode(nodeId) {
    if (!graphData) return [];
    return graphData.links.filter(link =>
        (typeof link.source === 'object' ? link.source.id : link.source) === nodeId ||
        (typeof link.target === 'object' ? link.target.id : link.target) === nodeId
    );
}

// Get connected nodes for a node
export function getConnectedNodes(nodeId) {
    if (!graphData) return [];

    const links = getLinksForNode(nodeId);
    const connectedNodeIds = new Set();

    links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;

        if (sourceId === nodeId) {
            connectedNodeIds.add(targetId);
        } else {
            connectedNodeIds.add(sourceId);
        }
    });

    return Array.from(connectedNodeIds).map(id => getNodeById(id)).filter(Boolean);
}
