// morphing-particles.js

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("morphing-particles-canvas");
    if (!canvas || typeof THREE === 'undefined') return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // --- Particle Configuration ---
    const particleCount = 4000;
    
    // Arrays for different states
    const chaosPositions = new Float32Array(particleCount * 3);
    const spherePositions = new Float32Array(particleCount * 3);
    const helixPositions = new Float32Array(particleCount * 3);
    const scrollSpiralPositions = new Float32Array(particleCount * 3);
    const gridPositions = new Float32Array(particleCount * 3);
    
    // The current active positions we render
    const currentPositions = new Float32Array(particleCount * 3);
    
    // Arrays to hold colors and sizes
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorPalette = [
        new THREE.Color('#3b82f6'), // Blue
        new THREE.Color('#10b981'), // Green
        new THREE.Color('#8b5cf6'), // Purple
        new THREE.Color('#f59e0b'), // Amber
        new THREE.Color('#ec4899')  // Pink
    ];

    // Initialize shapes
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // 1. Chaos (Scattered across the screen)
        chaosPositions[i3] = (Math.random() - 0.5) * 600;
        chaosPositions[i3 + 1] = (Math.random() - 0.5) * 600;
        chaosPositions[i3 + 2] = (Math.random() - 0.5) * 600;
        
        // Start out as chaos
        currentPositions[i3] = chaosPositions[i3];
        currentPositions[i3 + 1] = chaosPositions[i3 + 1];
        currentPositions[i3 + 2] = chaosPositions[i3 + 2];

        // 2. Sphere (Golden spiral distribution)
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        const radius = 35 + Math.random() * 5; // Radius around profile pic
        
        spherePositions[i3] = radius * Math.cos(theta) * Math.sin(phi);
        spherePositions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        spherePositions[i3 + 2] = radius * Math.cos(phi);

        // 3. Helix
        const helixRadius = 25;
        const helixHeight = 80;
        const t = i / particleCount; // 0 to 1
        const angle = t * Math.PI * 20; // Multiple turns
        const hY = (t - 0.5) * helixHeight;
        
        helixPositions[i3] = helixRadius * Math.cos(angle);
        helixPositions[i3 + 1] = hY;
        helixPositions[i3 + 2] = helixRadius * Math.sin(angle);
        
        // 4. Scroll Spiral (Large vortex)
        const scrollSpiralRadius = 100 + Math.random() * 80; // Wide radius to wrap content
        const scrollSpiralHeight = 800; // Taller than screen
        const st = i / particleCount;
        const sAngle = st * Math.PI * 40; // Lots of turns
        const sY = (st - 0.5) * scrollSpiralHeight;
        
        scrollSpiralPositions[i3] = scrollSpiralRadius * Math.cos(sAngle);
        scrollSpiralPositions[i3 + 1] = sY;
        scrollSpiralPositions[i3 + 2] = scrollSpiralRadius * Math.sin(sAngle);
        
        // Color & Size
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        sizes[i] = Math.random() * 2 + 1.0;
    }

    // --- Shader Material ---
    // Using a custom shader to give a soft, glowing, anti-aliased dot look
    const vertexShader = `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDepth;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vDepth = mvPosition.z;
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        varying vec3 vColor;
        varying float vDepth;
        void main() {
            // Circle distance
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if(ll > 0.5) discard;
            
            // Soft edge (glow)
            float alpha = smoothstep(0.5, 0.1, ll);
            
            // Depth fading: Fade out particles that are further back
            // Camera is at z=200. Center is ~ -200 depth.
            // Fade out beyond -250, fully bright at -150.
            float depthAlpha = smoothstep(-350.0, -100.0, vDepth);
            
            // Make particles darker in the back to simulate wrapping
            vec3 finalColor = vColor * (0.2 + 0.8 * depthAlpha);
            
            gl_FragColor = vec4(finalColor, alpha * depthAlpha * 0.9);
        }
    `;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    // Group used to position the structured shapes over the profile picture
    const targetGroup = new THREE.Group();
    scene.add(targetGroup);

    // --- Animation State ---
    let time = 0;
    let currentShape = 'chaos'; // 'chaos', 'sphere', 'helix'
    let progress = 0;
    
    // We use a shadow array to represent the final destination of the lerp
    const destinationPositions = new Float32Array(particleCount * 3);
    
    // Helper to get WebGL coords from DOM element
    function updateTargetPosition() {
        const profilePicWrapper = document.querySelector('.hero-photo-wrapper');
        if (!profilePicWrapper) return false;
        
        const rect = profilePicWrapper.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        
        if (isVisible) {
            // Map DOM center to normalized device coordinates
            const ndcX = (rect.left + rect.width / 2) / window.innerWidth * 2 - 1;
            const ndcY = -(rect.top + rect.height / 2) / window.innerHeight * 2 + 1;
            
            const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            // Project out to a reasonable z distance
            const distance = (0 - camera.position.z) / dir.z; 
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));
            
            targetGroup.position.copy(pos);
            return true;
        }
        return false;
    }

    function switchShape(newShape) {
        currentShape = newShape;
        
        // Copy the chosen shape into our destination array
        let sourceArray = chaosPositions;
        if (newShape === 'sphere') sourceArray = spherePositions;
        if (newShape === 'helix') sourceArray = helixPositions;
        if (newShape === 'scrollSpiral') sourceArray = scrollSpiralPositions;
        
        // If it's a structured shape, we also add the offset of the target group
        // If it's chaos, they exist in global space
        for (let i = 0; i < particleCount * 3; i+=3) {
            if (newShape === 'chaos') {
                destinationPositions[i] = sourceArray[i];
                destinationPositions[i+1] = sourceArray[i+1];
                destinationPositions[i+2] = sourceArray[i+2];
            } else {
                destinationPositions[i] = sourceArray[i] + targetGroup.position.x;
                destinationPositions[i+1] = sourceArray[i+1] + targetGroup.position.y;
                destinationPositions[i+2] = sourceArray[i+2] + targetGroup.position.z;
            }
        }
    }

    // Initial shape
    switchShape('chaos');

    let isProfileVisible = true;
    let justLostProfile = false;

    // Cycle through shapes every few seconds
    setInterval(() => {
        isProfileVisible = updateTargetPosition();
        
        if (isProfileVisible) {
            const shapes = ['sphere', 'helix'];
            // Pick a random structured shape
            const next = shapes[Math.floor(Math.random() * shapes.length)];
            switchShape(next);
        }
    }, 4000);

    // Track scroll to manage vortex transition
    document.addEventListener('scroll', () => {
        const wasVisible = isProfileVisible;
        isProfileVisible = updateTargetPosition();
        
        if (wasVisible && !isProfileVisible) {
            // Explode into chaos briefly
            switchShape('chaos');
            
            // Then form the scroll spiral
            setTimeout(() => {
                if (!isProfileVisible) {
                    // Reset target group to center of screen for the vortex
                    targetGroup.position.set(0, 0, 0);
                    switchShape('scrollSpiral');
                }
            }, 800); // 800ms explosion
        } else if (!wasVisible && isProfileVisible) {
            // Returning to profile pic
            switchShape('sphere');
        }
    });


    // Mouse interaction for subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
        targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    // --- Render Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        time += delta;

        // Smooth mouse follow for camera
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        // Continuous rotation for structured shapes
        if (currentShape !== 'chaos') {
            // Slowly rotate the target positions to create a living effect
            if (currentShape === 'scrollSpiral') {
                // Slight parallax based on scroll
                targetGroup.position.y = (window.scrollY * 0.05);
                targetGroup.position.x = 0;
            } else {
                updateTargetPosition(); // Keep it pinned to the DOM element
            }
            
            // Add scroll to timeOffset for the spiral so it spins as you scroll
            const scrollRot = currentShape === 'scrollSpiral' ? window.scrollY * 0.002 : 0;
            const timeOffset = time * 0.5 + scrollRot;
            
            // Re-calculate destinations with rotation
            let sourceArray = chaosPositions;
            if (currentShape === 'sphere') sourceArray = spherePositions;
            if (currentShape === 'helix') sourceArray = helixPositions;
            if (currentShape === 'scrollSpiral') sourceArray = scrollSpiralPositions;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Original local coords
                let x = sourceArray[i3];
                let y = sourceArray[i3+1];
                let z = sourceArray[i3+2];
                
                // Rotate around Y axis
                const cosT = Math.cos(timeOffset);
                const sinT = Math.sin(timeOffset);
                
                const rotX = x * cosT - z * sinT;
                const rotZ = x * sinT + z * cosT;
                
                // Add group offset
                destinationPositions[i3] = rotX + targetGroup.position.x;
                destinationPositions[i3+1] = y + targetGroup.position.y;
                destinationPositions[i3+2] = rotZ + targetGroup.position.z;
            }
        }
        
        // Lerp all particles towards their destination
        const positions = geometry.attributes.position.array;
        
        // The lerp factor (smoothness)
        const lerpFactor = 0.03; 
        
        for (let i = 0; i < particleCount * 3; i+=3) {
            // Apply a slight organic drift to the destination
            const driftX = Math.sin(time * 0.5 + i) * 2;
            const driftY = Math.cos(time * 0.4 + i) * 2;
            const driftZ = Math.sin(time * 0.3 + i) * 2;
            
            const destX = destinationPositions[i] + (currentShape === 'chaos' ? driftX : driftX * 0.2);
            const destY = destinationPositions[i+1] + (currentShape === 'chaos' ? driftY : driftY * 0.2);
            const destZ = destinationPositions[i+2] + (currentShape === 'chaos' ? driftZ : driftZ * 0.2);
            
            positions[i] += (destX - positions[i]) * lerpFactor;
            positions[i+1] += (destY - positions[i+1]) * lerpFactor;
            positions[i+2] += (destZ - positions[i+2]) * lerpFactor;
        }
        
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize Handler ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
