// Debug script to check library loading
console.log('Debug script loaded');

// Check Three.js
if (typeof THREE !== 'undefined') {
    console.log('THREE is defined');
    console.log('THREE.REVISION:', THREE.REVISION);
} else {
    console.error('THREE is undefined');
}

// Check SpriteText
if (typeof SpriteText !== 'undefined') {
    console.log('SpriteText is defined');
    try {
        // Try to create a SpriteText instance to verify it works
        const sprite = new SpriteText('Test');
        console.log('SpriteText instance created successfully');
    } catch (error) {
        console.error('Error creating SpriteText instance:', error);
    }
} else {
    console.error('SpriteText is undefined');
}

// Check D3
if (typeof d3 !== 'undefined') {
    console.log('d3 is defined');
    console.log('d3.version:', d3.version);
} else {
    console.error('d3 is undefined');
}

// Check ForceGraph3D
if (typeof ForceGraph3D !== 'undefined') {
    console.log('ForceGraph3D is defined');
} else {
    console.error('ForceGraph3D is undefined');
}

// Check Stats
if (typeof Stats !== 'undefined') {
    console.log('Stats is defined');
} else {
    console.error('Stats is undefined');
}

// Export a function to check global objects
export function checkGlobals() {
    console.log('Checking globals from module...');
    console.log('window.THREE:', window.THREE);
    console.log('window.SpriteText:', window.SpriteText);
    console.log('window.d3:', window.d3);
    console.log('window.ForceGraph3D:', window.ForceGraph3D);
    console.log('window.Stats:', window.Stats);
}
