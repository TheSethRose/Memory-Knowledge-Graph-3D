// Import modules
import { initThreeModules } from './modules/three-loader.js';
import { initTheme } from './modules/theme.js';
import { initPerformanceMonitoring } from './modules/performance.js';
import { initGraphWithData } from './modules/graph-renderer.js';
import { processJsonlText, processMemoryJson } from './modules/data-processor.js';
import { filterGraph } from './modules/graph-utils.js';
import { initSearch } from './modules/search.js';

// Global state
import { showLabels, showObservations, Graph, selectedNode, highlightNodes, highlightLinks, graphData, setSelectedNode } from './modules/state.js';
import { updateSelectedNodeInfo } from './modules/ui-utils.js';

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded');

    // Load Three.js modules
    try {
        await initThreeModules();
    } catch (error) {
        console.error('Failed to load Three.js modules:', error);
        alert('Failed to load Three.js modules. Please check the console for more information.');
        return;
    }

    // Initialize theme
    initTheme();

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Initialize UI components
    initPanelToggle();
    initObservationsPanel();
    initControlsHelp();
    initSearch();

    // Set default values for display options (since we removed the toggles)
    window.showLabels = true;
    window.showObservations = true;

    // Load sample data
    try {
        const sampleData = await fetch('sample-data.json').then(res => res.json());
        console.log('Sample data loaded successfully');
        await initGraphWithData(sampleData);
    } catch (error) {
        console.error('Error loading sample data:', error);
        document.getElementById('loading').style.display = 'none';
    }

    // Tab switching
    document.getElementById('file-tab').addEventListener('click', () => {
        document.getElementById('file-tab').classList.add('active');
        document.getElementById('json-tab').classList.remove('active');
        document.getElementById('file-tab-content').style.display = 'block';
        document.getElementById('json-tab-content').style.display = 'none';
    });

    document.getElementById('json-tab').addEventListener('click', () => {
        document.getElementById('json-tab').classList.add('active');
        document.getElementById('file-tab').classList.remove('active');
        document.getElementById('json-tab-content').style.display = 'block';
        document.getElementById('file-tab-content').style.display = 'none';
    });

    // File input handler
    document.getElementById('file-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    // Try to parse as regular JSON first
                    try {
                        const data = JSON.parse(e.target.result);
                        initGraphWithData(data);
                        return;
                    } catch (jsonError) {
                        console.log("Not standard JSON, trying JSONL format...");
                        // If regular JSON parsing fails, try to process as JSONL
                        const data = processJsonlText(e.target.result);
                        initGraphWithData(data);
                    }
                } catch (error) {
                    console.error("Error parsing file:", error);
                    alert("Error parsing file: " + error.message);
                }
            };
            reader.readAsText(file);
        }
    });

    // JSON input handler
    document.getElementById('parse-json').addEventListener('click', () => {
        const jsonData = document.getElementById('data-input').value;
        try {
            // Try to parse as regular JSON first
            try {
                const data = JSON.parse(jsonData);
                initGraphWithData(data);
            } catch (jsonError) {
                console.log("Not standard JSON, trying JSONL format...");
                // If regular JSON parsing fails, try to process as JSONL
                const data = processJsonlText(jsonData);
                initGraphWithData(data);
            }
        } catch (error) {
            console.error("Error parsing data:", error);
            alert("Error parsing data: " + error.message);
        }
    });

    // Search functionality
    document.getElementById('search').addEventListener('input', e => {
        const searchTerm = e.target.value.toLowerCase();
        filterGraph(searchTerm, document.getElementById('category-filter').value);
    });

    // Category filter
    document.getElementById('category-filter').addEventListener('change', e => {
        const category = e.target.value;
        filterGraph(document.getElementById('search').value.toLowerCase(), category);
    });

    // Initialize observations toggle state
    const observationsToggle = document.getElementById('observations-toggle');
    const observationsPanel = document.getElementById('observations-panel');

    if (observationsToggle && observationsPanel) {
        // Update visibility based on state
        if (!showObservations) {
            observationsPanel.classList.add('collapsed');
        }
    }

    // Add event listeners for graph controls
    document.getElementById('center-graph').addEventListener('click', () => {
        if (Graph) {
            Graph.zoomToFit(1000, 50);
        }
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('search').value = '';
        document.getElementById('category-filter').value = 'All';
        filterGraph();
    });

    // Add event listeners for the new icon buttons
    document.getElementById('toggle-labels').addEventListener('click', () => {
        window.showLabels = !window.showLabels;
        if (Graph) {
            // Visual feedback for the button
            const button = document.getElementById('toggle-labels');
            if (window.showLabels) {
                button.style.backgroundColor = '';
                button.style.color = '';
                Graph.nodeLabel(node => node.name);
            } else {
                button.style.backgroundColor = '#555';
                button.style.color = '#999';
                Graph.nodeLabel(null);
            }
        }
    });

    document.getElementById('toggle-controls').addEventListener('click', () => {
        if (Graph) {
            // Toggle orbit controls
            const controlsEnabled = Graph.controlsEnabled();
            Graph.enableNavigationControls(!controlsEnabled);

            // Visual feedback for the button
            const button = document.getElementById('toggle-controls');
            if (!controlsEnabled) {
                button.style.backgroundColor = '';
                button.style.color = '';
            } else {
                button.style.backgroundColor = '#555';
                button.style.color = '#999';
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        Graph && Graph.width(window.innerWidth).height(window.innerHeight);
    });
});

