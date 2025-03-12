import { showObservations } from './state.js';
import { getLinksForNode, getConnectedNodes } from './graph-utils.js';

// Load relationship mappings from config file
let relationConfig = {
    relationMappings: {},
    symmetricPatterns: [],
    commonVerbs: []
};

// Function to load relationship mappings
export async function loadRelationshipConfig() {
    try {
        const response = await fetch('/config/relationship-mappings.json');
        if (!response.ok) {
            console.warn('Failed to load relationship mappings');
            return;
        }
        relationConfig = await response.json();
        console.log('Loaded relationship mappings from config file');
    } catch (error) {
        console.error('Error loading relationship mappings:', error);
    }
}

// Load the config when the module is imported
loadRelationshipConfig();

// Helper function to reword relationship based on direction
function rewordRelationship(relation, isOutgoing) {
    // If it's an outgoing relationship, keep as is
    if (isOutgoing) {
        return relation;
    }

    // For incoming relationships, check if we have a mapping
    const lowerRelation = relation.toLowerCase();

    // Check in the loaded mappings
    for (const [key, value] of Object.entries(relationConfig.relationMappings || {})) {
        if (lowerRelation === key.toLowerCase()) {
            return value;
        }
    }

    // Special cases for symmetric relationships
    for (const pattern of relationConfig.symmetricPatterns || []) {
        if (lowerRelation.includes(pattern.toLowerCase())) {
            return relation; // Keep symmetric relationships as is
        }
    }

    // If no mapping exists, try to infer a reasonable transformation
    if (lowerRelation.startsWith('is ')) {
        // For "is X of" patterns, try to reverse the relationship
        if (lowerRelation.endsWith(' of')) {
            return `has ${lowerRelation.substring(3, lowerRelation.length - 3)}`;
        }
        return lowerRelation;
    }

    // For verbs, try to make passive form
    for (const verb of relationConfig.commonVerbs || []) {
        if (lowerRelation.startsWith(verb)) {
            return `is ${verb}d by`;
        }
    }

    // For verbs ending in 's', try to make passive form
    if (/^[a-z]+s\b/.test(lowerRelation)) {
        const baseVerb = lowerRelation.replace(/s\b/, '');
        return `is ${baseVerb}ed by`;
    }

    // Default fallback - just return the original relation
    return relation;
}

// Function to clean up relationship text for display
function formatRelationshipText(text) {
    // Remove redundant "is" and simplify phrases
    return text
        .replace(/^is\s+/, '')
        .replace(/\s+by$/, '')
        .replace(/\s+of$/, '');
}

