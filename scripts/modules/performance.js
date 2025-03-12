import Stats from 'stats.js';

let stats = null;

export function initPerformanceMonitoring() {
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    // Position the stats panel
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px';
    stats.dom.style.left = '10px';

    // Toggle stats visibility based on checkbox
    document.getElementById('show-performance-stats').addEventListener('change', e => {
        stats.dom.style.display = e.target.checked ? 'block' : 'none';
    });

    // Start animation loop
    animate();
}

// Animation loop for stats
function animate() {
    stats.begin();
    stats.end();
    requestAnimationFrame(animate);
}

// Get stats instance
export function getStats() {
    return stats;
}
