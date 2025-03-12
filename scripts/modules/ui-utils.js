import { showObservations } from './state.js';
import { getLinksForNode, getConnectedNodes } from './graph-utils.js';

// Update selected node info panel
export function updateSelectedNodeInfo(node) {
    // Get the observations panel and toggle
    const observationsPanel = document.getElementById('observations-panel');

    if (!node) {
        document.getElementById('selected-node-info').innerHTML = '<h2>Select a node to see details</h2>';
        document.getElementById('observation-list').innerHTML = '';

        // If no node is selected, collapse the panel
        if (observationsPanel) {
            observationsPanel.classList.add('collapsed');
        }
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

    // Add relationships in a two-column grid
    if (links.length > 0) {
        html += '<h3>Relationships</h3>';
        html += '<div class="relationships-container">';

        links.forEach(link => {
            const isSource = (typeof link.source === 'object' ? link.source.id : link.source) === node.id;
            const otherNodeId = isSource
                ? (typeof link.target === 'object' ? link.target.id : link.target)
                : (typeof link.source === 'object' ? link.source.id : link.source);
            const otherNode = connectedNodes.find(n => n.id === otherNodeId);

            if (otherNode) {
                // Reversed format: relationship first, then name
                const prefix = isSource ? '→ ' : '← ';
                const relation = link.description || link.type;
                html += `<div class="relationship-item">${prefix}${relation}: <strong>${otherNode.name}</strong></div>`;
            }
        });

        html += '</div>';
    }

    // Update the node info section
    document.getElementById('selected-node-info').innerHTML = html;

    // Add observations to the separate observations list
    if (node.observations && node.observations.length > 0) {
        let observationsHtml = '<h3>Observations</h3>';
        node.observations.forEach(obs => {
            observationsHtml += `<div class="observation-item">${obs}</div>`;
        });
        document.getElementById('observation-list').innerHTML = observationsHtml;
    } else {
        document.getElementById('observation-list').innerHTML = '';
    }

    // Show the observations panel when a node is selected
    if (observationsPanel && observationsPanel.classList.contains('collapsed')) {
        observationsPanel.classList.remove('collapsed');
    }
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
