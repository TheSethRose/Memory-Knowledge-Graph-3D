// Theme colors
export const COLORS = {
    PERSON: '#ff9999',
    ENTITY: '#99ff99',
    LOCATION: '#9999ff',
    EVENT: '#ffff99',
    CONCEPT: '#ff99ff',
    OBJECT: '#99ffff',
    DEFAULT: '#cccccc'
};

// Initialize theme
export function initTheme() {
    // Set up dark theme
    document.body.style.backgroundColor = '#111';
    document.body.style.color = '#fff';

    // Apply theme to UI elements
    const elements = document.querySelectorAll('button, select, input[type="text"]');
    elements.forEach(el => {
        el.style.backgroundColor = '#333';
        el.style.color = '#fff';
        el.style.border = '1px solid #555';
    });

    // Style the container
    const container = document.getElementById('graph');
    if (container) {
        container.style.backgroundColor = '#111';
    }
}

// Get color based on node type
export function getNodeColor(node) {
    if (!node.type) return COLORS.DEFAULT;

    const type = node.type.toUpperCase();
    return COLORS[type] || COLORS.DEFAULT;
}
