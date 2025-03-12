import { showObservations } from './state.js';
import { getLinksForNode, getConnectedNodes } from './graph-utils.js';

// Update selected node info panel
export function updateSelectedNodeInfo(node) {
    if (!node) {
        document.getElementById('selected-node-info').innerHTML = '<h2>Select a node to see details</h2>';
        return;
    }

    // Get connected nodes and links
    const connectedNodes = getConnectedNodes(node.id);
    const links = getLinksForNode(node.id);

    // Build HTML for node info
    let html = `
        <h2>${node.name}</h2>
        <p><strong>Type:</strong> ${node.type || 'Unknown'}</p>
        <p><strong>ID:</strong> ${node.id}</p>
    `;

    // Add observations if available and enabled
    if (node.observations && node.observations.length > 0 && showObservations) {
        html += '<h3>Observations</h3><ul>';
        node.observations.forEach(obs => {
            html += `<li>${obs}</li>`;
        });
        html += '</ul>';
    }

    // Add relationships
    if (links.length > 0) {
        html += '<h3>Relationships</h3><ul>';
        links.forEach(link => {
            const isSource = (typeof link.source === 'object' ? link.source.id : link.source) === node.id;
            const otherNodeId = isSource
                ? (typeof link.target === 'object' ? link.target.id : link.target)
                : (typeof link.source === 'object' ? link.source.id : link.source);
            const otherNode = connectedNodes.find(n => n.id === otherNodeId);

            if (otherNode) {
                html += `<li>${isSource ? 'To' : 'From'} <strong>${otherNode.name}</strong>: ${link.description || link.type}</li>`;
            }
        });
        html += '</ul>';
    }

    // Update the info panel
    document.getElementById('selected-node-info').innerHTML = html;
}

// Create category options for filter
export function createCategoryOptions(data) {
    if (!data || !data.nodes) return;

    // Get unique categories
    const categories = new Set();
    data.nodes.forEach(node => {
        if (node.type) {
            categories.add(node.type.toUpperCase());
        }
    });

    // Get the category filter element
    const categoryFilter = document.getElementById('category-filter');

    // Clear existing options
    categoryFilter.innerHTML = '<option value="All">All</option>';

    // Add options for each category
    Array.from(categories).sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}
