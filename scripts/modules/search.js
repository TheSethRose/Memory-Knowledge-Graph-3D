// Search module for fuzzy matching nodes
import { graphData, setSelectedNode, Graph, highlightNodes, highlightLinks } from './state.js';
import { updateSelectedNodeInfo } from './ui-utils.js';

// Initialize search functionality
export function initSearch() {
    const searchPanel = document.getElementById('search-panel');
    const searchToggle = document.getElementById('search-toggle');
    const searchClose = document.querySelector('.search-close');
    const searchInput = document.getElementById('node-search');
    const searchResults = document.getElementById('search-results');

    // Add collapsed class by default
    searchPanel.classList.add('collapsed');

    // Toggle button click handler
    searchToggle.addEventListener('click', () => {
        searchPanel.classList.remove('collapsed');
        searchInput.focus();
    });

    // Close button handler
    searchClose.addEventListener('click', () => {
        searchPanel.classList.add('collapsed');
        searchInput.value = '';
        searchResults.innerHTML = '';
    });

    // Search input handler with debounce
    let debounceTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length >= 2) {
                const results = fuzzySearch(query);
                displaySearchResults(results);
            } else {
                searchResults.innerHTML = '';
            }
        }, 300);
    });

    // Handle keyboard navigation in search results
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchPanel.classList.add('collapsed');
            searchInput.value = '';
            searchResults.innerHTML = '';
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const firstResult = searchResults.querySelector('.search-result-item');
            if (firstResult) firstResult.focus();
        }
    });

    // Keyboard navigation within results
    searchResults.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (document.activeElement.nextElementSibling) {
                document.activeElement.nextElementSibling.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (document.activeElement.previousElementSibling) {
                document.activeElement.previousElementSibling.focus();
            } else {
                searchInput.focus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            document.activeElement.click();
        }
    });
}

// Fuzzy search function
function fuzzySearch(query) {
    if (!graphData || !graphData.nodes) return [];

    // Simple fuzzy matching algorithm
    const results = graphData.nodes
        .filter(node => {
            const name = (node.name || '').toLowerCase();
            const type = (node.type || '').toLowerCase();
            const id = (node.id || '').toString().toLowerCase();

            return name.includes(query) ||
                   type.includes(query) ||
                   id.includes(query);
        })
        .sort((a, b) => {
            // Sort by relevance - exact matches first, then by name
            const aName = (a.name || '').toLowerCase();
            const bName = (b.name || '').toLowerCase();

            const aExact = aName === query;
            const bExact = bName === query;

            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            const aStarts = aName.startsWith(query);
            const bStarts = bName.startsWith(query);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            return aName.localeCompare(bName);
        })
        .slice(0, 20); // Limit to 20 results

    return results;
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No matching nodes found</div>';
        return;
    }

    results.forEach(node => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.tabIndex = 0; // Make focusable for keyboard navigation

        resultItem.innerHTML = `
            <span class="search-result-name">${node.name || 'Unnamed'}</span>
            ${node.type ? `<span class="search-result-type">${node.type}</span>` : ''}
        `;

        resultItem.addEventListener('click', () => {
            // Find the node object in the graph (important for proper selection)
            if (Graph) {
                // Get the graph's internal node object
                const graphNode = Graph.graphData().nodes.find(n => n.id === node.id);

                if (graphNode) {
                    // Set selected node and update info panel
                    setSelectedNode(graphNode);
                    updateSelectedNodeInfo(graphNode);

                    // Clear previous highlights
                    highlightNodes.clear();
                    highlightLinks.clear();

                    // Highlight the selected node
                    highlightNodes.add(graphNode);

                    // Find links connected to the selected node
                    const { links } = Graph.graphData();
                    links.forEach(link => {
                        if (link.source.id === graphNode.id || link.target.id === graphNode.id) {
                            highlightLinks.add(link);
                            highlightNodes.add(link.source.id === graphNode.id ? link.target : link.source);
                        }
                    });

                    // Center the camera on the node using cameraPosition
                    Graph.cameraPosition(
                        { x: graphNode.x, y: graphNode.y, z: 500 }, // Position further away from the node for less zoom
                        graphNode,  // Look at the node
                        1000        // Transition duration
                    );

                    // Force a re-render to update node appearances
                    Graph.refresh();
                }
            }

            // Clear search and close panel
            document.getElementById('node-search').value = '';
            document.getElementById('search-panel').classList.add('collapsed');
        });

        searchResults.appendChild(resultItem);
    });
}
