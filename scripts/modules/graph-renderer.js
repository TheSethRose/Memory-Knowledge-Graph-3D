// We'll use the THREE instance from the window object
// import * as THREE from 'three';
// import ForceGraph3D from '3d-force-graph';
// import SpriteText from 'three-spritetext';
// import * as d3 from 'd3';
import { setGraph, setGraphData, setSelectedNode, highlightNodes, highlightLinks, showLabels, Graph } from './state.js';
import { updateSelectedNodeInfo, createCategoryOptions } from './ui-utils.js';

// Function to update specific nodes without resetting the graph
export function updateGraphNodes(newData) {
    if (!Graph || !newData || !newData.nodes) return;

    const currentData = Graph.graphData();
    const currentNodeMap = new Map(currentData.nodes.map(node => [node.id, node]));
    const newNodeMap = new Map(newData.nodes.map(node => [node.id, node]));

    // Track nodes to be updated, added, or removed
    const nodesToUpdate = [];
    const nodesToAdd = [];
    const nodesToRemove = [];

    // Find nodes to update or add
    newData.nodes.forEach(newNode => {
        const existingNode = currentNodeMap.get(newNode.id);
        if (existingNode) {
            // Node exists - check if it needs updating
            if (JSON.stringify(existingNode) !== JSON.stringify(newNode)) {
                nodesToUpdate.push({ existing: existingNode, new: newNode });
            }
        } else {
            // Node doesn't exist - add it
            nodesToAdd.push(newNode);
        }
    });

    // Find nodes to remove
    currentData.nodes.forEach(currentNode => {
        if (!newNodeMap.has(currentNode.id)) {
            nodesToRemove.push(currentNode);
        }
    });

    // Process updates
    nodesToUpdate.forEach(({ existing, new: newNode }) => {
        // Preserve position and velocity
        const x = existing.x;
        const y = existing.y;
        const z = existing.z;
        const vx = existing.vx;
        const vy = existing.vy;
        const vz = existing.vz;

        // Update node data
        Object.assign(existing, newNode, {
            x, y, z, vx, vy, vz // Restore position and velocity
        });

        // Update the node's label sprite
        if (existing.__threeObj && existing.__threeObj instanceof SpriteText) {
            existing.__threeObj.text = newNode.name;
        }
    });

    // Process additions
    nodesToAdd.forEach(node => {
        currentData.nodes.push(node);
    });

    // Process removals
    currentData.nodes = currentData.nodes.filter(node =>
        !nodesToRemove.some(removeNode => removeNode.id === node.id)
    );

    // Update links
    if (newData.links) {
        // Create maps for efficient lookup
        const currentLinkMap = new Map(
            currentData.links.map(link => [
                `${link.source.id || link.source}-${link.target.id || link.target}`,
                link
            ])
        );
        const newLinkMap = new Map(
            newData.links.map(link => [
                `${link.source}-${link.target}`,
                link
            ])
        );

        // Find links to add
        const linksToAdd = newData.links.filter(newLink => {
            const linkKey = `${newLink.source}-${newLink.target}`;
            return !currentLinkMap.has(linkKey);
        });

        // Find links to remove
        const linksToRemove = currentData.links.filter(currentLink => {
            const linkKey = `${currentLink.source.id || currentLink.source}-${currentLink.target.id || currentLink.target}`;
            return !newLinkMap.has(linkKey);
        });

        // Update links array
        currentData.links = currentData.links.filter(link =>
            !linksToRemove.some(removeLink =>
                (removeLink.source.id || removeLink.source) === (link.source.id || link.source) &&
                (removeLink.target.id || removeLink.target) === (link.target.id || link.target)
            )
        );
        currentData.links.push(...linksToAdd);
    }

    // Update the graph with modified data
    Graph.graphData(currentData);

    // Force a refresh to update all visual elements
    Graph.refresh();

    // If any updated node is currently selected, update its info panel
    const selectedNode = currentData.nodes.find(node => highlightNodes.has(node));
    if (selectedNode) {
        updateSelectedNodeInfo(selectedNode);
    }
}

