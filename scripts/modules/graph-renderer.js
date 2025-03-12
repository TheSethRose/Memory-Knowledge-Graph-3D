// We'll use the THREE instance from the window object
// import * as THREE from 'three';
import ForceGraph3D from '3d-force-graph';
import SpriteText from 'three-spritetext';
import * as d3 from 'd3';
import { setGraph, setGraphData, setSelectedNode, highlightNodes, highlightLinks, showLabels } from './state.js';
import { updateSelectedNodeInfo, createCategoryOptions } from './ui-utils.js';

// Initialize graph with data
export function initGraphWithData(data) {
    try {
        // Show loading indicator
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('loading-status').textContent = 'Processing data...';
        document.getElementById('progress-bar').style.width = '10%';

        // Process the data if needed
        if (Array.isArray(data)) {
            // If data is an array, convert it to nodes and links format
            const processed = processArrayData(data);
            data = processed;
        } else if (!data.nodes || !data.links) {
            // If data doesn't have nodes and links properties, create a default structure
            data = {
                nodes: data.nodes || [],
                links: data.links || []
            };
        }

        // Store the graph data
        setGraphData(data);
        document.getElementById('progress-bar').style.width = '30%';

        // Create category options for filter
        createCategoryOptions(data);
        document.getElementById('progress-bar').style.width = '50%';

        // Update loading status
        document.getElementById('loading-status').textContent = 'Rendering graph...';

        // Get the container element
        const container = document.getElementById('graph');

        // Clear the container
        container.innerHTML = '';

        // Get THREE from window object
        const THREE = window.THREE;

        // Create the 3D force graph directly in the container
        const graph = ForceGraph3D({ controlType: 'orbit' })
            (container)
            .backgroundColor(getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim())
            .nodeAutoColorBy('type')
            .nodeVal('val')
            .nodeLabel(node => `${node.name} (${node.type})`)
            // Always show node labels by default
            .nodeThreeObjectExtend(true)
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
                    sprite.material.depthTest = false; // Ensure text is always visible
                    sprite.material.depthWrite = false; // Don't write to depth buffer
                }

                return sprite;
            })
            .linkLabel(link => link.description || link.type)
            .linkWidth(link => highlightLinks.has(link) ? 3 : 1)
            .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
            .linkDirectionalParticleWidth(3)
            .linkDirectionalParticleSpeed(0.01)
            .linkDirectionalArrowLength(5)
            .linkDirectionalArrowRelPos(1)
            .linkCurvature(0.25)
            .d3Force('charge', d3.forceManyBody().strength(-180)) // Increased repulsion between nodes
            .d3Force('link', d3.forceLink().distance(link => 120).id(d => d.id)) // Increased distance between nodes
            .d3Force('center', d3.forceCenter().strength(0.05)) // Weaker center force to allow more spread
            .d3Force('collision', d3.forceCollide(node => Math.sqrt(node.val || 10) * 2.5)) // Added collision force with increased radius
            .onNodeClick(node => {
                // Handle node click
                setSelectedNode(node);
                updateSelectedNodeInfo(node);

                // Clear previous highlights
                highlightNodes.clear();
                highlightLinks.clear();

                // Highlight the selected node and its links
                highlightNodes.add(node);

                // Get the graph data
                const { nodes, links } = graph.graphData();

                // Find links connected to the selected node
                links.forEach(link => {
                    if (link.source.id === node.id || link.target.id === node.id) {
                        highlightLinks.add(link);
                        highlightNodes.add(link.source.id === node.id ? link.target : link.source);
                    }
                });

                // Very minimal camera movement - just enough to center the node
                // Get current camera position
                const currentPos = graph.camera().position;

                // Calculate a very gentle camera movement that barely changes position
                const targetPos = {
                    // Keep almost all of the current position (95%)
                    x: currentPos.x * 0.95 + node.x * 0.05,
                    y: currentPos.y * 0.95 + node.y * 0.05,
                    z: currentPos.z // Keep the same z distance
                };

                // Set camera position with smooth transition
                graph.cameraPosition(
                    targetPos, // new position
                    node, // lookAt
                    1500  // longer transition for smoother effect
                );

                // Set the node as the rotation center for orbit controls
                graph.controls().target.set(node.x, node.y, node.z);

                // Force a re-render to update node appearances
                graph.refresh();
            });

        // Set dimensions
        graph.width(window.innerWidth).height(window.innerHeight);

        // Set graph data
        graph.graphData(data);
        document.getElementById('progress-bar').style.width = '80%';

        // Store the graph instance
        setGraph(graph);

        // Configure enhanced controls
        configureEnhancedControls(graph);

        // Zoom to fit after a short delay to allow the graph to initialize
        setTimeout(() => {
            // First zoom out to see the whole graph
            graph.zoomToFit(1000, 50);

            // Then adjust the camera to a good viewing angle
            setTimeout(() => {
                const { x, y, z } = graph.camera().position;
                graph.cameraPosition(
                    { x: x * 0.8, y: y * 0.8, z: z * 1.2 }, // Slightly further back
                    graph.controls().target,
                    1000
                );

                document.getElementById('progress-bar').style.width = '100%';
                // Hide loading indicator
                setTimeout(() => {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('progress-bar').style.width = '0%';
                }, 500);
            }, 1200);
        }, 1000);

        return graph;
    } catch (error) {
        console.error('Error initializing graph:', error);
        alert('Error initializing graph: ' + error.message);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('progress-bar').style.width = '0%';
        throw error;
    }
}

