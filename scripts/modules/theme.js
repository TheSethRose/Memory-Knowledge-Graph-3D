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
