// This module contains fixes for deprecated Three.js geometry classes

// Patch the THREE namespace to handle deprecated geometry class names
export function applyGeometryFixes(THREE) {
    // Apply fixes only if THREE is available
    if (!THREE) return;

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
