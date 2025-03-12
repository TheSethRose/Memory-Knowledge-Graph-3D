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

        // Randomize initial node positions in 3D space
        randomizeNodePositions(data.nodes);

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
                // Check if THREE and SpriteText are available globally
                if (!window.THREE || !window.SpriteText) {
                    console.error('THREE or SpriteText is not defined in window object');
                    return null;
                }

                // Create a group to hold both the sphere and the text
                const group = new window.THREE.Group();

                // Determine if this node is highlighted
                const isHighlighted = highlightNodes.has(node);

                // Create a sphere for the node
                const radius = Math.sqrt(node.val || 10) * (isHighlighted ? 1.2 : 0.8);
                const geometry = new window.THREE.SphereGeometry(radius, 16, 16);

                // Use different material for highlighted nodes
                let material;
                if (isHighlighted) {
                    // Highlighted nodes get a glowing effect
                    material = new window.THREE.MeshPhongMaterial({
                        color: node.color || '#9C27B0',
                        emissive: node.color || '#9C27B0',
                        emissiveIntensity: 0.5,
                        transparent: true,
                        opacity: 0.9,
                        shininess: 100
                    });

                    // Add a halo effect for highlighted nodes
                    const haloGeometry = new window.THREE.SphereGeometry(radius * 1.3, 16, 16);
                    const haloMaterial = new window.THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.2,
                        side: window.THREE.BackSide
                    });
                    const halo = new window.THREE.Mesh(haloGeometry, haloMaterial);
                    group.add(halo);
                } else {
                    // Regular nodes
                    material = new window.THREE.MeshLambertMaterial({
                        color: node.color || '#9C27B0',
                        transparent: true,
                        opacity: 0.75
                    });
                }

                const sphere = new window.THREE.Mesh(geometry, material);
                group.add(sphere);

                // Create a text sprite for the label
                const sprite = new window.SpriteText(node.name);
                sprite.color = '#FFFFFF';
                sprite.textHeight = isHighlighted ? 10 : 8;
                sprite.position.y = -radius - 10; // Position below the sphere
                sprite.backgroundColor = isHighlighted ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)';
                sprite.padding = 4;
                sprite.borderRadius = 3;
                sprite.fontWeight = isHighlighted ? 'bold' : 'normal';
                sprite.strokeWidth = isHighlighted ? 0.5 : 0;
                sprite.strokeColor = node.color;

                if (sprite.material) {
                    sprite.material.depthTest = false;
                    sprite.material.depthWrite = false;
                }

                group.add(sprite);

                return group;
            })
            .linkLabel(link => link.description || link.type)
            .linkWidth(link => highlightLinks.has(link) ? 5 : 1.5)
            .linkOpacity(link => highlightLinks.has(link) ? 1 : 0.5)
            .linkDirectionalParticles(link => highlightLinks.has(link) ? 6 : 0)
            .linkDirectionalParticleWidth(4)
            .linkDirectionalParticleSpeed(0.01)
            .linkDirectionalArrowLength(link => highlightLinks.has(link) ? 8 : 0)
            .linkDirectionalArrowRelPos(1)
            .linkColor(link => {
                return highlightLinks.has(link) ? '#FFFFFF' : link.color || '#CCCCCC';
            })
            // Stronger repulsion force for better 3D distribution
            .d3Force('charge', window.d3.forceManyBody().strength(-250))
            // Shorter link distance to create a more compact cloud
            .d3Force('link', window.d3.forceLink().distance(link => 80).id(d => d.id))
            // Weaker center force to allow more natural clustering
            .d3Force('center', window.d3.forceCenter().strength(0.03))
            // Stronger collision force to prevent overlap
            .d3Force('collision', window.d3.forceCollide(node => Math.sqrt(node.val || 10) * 3))
            // Add a z-force to push nodes in 3D space
            .d3Force('z', () => {
                // This custom force pushes nodes in the z direction based on their type
                return function(alpha) {
                    const nodes = graph.graphData().nodes;
                    const types = new Set(nodes.map(node => node.type));
                    const typeArray = Array.from(types);

                    nodes.forEach(node => {
                        // Get z-force based on node type (different types at different depths)
                        const typeIndex = typeArray.indexOf(node.type);
                        const targetZ = (typeIndex / typeArray.length - 0.5) * 200;

                        // Apply force toward target Z with some randomness
                        const dz = targetZ - (node.z || 0);
                        node.vz = node.vz || 0;
                        node.vz += dz * alpha * 0.1;

                        // Add some random movement in all directions for a more natural cloud
                        node.vx += (Math.random() - 0.5) * alpha * 10;
                        node.vy += (Math.random() - 0.5) * alpha * 10;
                        node.vz += (Math.random() - 0.5) * alpha * 10;
                    });
                };
            });

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

        // Add lighting to the scene
        addLighting(graph.scene());

        // Configure enhanced controls
        configureEnhancedControls(graph);

        // Initial camera positioning
        setTimeout(() => {
            // First zoom to fit to get all nodes in view
            graph.zoomToFit(400);

            // Then after a short delay, adjust the camera angle to show the 3D nature
            setTimeout(() => {
                const currentPos = graph.camera().position;
                const distance = Math.sqrt(currentPos.x * currentPos.x + currentPos.y * currentPos.y + currentPos.z * currentPos.z);

                // Move camera to an angled position to show 3D depth
                graph.cameraPosition(
                    {
                        x: distance * 0.8,
                        y: distance * 0.6,
                        z: distance * 0.8
                    },
                    // Look at the center
                    { x: 0, y: 0, z: 0 },
                    // Transition duration
                    1000
                );
            }, 500);
        }, 200);

        // Add subtle animation to nodes
        let animationFrame;
        const animateNodes = () => {
            if (!graph) return;

            const time = Date.now() * 0.001; // Convert to seconds

            // Get all node objects
            const nodeObjects = graph.scene().children.filter(obj =>
                obj.type === 'Group' &&
                obj.children.some(child => child.type === 'Mesh')
            );

            // Apply subtle floating animation to each node
            nodeObjects.forEach(group => {
                const meshes = group.children.filter(child => child.type === 'Mesh');
                if (meshes.length > 0) {
                    // Get the node data to determine animation properties
                    const nodeData = group.__data;
                    if (!nodeData) return;

                    // Store original position if not already stored
                    if (!group.userData.originalY) {
                        group.userData.originalY = group.position.y;
                    }

                    // Reset to original position first
                    group.position.y = group.userData.originalY;

                    // Different animation based on node type
                    const amplitude = 0.05;
                    const frequency = 0.5 + (nodeData.id.charCodeAt(0) % 10) * 0.05;

                    // Apply subtle floating motion
                    group.position.y += Math.sin(time * frequency) * amplitude;

                    // For highlighted nodes, add a subtle pulse
                    if (nodeData && highlightNodes.has(nodeData)) {
                        meshes.forEach(mesh => {
                            if (mesh.material && mesh.material.emissiveIntensity) {
                                mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
                            }
                        });
                    }
                }
            });

            animationFrame = requestAnimationFrame(animateNodes);
        };

        // Start animation
        animateNodes();

        // Store cleanup function
        const cleanup = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };

        // Add cleanup to the graph's dispose method
        const originalDispose = graph.dispose;
        graph.dispose = () => {
            cleanup();
            originalDispose.call(graph);
        };

        // Add hover effect
        graph.onNodeHover(node => {
            // Get the previous hovered node if any
            const prevNode = graph.__prevHoveredNode;

            // Handle node out effect first (when node is null or different from previous)
            if (prevNode && (!node || node !== prevNode)) {
                // Reset node appearance if it's not highlighted
                if (!highlightNodes.has(prevNode)) {
                    const nodeObjects = graph.scene().children.filter(obj =>
                        obj.type === 'Group' &&
                        obj.children.some(child => child.type === 'Mesh') &&
                        obj.__data === prevNode
                    );

                    if (nodeObjects.length > 0) {
                        const nodeGroup = nodeObjects[0];

                        // Reset meshes
                        const meshes = nodeGroup.children.filter(child => child.type === 'Mesh');
                        meshes.forEach(mesh => {
                            if (mesh.userData.originalScale) {
                                mesh.scale.set(
                                    mesh.userData.originalScale.x,
                                    mesh.userData.originalScale.y,
                                    mesh.userData.originalScale.z
                                );
                            }
                        });

                        // Reset sprites
                        const sprites = nodeGroup.children.filter(child => child.type === 'Sprite');
                        sprites.forEach(sprite => {
                            if (sprite.userData.originalScale) {
                                sprite.scale.set(
                                    sprite.userData.originalScale.x,
                                    sprite.userData.originalScale.y,
                                    sprite.userData.originalScale.z
                                );
                            }
                        });
                    }
                }
            }

            // Store current node as previous for next call
            graph.__prevHoveredNode = node;

            // Handle cursor
            if (!node) {
                // Reset cursor when not hovering over a node
                const graphContainer = document.getElementById('graph-container') || document.getElementById('graph');
                if (graphContainer) {
                    graphContainer.style.cursor = 'default';
                }
                return;
            }

            // Change cursor to pointer when hovering over a node
            const graphContainer = document.getElementById('graph-container') || document.getElementById('graph');
            if (graphContainer) {
                graphContainer.style.cursor = 'pointer';
            }

            // Get the node object
            const nodeObjects = graph.scene().children.filter(obj =>
                obj.type === 'Group' &&
                obj.children.some(child => child.type === 'Mesh') &&
                obj.__data === node
            );

            if (nodeObjects.length > 0) {
                const nodeGroup = nodeObjects[0];
                const meshes = nodeGroup.children.filter(child => child.type === 'Mesh');

                // Apply hover effect to meshes
                meshes.forEach(mesh => {
                    if (!mesh.userData.originalScale) {
                        mesh.userData.originalScale = {
                            x: mesh.scale.x,
                            y: mesh.scale.y,
                            z: mesh.scale.z
                        };
                    }

                    // Slightly increase the scale for hover effect
                    if (!highlightNodes.has(node)) {
                        mesh.scale.set(
                            mesh.userData.originalScale.x * 1.1,
                            mesh.userData.originalScale.y * 1.1,
                            mesh.userData.originalScale.z * 1.1
                        );
                    }
                });

                // Apply hover effect to text
                const sprites = nodeGroup.children.filter(child => child.type === 'Sprite');
                sprites.forEach(sprite => {
                    if (!sprite.userData.originalScale) {
                        sprite.userData.originalScale = {
                            x: sprite.scale.x,
                            y: sprite.scale.y
                        };
                    }

                    // Slightly increase the scale for hover effect
                    if (!highlightNodes.has(node)) {
                        sprite.scale.set(
                            sprite.userData.originalScale.x * 1.1,
                            sprite.userData.originalScale.y * 1.1,
                            sprite.userData.originalScale.z * 1.1
                        );
                    }
                });
            }
        });

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

