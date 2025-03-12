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

// Define theme variables
const lightTheme = {
    '--bg-color': '#f5f5f5',
    '--text-color': '#333',
    '--panel-bg': '#ffffff',
    '--panel-shadow': '0 2px 10px rgba(0, 0, 0, 0.1)',
    '--border-color': '#e0e0e0',
    '--button-bg': '#4285F4',
    '--button-text': '#ffffff',
    '--button-hover': '#3367d6',
    '--input-bg': '#ffffff',
    '--input-border': '#ddd',
    '--hover-bg': '#f0f0f0',
    '--outgoing-color': '#4CAF50',
    '--incoming-color': '#2196F3'
};

const darkTheme = {
    '--bg-color': '#1e1e1e',
    '--text-color': '#e0e0e0',
    '--panel-bg': '#252526',
    '--panel-shadow': '0 2px 10px rgba(0, 0, 0, 0.3)',
    '--border-color': '#3e3e42',
    '--button-bg': '#0e639c',
    '--button-text': '#ffffff',
    '--button-hover': '#1177bb',
    '--input-bg': '#3c3c3c',
    '--input-border': '#3e3e42',
    '--hover-bg': '#2d2d2d',
    '--outgoing-color': '#4CAF50',
    '--incoming-color': '#2196F3'
};

// Initialize theme
export function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Set up theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update theme toggle icon if needed
    const themeIcon = document.querySelector('.theme-toggle-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '🌓' : '☀️';
    }
}

// Get color based on node type
export function getNodeColor(node) {
    if (!node.type) return COLORS.DEFAULT;

    const type = node.type.toUpperCase();
    return COLORS[type] || COLORS.DEFAULT;
}
