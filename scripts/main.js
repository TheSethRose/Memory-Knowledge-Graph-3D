// Import modules
import { initThreeModules } from './modules/three-loader.js';
import { initTheme } from './modules/theme.js';
import { initPerformanceMonitoring } from './modules/performance.js';
import { initGraphWithData } from './modules/graph-renderer.js';
import { processJsonlText, processMemoryJson } from './modules/data-processor.js';
import { filterGraph } from './modules/graph-utils.js';

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

    // Toggle node labels - ensure labels are shown by default
    document.getElementById('node-labels').checked = true;
    document.getElementById('node-labels').addEventListener('change', e => {
        window.showLabels = e.target.checked;

        // Update the node objects with or without labels
        if (Graph) {
            if (showLabels) {
                // Show labels
                Graph.nodeThreeObjectExtend(true)
                    .nodeThreeObject(node => {
                        // Create a text sprite for the label
                        const sprite = new SpriteText(node.name);
                        sprite.color = '#FFFFFF'; // White text for better visibility
                        sprite.textHeight = 8;
                        sprite.position.y = -12; // Position below the node to avoid overlap
                        sprite.backgroundColor = highlightNodes.has(node) ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)';
                        sprite.padding = 4;
                        sprite.borderRadius = 3;
                        sprite.fontWeight = highlightNodes.has(node) ? 'bold' : 'normal';
                        sprite.strokeWidth = highlightNodes.has(node) ? 0.5 : 0;
                        sprite.strokeColor = node.color;

                        // Ensure the sprite always faces the camera and is visible
                        if (sprite.material) {
                            sprite.material.depthTest = false;
                            sprite.material.depthWrite = false;
                        }

                        return sprite;
                    });
            } else {
                // Hide labels
                Graph.nodeThreeObjectExtend(false)
                    .nodeThreeObject(null);
            }

            // Refresh the graph to apply changes
            Graph.refresh();
        }
    });

    // Toggle observations - ensure observations are shown by default
    document.getElementById('observations-toggle').checked = true;
    document.getElementById('observations-toggle').addEventListener('change', e => {
        window.showObservations = e.target.checked;
        if (selectedNode) {
            updateSelectedNodeInfo(selectedNode);
        }
    });

    // Toggle navigation controls - ensure navigation controls are enabled by default
    document.getElementById('enable-navigation-controls').checked = true;
    document.getElementById('enable-navigation-controls').addEventListener('change', e => {
        Graph && Graph.enableNavigationControls(e.target.checked);
    });

    // Toggle performance stats - ensure performance stats are shown by default
    document.getElementById('show-performance-stats').checked = true;

    // Center graph button
    document.getElementById('center-graph').addEventListener('click', () => {
        Graph && Graph.zoomToFit(1000, 50);
    });

    // Reset filters button
    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('search').value = '';
        document.getElementById('category-filter').value = 'All';
        highlightNodes.clear();
        highlightLinks.clear();
        setSelectedNode(null);
        document.getElementById('selected-node-info').innerHTML = '<h2>Select a node to see details</h2>';
        Graph && Graph.graphData(graphData);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        Graph && Graph.width(window.innerWidth).height(window.innerHeight);
    });

    // Initialize panel toggle functionality
    initPanelToggle();

    // Initialize controls help functionality
    initControlsHelp();
});

// Function to initialize panel toggle
function initPanelToggle() {
    const panel = document.getElementById('main-panel');
    const panelToggle = document.getElementById('panel-toggle');
    const panelClose = document.querySelector('.panel-close');

    if (panel && panelToggle) {
        // Toggle button click handler
        panelToggle.addEventListener('click', () => {
            panel.classList.toggle('collapsed');

            // Update localStorage to remember user preference
            const isCollapsed = panel.classList.contains('collapsed');
            localStorage.setItem('panelCollapsed', isCollapsed);
        });

        // Panel close button handler
        if (panelClose) {
            panelClose.addEventListener('click', () => {
                panel.classList.add('collapsed');
                localStorage.setItem('panelCollapsed', true);
            });
        }

        // Check if there's a saved preference
        const savedCollapsed = localStorage.getItem('panelCollapsed');
        if (savedCollapsed === 'true') {
            panel.classList.add('collapsed');
        }
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
        // By default, show the controls help (only hide if explicitly set to hidden)
        if (savedHidden === 'true') {
            controlsHelp.classList.add('hidden');
        }

        // Remove the click outside listener to prevent auto-closing
    }
}