// Helper function to process array data into nodes and links
function processArrayData(arrayData) {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Process entities and relations
    arrayData.forEach(item => {
        if (item.type === 'entity') {
            // Create node from entity
            const node = {
                id: item.name,
                name: item.name,
                type: item.entityType || 'Default',
                val: Math.max(5, item.observations ? item.observations.length / 4 : 5),
                color: getEntityColor(item.entityType),
                observations: item.observations || []
            };

            nodes.push(node);
            nodeMap.set(item.name, node);
        } else if (item.type === 'relation') {
            // Create link from relation
            links.push({
                source: item.from,
                target: item.to,
                type: item.relationType || 'related',
                color: '#999'
            });
        }
    });

    return { nodes, links };
}

// Function to get color based on entity type
function getEntityColor(entityType) {
    const entityColors = {
        Person: '#4285F4',
        Organization: '#EA4335',
        Pet: '#FBBC05',
        Tool: '#34A853',
        Medical: '#8E24AA',
        Category: '#00ACC1',
        Website: '#FB8C00',
        Reference: '#9E9E9E',
        List: '#607D8B',
        Technology: '#00BCD4',
        'Medical Facility': '#8E24AA',
        Default: '#9C27B0'
    };

    return entityColors[entityType] || entityColors.Default;
}

// Function to configure enhanced controls for the graph
function configureEnhancedControls(graph) {
    if (!graph || !graph.controls) return;

    const controls = graph.controls();

    // Set better defaults for controls
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true;

    // Add method to check if controls are enabled
    graph.controlsEnabled = () => {
        return controls.enabled;
    };

    // Add method to enable/disable controls
    graph.enableNavigationControls = (enable) => {
        controls.enabled = enable;
        return graph;
    };

    // Add key modifiers for enhanced control
    const container = graph.renderer().domElement;

    // Track key states
    const keyState = {
        shift: false,
        ctrl: false,
        alt: false
    };

    // Key down handler
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Shift') {
            keyState.shift = true;
            controls.panSpeed = 1.5; // Faster panning with Shift
        }
        if (event.key === 'Control') {
            keyState.ctrl = true;
            controls.rotateSpeed = 0.5; // More precise rotation with Ctrl
        }
        if (event.key === 'Alt') {
            keyState.alt = true;
            controls.zoomSpeed = 0.5; // More precise zooming with Alt
        }
    });

    // Key up handler
    window.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            keyState.shift = false;
            controls.panSpeed = 0.8; // Reset to normal pan speed
        }
        if (event.key === 'Control') {
            keyState.ctrl = false;
            controls.rotateSpeed = 1.0; // Reset to normal rotate speed
        }
        if (event.key === 'Alt') {
            keyState.alt = false;
            controls.zoomSpeed = 1.2; // Reset to normal zoom speed
        }
    });

    // Add double-click to center on point
    container.addEventListener('dblclick', (event) => {
        const rect = container.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        // Raycasting to find intersected objects
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: mouseX, y: mouseY }, graph.camera());

        const intersects = raycaster.intersectObjects(graph.scene().children, true);

        if (intersects.length > 0) {
            const point = intersects[0].point;

            // Animate camera to look at this point
            graph.cameraPosition(
                { x: graph.camera().position.x, y: graph.camera().position.y, z: graph.camera().position.z },
                point,
                1000
            );

            // Set this as the new orbit controls target
            controls.target.set(point.x, point.y, point.z);
        }
    });

    // Update controls to apply changes
    controls.update();
}
