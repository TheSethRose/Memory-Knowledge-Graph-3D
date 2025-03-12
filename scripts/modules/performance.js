import Stats from 'stats.js';

let stats = null;
let fpsCounter = null;
let lastTime = performance.now();
let frames = 0;

export function initPerformanceMonitoring() {
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    // Hide the Stats.js panel completely
    stats.dom.style.display = 'none';

    // Get reference to the FPS counter element
    fpsCounter = document.getElementById('fps-counter');

    // Initialize FPS display visibility - default to visible
    const fpsDisplay = document.getElementById('fps-display');
    if (fpsDisplay) {
        fpsDisplay.style.display = 'block';
    }

    // Start animation loop
    animate();
}

// Animation loop for stats
function animate() {
    stats.begin();

    // Update custom FPS counter
    frames++;
    const now = performance.now();
    if (now >= lastTime + 1000) {
        if (fpsCounter) {
            fpsCounter.textContent = Math.round(frames * 1000 / (now - lastTime));
        }
        frames = 0;
        lastTime = now;
    }

    stats.end();
    requestAnimationFrame(animate);
}

// Get stats instance
export function getStats() {
    return stats;
}

// Toggle FPS display visibility
export function toggleFpsDisplay(show) {
    const fpsDisplay = document.getElementById('fps-display');
    if (fpsDisplay) {
        fpsDisplay.style.display = show ? 'block' : 'none';
    }
}
