// We're not importing Three.js directly here anymore
// import * as THREE from 'three';

// Instead, we'll use the instance that's already loaded by the script tag
export async function initThreeModules() {
    try {
        // Check if THREE is already loaded
        if (window.THREE) {
            console.log('THREE.js is already loaded, version:', window.THREE.REVISION);
            return window.THREE;
        }

        console.log('THREE.js not found in window object. This is unexpected since it should be loaded via script tag.');
        return null;
    } catch (error) {
        console.error('Error initializing THREE.js modules:', error);
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
