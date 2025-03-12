// Try to import Stats from the module if available
let Stats;
try {
    // For Vite/module environment
    import('stats.js').then(module => {
        Stats = module.default;
        initStats();
    }).catch(err => {
        // Fallback to window.Stats (script tag loading)
        Stats = window.Stats;
        initStats();
    });
} catch (e) {
    // Fallback to window.Stats (script tag loading)
    Stats = window.Stats;
    setTimeout(initStats, 0);
}

let stats = null;
let fpsCounter = null;
let lastTime = performance.now();
let frames = 0;
let animationId = null;

function initStats() {
    // Check if Stats is available
    if (!Stats) {
        console.warn('Stats.js is not available. Performance monitoring will be limited.');
        // Create a minimal stats object with required methods
        stats = {
            begin: () => {},
            end: () => {},
            dom: document.createElement('div')
        };
    } else {
        try {
            stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom);

            // Hide the Stats.js panel completely
            stats.dom.style.display = 'none';
        } catch (error) {
            console.warn('Error initializing Stats.js:', error);
            stats = {
                begin: () => {},
                end: () => {},
                dom: document.createElement('div')
            };
        }
    }

    // Start animation loop if not already started
    if (!animationId) {
        animate();
    }
}

export function initPerformanceMonitoring() {
    // Get reference to the FPS counter element
    fpsCounter = document.getElementById('fps-counter');

    // Initialize FPS display visibility - default to visible
    const fpsDisplay = document.getElementById('fps-display');
    if (fpsDisplay) {
        fpsDisplay.style.display = 'block';
    }

    // Stats will be initialized by the import/try-catch above
}

// Animation loop for stats
function animate() {
    if (stats) {
        stats.begin();
    }

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

    if (stats) {
        stats.end();
    }
    animationId = requestAnimationFrame(animate);
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