// Initialize graph with data
export function initGraphWithData(data) {
    try {
        console.log('Initializing graph with data:', data ? 'data present' : 'no data');

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

        // Create category options for filter
        createCategoryOptions(data);

        // Get the container element
        const container = document.getElementById('graph');
        if (!container) {
            console.error('Graph container element not found');
            return null;
        }

        // Clear the container if no graph exists
        if (!Graph) {
            container.innerHTML = '';
        }

        // If Graph already exists, just update the data
        if (Graph) {
            console.log('Graph already exists, updating data');
            Graph.graphData(data);
            return Graph;
        }

        // Get THREE from window object
        const THREE = window.THREE;
        if (!THREE) {
            console.error('THREE is not defined in window object');
            return null;
        }

        console.log('Creating new 3D force graph');

        // Check if ForceGraph3D is available globally
        if (!window.ForceGraph3D) {
            console.error('ForceGraph3D is not defined in window object');
            return null;
        }

        const graph = window.ForceGraph3D({ controlType: 'orbit' })
            (container)
            .backgroundColor(getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim())
            .nodeAutoColorBy('type')
            .nodeVal('val')
            .nodeLabel(node => `${node.name} (${node.type})`)
            .nodeThreeObjectExtend(true)
            .nodeThreeObject(node => {
                // Check if SpriteText is available globally
                if (!window.SpriteText) {
                    console.error('SpriteText is not defined in window object');
                    return null;
                }

                // Create a text sprite for the label
                const sprite = new window.SpriteText(node.name);
                sprite.color = '#FFFFFF';
                sprite.textHeight = 8;
                sprite.position.y = -12;
                sprite.backgroundColor = highlightNodes.has(node) ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)';
                sprite.padding = 4;
                sprite.borderRadius = 3;
                sprite.fontWeight = highlightNodes.has(node) ? 'bold' : 'normal';
                sprite.strokeWidth = highlightNodes.has(node) ? 0.5 : 0;
                sprite.strokeColor = node.color;

                if (sprite.material) {
                    sprite.material.depthTest = false;
                    sprite.material.depthWrite = false;
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
            .d3Force('charge', window.d3.forceManyBody().strength(-180))
            .d3Force('link', window.d3.forceLink().distance(link => 120).id(d => d.id))
            .d3Force('center', window.d3.forceCenter().strength(0.05))
            .d3Force('collision', window.d3.forceCollide(node => Math.sqrt(node.val || 10) * 2.5));

        // Define the onNodeClick handler separately to ensure it's properly bound
        const handleNodeClick = function(node) {
            console.log('Node clicked:', node ? node.id : 'null');

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

            // Very minimal camera movement
            const currentPos = graph.camera().position;
            const targetPos = {
                x: currentPos.x * 0.95 + node.x * 0.05,
                y: currentPos.y * 0.95 + node.y * 0.05,
                z: currentPos.z
            };

            graph.cameraPosition(
                targetPos,
                node,
                1500
            );

            graph.controls().target.set(node.x, node.y, node.z);
            graph.refresh();
        };

        // Set the onNodeClick handler
        console.log('Setting onNodeClick handler');
        try {
            graph.onNodeClick(handleNodeClick);
            console.log('onNodeClick handler set successfully');
        } catch (error) {
            console.error('Error setting onNodeClick handler:', error);

            // Try an alternative approach
            console.log('Trying alternative approach for setting click handler');
            graph._options = graph._options || {};
            graph._options.onNodeClick = handleNodeClick;
        }

        // Add custom event listener for node-click events from search panel
        document.addEventListener('node-click', (event) => {
            console.log('Custom node-click event received');
            const node = event.detail;
            if (node && graph) {
                handleNodeClick(node);
            }
        });

        // Set dimensions and data
        graph.width(window.innerWidth).height(window.innerHeight);
        graph.graphData(data);

        // Store the graph instance
        console.log('Storing graph instance');
        setGraph(graph);

        // Configure enhanced controls
        configureEnhancedControls(graph);

        // Initial camera positioning
        setTimeout(() => {
            graph.zoomToFit(400);
        }, 200);

        return graph;
    } catch (error) {
        console.error('Error initializing graph:', error);
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
        // Ensure THREE is defined
        const THREE = window.THREE;
        if (!THREE) {
            console.error('THREE is not defined in window object');
            return;
        }

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