// Function to initialize panel toggle
function initPanelToggle() {
    const panel = document.getElementById('main-panel');
    const panelToggle = document.getElementById('panel-toggle');
    const panelClose = document.querySelector('.panel-close');

    if (panel && panelToggle) {
        // Function to update toggle button visibility
        const updateToggleVisibility = () => {
            if (panel.classList.contains('collapsed')) {
                panelToggle.classList.remove('hidden');
            } else {
                panelToggle.classList.add('hidden');
            }
        };

        // Toggle button click handler
        panelToggle.addEventListener('click', () => {
            panel.classList.remove('collapsed');
            updateToggleVisibility();
            localStorage.setItem('panelCollapsed', false);
        });

        // Panel close button handler
        if (panelClose) {
            panelClose.addEventListener('click', () => {
                panel.classList.add('collapsed');
                updateToggleVisibility();
                localStorage.setItem('panelCollapsed', true);
            });
        }

        // Check if there's a saved preference
        const savedCollapsed = localStorage.getItem('panelCollapsed');
        if (savedCollapsed === 'true') {
            panel.classList.add('collapsed');
        }

        // Initialize toggle visibility
        updateToggleVisibility();
    }
}

// Function to initialize observations panel
function initObservationsPanel() {
    const observationsPanel = document.getElementById('observations-panel');
    const observationsToggle = document.getElementById('observations-toggle');
    const observationsClose = document.querySelector('.observations-close');

    if (observationsPanel && observationsToggle) {
        // Toggle button click handler - toggle visibility
        observationsToggle.addEventListener('click', () => {
            if (observationsPanel.classList.contains('collapsed')) {
                observationsPanel.classList.remove('collapsed');
                localStorage.setItem('observationsPanelCollapsed', false);
            } else {
                observationsPanel.classList.add('collapsed');
                localStorage.setItem('observationsPanelCollapsed', true);
            }
        });

        // Close button handler
        if (observationsClose) {
            observationsClose.addEventListener('click', () => {
                observationsPanel.classList.add('collapsed');
                localStorage.setItem('observationsPanelCollapsed', true);
            });
        }

        // Default to collapsed until a node is selected
        observationsPanel.classList.add('collapsed');
    }
}

// Function to initialize controls help
function initControlsHelp() {
    const controlsHelp = document.getElementById('controls-help');
    const controlsHelpToggle = document.getElementById('controls-help-toggle');
    const controlClose = document.querySelector('.control-close');

    if (controlsHelp && controlsHelpToggle) {
        // Handle toggle button click - show controls if hidden
        controlsHelpToggle.addEventListener('click', () => {
            if (controlsHelp.classList.contains('hidden')) {
                controlsHelp.classList.remove('hidden');
                localStorage.setItem('controlsHelpHidden', false);
            }
        });

        // Handle close button click - only way to hide the controls
        if (controlClose) {
            controlClose.addEventListener('click', () => {
                controlsHelp.classList.add('hidden');
                localStorage.setItem('controlsHelpHidden', true);
            });
        }

        // Check if there's a saved preference
        const savedHidden = localStorage.getItem('controlsHelpHidden');

        // Default to hidden unless explicitly set to visible
        if (savedHidden === 'false') {
            controlsHelp.classList.remove('hidden');
        } else {
            controlsHelp.classList.add('hidden');
        }
    }
}