// Function to randomize node positions in 3D space
function randomizeNodePositions(nodes) {
    if (!nodes || !nodes.length) return;

    // Calculate a reasonable radius based on the number of nodes
    const radius = Math.cbrt(nodes.length) * 100;

    nodes.forEach(node => {
        // Random spherical coordinates
        const theta = Math.random() * Math.PI * 2; // Azimuthal angle (around y-axis)
        const phi = Math.acos((Math.random() * 2) - 1); // Polar angle (from y-axis)
        const r = radius * Math.cbrt(Math.random()); // Radius with cubic distribution for more even spacing

        // Convert to Cartesian coordinates
        node.x = r * Math.sin(phi) * Math.cos(theta);
        node.y = r * Math.cos(phi);
        node.z = r * Math.sin(phi) * Math.sin(theta);

        // Add small random velocities
        node.vx = (Math.random() - 0.5) * 5;
        node.vy = (Math.random() - 0.5) * 5;
        node.vz = (Math.random() - 0.5) * 5;
    });
}

// Function to add lighting to the scene
function addLighting(scene) {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        return;
    }

    // Add ambient light
    const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new window.THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1000, 1000, 1000);
    scene.add(directionalLight);

    // Add a second directional light from another angle
    const directionalLight2 = new window.THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1000, -1000, -1000);
    scene.add(directionalLight2);

    console.log('Added lighting to scene');
}