// Update selected node info panel
export function updateSelectedNodeInfo(node) {
    console.log('Updating selected node info:', node ? node.id : 'null');

    // Get the observations panel and toggle
    const observationsPanel = document.getElementById('observations-panel');

    if (!observationsPanel) {
        console.error('Observations panel not found');
        return;
    }

    if (!node) {
        document.getElementById('selected-node-info').innerHTML = '<h2>Select a node to see details</h2>';
        document.getElementById('observation-list').innerHTML = '';

        // If no node is selected, collapse the panel
        observationsPanel.classList.add('collapsed');
        return;
    }

    console.log('Showing details for node:', node.id);

    // Get connected nodes and links
    const connectedNodes = getConnectedNodes(node.id);
    const links = getLinksForNode(node.id);

    // Build HTML for node info
    let html = `
        <h2>${node.name}</h2>
        <div class="node-basic-info">
            <p><strong>Type:</strong> ${node.type || 'Unknown'}</p>
            <p><strong>ID:</strong> ${node.id}</p>
        </div>
    `;

    // Group relationships by type
    const relationshipGroups = {};

    if (links.length > 0) {
        links.forEach(link => {
            const isSource = (typeof link.source === 'object' ? link.source.id : link.source) === node.id;
            const otherNodeId = isSource
                ? (typeof link.target === 'object' ? link.target.id : link.target)
                : (typeof link.source === 'object' ? link.source.id : link.source);
            const otherNode = connectedNodes.find(n => n.id === otherNodeId);

            if (otherNode) {
                const originalRelation = link.description || link.type;
                const direction = isSource ? 'outgoing' : 'incoming';

                // Reword the relationship based on direction
                const rewordedRelation = rewordRelationship(originalRelation, isSource);

                // Format the relationship text for cleaner display
                const relation = formatRelationshipText(rewordedRelation);

                const relationKey = `${direction}:${relation}`;

                if (!relationshipGroups[relationKey]) {
                    relationshipGroups[relationKey] = {
                        name: relation,
                        originalName: originalRelation,
                        direction: direction,
                        nodes: []
                    };
                }

                relationshipGroups[relationKey].nodes.push(otherNode);
            }
        });

        // Add relationships section with tabs for filtering
        html += `
            <div class="relationships-section">
                <h3>Relationships</h3>
                <div class="relationship-filters">
                    <button class="relationship-filter active" data-filter="all">All</button>
                    <button class="relationship-filter" data-filter="outgoing">Outgoing</button>
                    <button class="relationship-filter" data-filter="incoming">Incoming</button>
                </div>
                <div class="relationships-container">
        `;

        // Sort relationship groups by name
        const sortedGroups = Object.values(relationshipGroups).sort((a, b) => {
            // First sort by direction (outgoing first)
            if (a.direction !== b.direction) {
                return a.direction === 'outgoing' ? -1 : 1;
            }
            // Then sort by name
            return a.name.localeCompare(b.name);
        });

        sortedGroups.forEach(group => {
            const prefix = group.direction === 'outgoing' ? '→ ' : '← ';
            const directionClass = group.direction === 'outgoing' ? 'outgoing' : 'incoming';

            html += `<div class="relationship-group ${directionClass}">
                <div class="relationship-header">${prefix}${group.name}</div>
                <div class="relationship-items">`;

            group.nodes.forEach(node => {
                html += `<div class="relationship-item" data-node-id="${node.id}">${node.name}</div>`;
            });

            html += `</div></div>`;
        });

        html += `</div></div>`;
    }

    // Update the node info section
    const selectedNodeInfoElement = document.getElementById('selected-node-info');
    if (selectedNodeInfoElement) {
        selectedNodeInfoElement.innerHTML = html;
    } else {
        console.error('Selected node info element not found');
    }

    // Add event listeners for relationship filters
    document.querySelectorAll('.relationship-filter').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.relationship-filter').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            button.classList.add('active');

            // Get filter value
            const filter = button.getAttribute('data-filter');

            // Show/hide relationship groups based on filter
            document.querySelectorAll('.relationship-group').forEach(group => {
                if (filter === 'all' || group.classList.contains(filter)) {
                    group.style.display = 'block';
                } else {
                    group.style.display = 'none';
                }
            });
        });
    });

    // Add click event listeners for relationship items to navigate to related nodes
    document.querySelectorAll('.relationship-item').forEach(item => {
        item.addEventListener('click', () => {
            const nodeId = item.getAttribute('data-node-id');
            if (nodeId) {
                // Create and dispatch a custom event to trigger node selection
                const event = new CustomEvent('node-click', {
                    detail: connectedNodes.find(n => n.id === nodeId)
                });
                document.dispatchEvent(event);
            }
        });
    });

    // Add observations with categorization if possible
    const observationListElement = document.getElementById('observation-list');
    if (!observationListElement) {
        console.error('Observation list element not found');
    } else if (node.observations && node.observations.length > 0) {
        let observationsHtml = `
            <div class="observations-section">
                <h3>Observations</h3>
                <input type="text" class="observation-filter" placeholder="Filter observations...">
                <div class="observation-list">
        `;

        node.observations.forEach(obs => {
            observationsHtml += `<div class="observation-item">${obs}</div>`;
        });

        observationsHtml += `</div></div>`;
        observationListElement.innerHTML = observationsHtml;

        // Add event listener for observation filter
        const observationFilter = document.querySelector('.observation-filter');
        if (observationFilter) {
            observationFilter.addEventListener('input', (e) => {
                const filterText = e.target.value.toLowerCase();
                document.querySelectorAll('.observation-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(filterText)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    } else {
        observationListElement.innerHTML = '';
    }

    // Show the observations panel when a node is selected
    if (observationsPanel.classList.contains('collapsed')) {
        console.log('Showing observations panel');
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
