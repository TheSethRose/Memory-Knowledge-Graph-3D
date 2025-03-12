// We're not importing Three.js directly here anymore
// import * as THREE from 'three';

// Instead, we'll use the instance that's already loaded by 3d-force-graph
export async function initThreeModules() {
    try {
        // Get the THREE instance from the window object (set by 3d-force-graph)
        const THREE = window.THREE;

        if (!THREE) {
            console.warn('THREE.js not found on window object. This might cause issues.');
            return false;
        }

        console.log('Three.js version:', THREE.REVISION);
        console.log('Three.js modules loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading Three.js modules:', error);
        throw error;
    }
}

// Function to fix deprecated geometry classes
function applyGeometryFixes(THREE) {
    // Map of deprecated geometry class names to their modern equivalents
    const geometryMappings = {
        'BoxBufferGeometry': 'BoxGeometry',
        'CircleBufferGeometry': 'CircleGeometry',
        'ConeBufferGeometry': 'ConeGeometry',
        'CylinderBufferGeometry': 'CylinderGeometry',
        'DodecahedronBufferGeometry': 'DodecahedronGeometry',
        'EdgesBufferGeometry': 'EdgesGeometry',
        'ExtrudeBufferGeometry': 'ExtrudeGeometry',
        'IcosahedronBufferGeometry': 'IcosahedronGeometry',
        'LatheBufferGeometry': 'LatheGeometry',
        'OctahedronBufferGeometry': 'OctahedronGeometry',
        'PlaneBufferGeometry': 'PlaneGeometry',
        'PolyhedronBufferGeometry': 'PolyhedronGeometry',
        'RingBufferGeometry': 'RingGeometry',
        'ShapeBufferGeometry': 'ShapeGeometry',
        'SphereBufferGeometry': 'SphereGeometry',
        'TetrahedronBufferGeometry': 'TetrahedronGeometry',
        'TorusBufferGeometry': 'TorusGeometry',
        'TorusKnotBufferGeometry': 'TorusKnotGeometry',
        'TubeBufferGeometry': 'TubeGeometry',
        'WireframeBufferGeometry': 'WireframeGeometry'
    };

    // For each deprecated class, create an alias to the modern class
    Object.entries(geometryMappings).forEach(([deprecated, modern]) => {
        if (THREE[modern] && !THREE[deprecated]) {
            THREE[deprecated] = THREE[modern];
            console.log(`Created alias for ${deprecated} -> ${modern}`);
        }
    });

    console.log('Applied geometry fixes for Three.js');
}
