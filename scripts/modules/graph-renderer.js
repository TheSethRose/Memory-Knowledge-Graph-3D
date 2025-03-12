import * as THREE from 'three';
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

        // Create the 3D force graph directly in the container
        const graph = ForceGraph3D({ controlType: 'orbit' })
            (container)
            .backgroundColor(getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim())
            .nodeAutoColorBy('type')
            .nodeVal('val')
            .nodeLabel(node => `${node.name} (${node.type})`)
            .nodeThreeObject(node => {
                // Create a sphere for each node
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(Math.max(5, node.val || 5)),
                    new THREE.MeshLambertMaterial({
                        color: node.color,
                        transparent: true,
                        opacity: 0.8
                    })
                );

                // Add text label if enabled
                if (showLabels) {
                    const sprite = new SpriteText(node.name);
                    sprite.color = node.color;
                    sprite.textHeight = 8;
                    sprite.position.y = 12;
                    sprite.backgroundColor = 'rgba(0,0,0,0.2)';
                    sprite.padding = 2;
                    sprite.borderRadius = 3;
                    sphere.add(sprite);
                }

                return sphere;
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

                // Center the camera on the selected node with improved positioning
                // Calculate appropriate distance based on node size
                const distance = Math.max(80, Math.sqrt(node.val || 10) * 15);
                const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

                // Set camera position with smooth transition
                graph.cameraPosition(
                    { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                    node, // lookAt
                    1000  // transition duration
                );

                // Set the node as the rotation center for orbit controls
                graph.controls().target.set(node.x, node.y, node.z);

                // Update the graph
                graph.refresh();
            });

        // Set dimensions
        graph.width(window.innerWidth).height(window.innerHeight);

        // Set graph data
        graph.graphData(data);
        document.getElementById('progress-bar').style.width = '80%';

        // Store the graph instance
        setGraph(graph);

        // Zoom to fit after a short delay to allow the graph to initialize
        setTimeout(() => {
            graph.zoomToFit(1000, 50);
            document.getElementById('progress-bar').style.width = '100%';
            // Hide loading indicator
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('progress-bar').style.width = '0%';
            }, 500);
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
