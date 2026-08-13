// morphing-particles.js

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("morphing-particles-canvas");
    if (!canvas || typeof THREE === 'undefined') return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    const isMobile = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // --- Particle Configuration ---
    const particleCount = isMobile ? 2000 : 5000;
    
    // Arrays for different 3D shapes
    const chaosPositions = new Float32Array(particleCount * 3);
    const spherePositions = new Float32Array(particleCount * 3);
    const helixPositions = new Float32Array(particleCount * 3);
    const repligenPositions = new Float32Array(particleCount * 3);
    const tesseractPositions = new Float32Array(particleCount * 3);
    const trefoilPositions = new Float32Array(particleCount * 3);
    const mobiusPositions = new Float32Array(particleCount * 3);
    const icosahedronPositions = new Float32Array(particleCount * 3);
    const scrollSpiralPositions = new Float32Array(particleCount * 3);
    const twirlPositions = new Float32Array(particleCount * 3);
    const explosionVelocities = new Float32Array(particleCount * 3);
    let isExploding = false;
    let explosionTimer = null;
    
    // Active rendering arrays
    const currentPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const pIds = new Float32Array(particleCount);
    
    // Sparkling Vibrant Color Palette
    const colorPalette = [
        new THREE.Color('#38bdf8'), // Repligen Cyan
        new THREE.Color('#0088ff'), // Electric Blue
        new THREE.Color('#34d399'), // Emerald Sparkle
        new THREE.Color('#a855f7'), // Quantum Purple
        new THREE.Color('#f43f5e'), // Sparkling Pink
        new THREE.Color('#fbbf24')  // Radiant Gold
    ];

    // Initialize base shapes
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pIds[i] = i;
        
        // 1. Chaos (Scattered across the screen)
        chaosPositions[i3] = (Math.random() - 0.5) * 600;
        chaosPositions[i3 + 1] = (Math.random() - 0.5) * 600;
        chaosPositions[i3 + 2] = (Math.random() - 0.5) * 600;
        
        currentPositions[i3] = chaosPositions[i3];
        currentPositions[i3 + 1] = chaosPositions[i3 + 1];
        currentPositions[i3 + 2] = chaosPositions[i3 + 2];

        // 2. Sphere (Golden ratio distribution behind profile photo)
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        const radius = 36 + Math.random() * 6;
        
        spherePositions[i3] = radius * Math.cos(theta) * Math.sin(phi);
        spherePositions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        spherePositions[i3 + 2] = radius * Math.cos(phi);

        // 3. Helix (Bioprocessing Strand)
        const helixRadius = 26;
        const helixHeight = 84;
        const t = i / particleCount;
        const angle = t * Math.PI * 22;
        const hY = (t - 0.5) * helixHeight;
        
        helixPositions[i3] = helixRadius * Math.cos(angle);
        helixPositions[i3 + 1] = hY;
        helixPositions[i3 + 2] = helixRadius * Math.sin(angle);
        
        // 4. Scroll Spiral (Large vortex)
        const scrollSpiralRadius = 100 + Math.random() * 80;
        const scrollSpiralHeight = 800;
        const st = i / particleCount;
        const sAngle = st * Math.PI * 40;
        const sY = (st - 0.5) * scrollSpiralHeight;
        
        scrollSpiralPositions[i3] = scrollSpiralRadius * Math.cos(sAngle);
        scrollSpiralPositions[i3 + 1] = sY;
        scrollSpiralPositions[i3 + 2] = scrollSpiralRadius * Math.sin(sAngle);
        
        // Color & Size
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        sizes[i] = Math.random() * 2.2 + 1.2;
    }

    // --- Complex 3D Shape Generators ---

    // 1. Quantum Tesseract (4D Hypercube Projection)
    function initTesseractPositions() {
        const vertices4D = [];
        for (let i = 0; i < 16; i++) {
            vertices4D.push([
                (i & 1) ? 1 : -1,
                (i & 2) ? 1 : -1,
                (i & 4) ? 1 : -1,
                (i & 8) ? 1 : -1
            ]);
        }
        
        const edges = [];
        for (let a = 0; a < 16; a++) {
            for (let b = a + 1; b < 16; b++) {
                let diff = 0;
                for (let k = 0; k < 4; k++) {
                    if (vertices4D[a][k] !== vertices4D[b][k]) diff++;
                }
                if (diff === 1) edges.push([a, b]);
            }
        }

        const project4Dto3D = (v4) => {
            const w = 2.4 / (3.2 - v4[3] * 0.45);
            return {
                x: v4[0] * w * 26,
                y: v4[1] * w * 26,
                z: v4[2] * w * 26
            };
        };

        const edgePoints = [];
        edges.forEach(([a, b]) => {
            const pA = project4Dto3D(vertices4D[a]);
            const pB = project4Dto3D(vertices4D[b]);
            const steps = Math.floor(particleCount / edges.length);
            for (let s = 0; s < steps; s++) {
                const f = s / steps;
                edgePoints.push({
                    x: pA.x + (pB.x - pA.x) * f,
                    y: pA.y + (pB.y - pA.y) * f,
                    z: pA.z + (pB.z - pA.z) * f
                });
            }
        });

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            if (edgePoints.length > 0) {
                const pt = edgePoints[i % edgePoints.length];
                tesseractPositions[i3] = pt.x + (Math.random() - 0.5) * 0.8;
                tesseractPositions[i3 + 1] = pt.y + (Math.random() - 0.5) * 0.8;
                tesseractPositions[i3 + 2] = pt.z + (Math.random() - 0.5) * 0.8;
            }
        }
    }

    // 2. Trefoil Knot Spiral Ring
    function initTrefoilPositions() {
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const t = (i / particleCount) * Math.PI * 2;
            const scale = 13.5;
            
            const x = scale * (Math.sin(t) + 2 * Math.sin(2 * t));
            const y = scale * (Math.cos(t) - 2 * Math.cos(2 * t));
            const z = scale * (-Math.sin(3 * t));
            
            const strandAngle = (i % 3) * (Math.PI * 2 / 3) + t * 12;
            const rOffset = 3.2;
            
            trefoilPositions[i3] = x + Math.cos(strandAngle) * rOffset;
            trefoilPositions[i3 + 1] = y + Math.sin(strandAngle) * rOffset;
            trefoilPositions[i3 + 2] = z + (Math.random() - 0.5) * 1.5;
        }
    }

    // 3. Mobius Ribbon Lattice
    function initMobiusPositions() {
        const R = 34;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const u = (i / particleCount) * Math.PI * 2;
            const v = ((i % 80) / 80 - 0.5) * 18;
            
            mobiusPositions[i3] = (R + v * Math.cos(u / 2)) * Math.cos(u);
            mobiusPositions[i3 + 1] = (R + v * Math.cos(u / 2)) * Math.sin(u);
            mobiusPositions[i3 + 2] = v * Math.sin(u / 2);
        }
    }

    // 4. Geodesic Icosahedron Neural Network
    function initIcosahedronPositions() {
        const phi = (1 + Math.sqrt(5)) / 2;
        const r = 38;
        const verts = [
            [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
            [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
            [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
        ].map(v => {
            const len = Math.hypot(...v);
            return [v[0] / len * r, v[1] / len * r, v[2] / len * r];
        });

        const edges = [];
        for (let a = 0; a < 12; a++) {
            for (let b = a + 1; b < 12; b++) {
                const dist = Math.hypot(verts[a][0] - verts[b][0], verts[a][1] - verts[b][1], verts[a][2] - verts[b][2]);
                if (dist < r * 1.25) edges.push([verts[a], verts[b]]);
            }
        }

        const pts = [];
        edges.forEach(([vA, vB]) => {
            const steps = Math.floor((particleCount * 0.75) / edges.length);
            for (let s = 0; s < steps; s++) {
                const f = s / steps;
                pts.push({
                    x: vA[0] + (vB[0] - vA[0]) * f,
                    y: vA[1] + (vB[1] - vA[1]) * f,
                    z: vA[2] + (vB[2] - vA[2]) * f
                });
            }
        });

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            if (i < pts.length) {
                icosahedronPositions[i3] = pts[i].x + (Math.random() - 0.5) * 0.8;
                icosahedronPositions[i3 + 1] = pts[i].y + (Math.random() - 0.5) * 0.8;
                icosahedronPositions[i3 + 2] = pts[i].z + (Math.random() - 0.5) * 0.8;
            } else {
                const u = Math.random();
                const v = Math.random();
                const theta = u * 2.0 * Math.PI;
                const phiAngle = Math.acos(2.0 * v - 1.0);
                const nR = 14 + Math.random() * 4;
                icosahedronPositions[i3] = nR * Math.sin(phiAngle) * Math.cos(theta);
                icosahedronPositions[i3 + 1] = nR * Math.sin(phiAngle) * Math.sin(theta);
                icosahedronPositions[i3 + 2] = nR * Math.cos(phiAngle);
            }
        }
    }

    // 5. Repligen Logo Shape Generator
    function initRepligenPositions() {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 800;
        offCanvas.height = 200;
        const offCtx = offCanvas.getContext('2d');

        offCtx.fillStyle = '#000000';
        offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

        offCtx.strokeStyle = '#FFFFFF';
        offCtx.lineWidth = 14;
        offCtx.beginPath();
        offCtx.arc(100, 100, 60, 0, Math.PI * 2);
        offCtx.stroke();

        offCtx.beginPath();
        offCtx.arc(100, 100, 28, 0, Math.PI * 2);
        offCtx.stroke();

        offCtx.font = '900 72px "Poppins", "Inter", "Arial Black", sans-serif';
        offCtx.textAlign = 'left';
        offCtx.lineWidth = 6;
        offCtx.strokeStyle = '#FFFFFF';
        offCtx.strokeText('REPLIGEN', 190, 122);
        offCtx.fillStyle = '#FFFFFF';
        offCtx.fillText('REPLIGEN', 190, 122);

        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const coords = [];
        
        for (let y = 0; y < offCanvas.height; y += 2) {
            for (let x = 0; x < offCanvas.width; x += 2) {
                const idx = (y * offCanvas.width + x) * 4;
                if (imgData.data[idx] > 100) {
                    coords.push({
                        x: (x - offCanvas.width / 2) * 0.092,
                        y: -(y - offCanvas.height / 2) * 0.092
                    });
                }
            }
        }

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            if (coords.length > 0) {
                const pt = coords[Math.floor((i / particleCount) * coords.length)];
                repligenPositions[i3] = pt.x + (Math.random() - 0.5) * 0.2;
                repligenPositions[i3 + 1] = pt.y + (Math.random() - 0.5) * 0.2;
                repligenPositions[i3 + 2] = (Math.random() - 0.5) * 2;
            } else {
                repligenPositions[i3] = (Math.random() - 0.5) * 30;
                repligenPositions[i3 + 1] = (Math.random() - 0.5) * 10;
                repligenPositions[i3 + 2] = 0;
            }
        }

        const img = new Image();
        img.src = 'img/repligen-logo.svg';
        img.onload = () => {
            offCtx.fillStyle = '#000000';
            offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
            offCtx.drawImage(img, 40, 19, 720, 162);
            
            const updatedImgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
            const exactCoords = [];
            for (let y = 0; y < offCanvas.height; y += 2) {
                for (let x = 0; x < offCanvas.width; x += 2) {
                    const idx = (y * offCanvas.width + x) * 4;
                    if (updatedImgData.data[idx + 3] > 80 && (updatedImgData.data[idx] > 30 || updatedImgData.data[idx + 1] > 30 || updatedImgData.data[idx + 2] > 30)) {
                        exactCoords.push({
                            x: (x - offCanvas.width / 2) * 0.090,
                            y: -(y - offCanvas.height / 2) * 0.090
                        });
                    }
                }
            }
            if (exactCoords.length > 0) {
                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    const pt = exactCoords[Math.floor((i / particleCount) * exactCoords.length)];
                    repligenPositions[i3] = pt.x + (Math.random() - 0.5) * 0.15;
                    repligenPositions[i3 + 1] = pt.y + (Math.random() - 0.5) * 0.15;
                    repligenPositions[i3 + 2] = (Math.random() - 0.5) * 2;
                }
                if (currentShape === 'repligen') {
                    switchShape('repligen');
                }
            }
        };
    }

    // 6. 3D Twirling Ribbon Vortex Generator
    function initTwirlPositions() {
        const numStrands = 6;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const t = i / particleCount;
            const strand = i % numStrands;
            
            const y = (t - 0.5) * 880;
            const angle = t * Math.PI * 32 + (strand * (Math.PI * 2 / numStrands));
            const radius = 42 + Math.sin(t * Math.PI * 10) * 22 + (Math.random() - 0.5) * 10;
            
            twirlPositions[i3] = radius * Math.cos(angle);
            twirlPositions[i3 + 1] = y;
            twirlPositions[i3 + 2] = radius * Math.sin(angle);
        }
    }

    // Initialize all 3D complex shape arrays
    initTesseractPositions();
    initTrefoilPositions();
    initMobiusPositions();
    initIcosahedronPositions();
    initRepligenPositions();
    initTwirlPositions();

    // --- Custom Shader Material with Twinkling / Sparkling Effects ---
    const vertexShader = `
        attribute float size;
        attribute vec3 color;
        attribute float pId;
        uniform float uTime;
        varying vec3 vColor;
        varying float vSparkle;
        varying float vDepth;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vDepth = mvPosition.z;
            
            float sparkle = 0.5 + 0.5 * sin(uTime * 3.8 + pId * 13.37);
            vSparkle = sparkle;

            float dynamicSize = size * (0.85 + 0.45 * sparkle);
            gl_PointSize = dynamicSize * (320.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        varying vec3 vColor;
        varying float vSparkle;
        varying float vDepth;
        void main() {
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if(ll > 0.5) discard;
            
            float alpha = smoothstep(0.5, 0.08, ll);
            float depthAlpha = smoothstep(-350.0, -100.0, vDepth);
            
            vec3 sparkleColor = mix(vColor, vec3(1.0, 1.0, 1.0), vSparkle * 0.45);
            vec3 finalColor = sparkleColor * (0.35 + 0.85 * depthAlpha) + vec3(vSparkle * 0.12);
            
            gl_FragColor = vec4(finalColor, alpha * depthAlpha * (0.75 + 0.25 * vSparkle));
        }
    `;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('pId', new THREE.BufferAttribute(pIds, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uTime: { value: 0 }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    const targetGroup = new THREE.Group();
    scene.add(targetGroup);

    // --- Animation State ---
    let time = 0;
    let currentShape = 'chaos';
    
    const destinationPositions = new Float32Array(particleCount * 3);
    
    let cachedProfileRect = null;
    let isProfileVisibleCached = true;
    let needsLayoutUpdate = true;

    // --- Cached DOM Elements & Rect Measurements for Zero Reflow Thrashing ---
    let cachedResumeBtn = null;
    let cachedPhotoWrapper = null;
    let cachedRectTime = 0;
    let cachedRect = null;
    let cachedHeroElem = null;

    function getHeroElem(isMobileOrTablet) {
        if (isMobileOrTablet && currentShape === 'repligen') {
            if (!cachedResumeBtn) {
                cachedResumeBtn = document.querySelector('#download_resume_btn') || document.querySelector('.cta-container');
            }
            return cachedResumeBtn;
        } else {
            if (!cachedPhotoWrapper) {
                cachedPhotoWrapper = document.querySelector('.hero-photo-wrapper');
            }
            return cachedPhotoWrapper;
        }
    }

    function updateTargetPosition() {
        // Mobile/Tablet responsive check (screens <= 1180px or touch tablets)
        const isMobileOrTablet = window.innerWidth <= 1180 || ('ontouchstart' in window && window.innerWidth <= 1280);
        const heroElem = getHeroElem(isMobileOrTablet);

        if (!heroElem) return false;

        // Cache rect for 1 frame (16ms) or update on layout event to eliminate forced layout reflows
        const now = performance.now();
        if (!cachedRect || heroElem !== cachedHeroElem || needsLayoutUpdate || (now - cachedRectTime > 16)) {
            cachedRect = heroElem.getBoundingClientRect();
            cachedRectTime = now;
            cachedHeroElem = heroElem;
            needsLayoutUpdate = false;
        }

        const rect = cachedRect;
        // Element is visible if its bottom edge is below top of viewport, and top edge is within viewport
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

        if (isVisible) {
            const centerX = rect.left + rect.width / 2;
            let targetY = rect.top + rect.height / 2;

            if (currentShape === 'repligen') {
                targetY = isMobileOrTablet ? (rect.bottom + 50) : (rect.bottom + 55);
            }

            const ndcX = (centerX / window.innerWidth) * 2 - 1;
            const ndcY = -(targetY / window.innerHeight) * 2 + 1;

            const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = (0 - camera.position.z) / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));

            targetGroup.position.copy(pos);
            return true;
        }

        return false;
    }





    function switchShape(newShape) {
        currentShape = newShape;
        
        let sourceArray = chaosPositions;
        if (newShape === 'sphere') sourceArray = spherePositions;
        if (newShape === 'helix') sourceArray = helixPositions;
        if (newShape === 'tesseract') sourceArray = tesseractPositions;
        if (newShape === 'trefoil') sourceArray = trefoilPositions;
        if (newShape === 'mobius') sourceArray = mobiusPositions;
        if (newShape === 'icosahedron') sourceArray = icosahedronPositions;
        if (newShape === 'repligen') sourceArray = repligenPositions;
        if (newShape === 'scrollSpiral' || newShape === 'twirlVortex') sourceArray = twirlPositions;
        if (!sourceArray) sourceArray = spherePositions;
        
        updateTargetPosition();

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

    // --- Page Load Initial State: Start SCATTERED, then assemble into Repligen Logo ---
    switchShape('chaos');

    // Trigger assembly after 700ms pause to clearly show scattered state on load
    setTimeout(() => {
        switchShape('repligen');
    }, 700);


    let isProfileVisible = true;

    // Alternating sequence starting with Repligen Logo and returning to Repligen between each complex object
    const shapesList = [
        'repligen',    // 1. Initial Load: Repligen Logo
        'tesseract',   // 2. Quantum Tesseract
        'repligen',    // 3. Return to Repligen
        'trefoil',     // 4. Bio-Helix Trefoil Knot
        'repligen',    // 5. Return to Repligen
        'icosahedron', // 6. Geodesic Neural Lattice
        'repligen',    // 7. Return to Repligen
        'mobius',      // 8. Mobius Ribbon Lattice
        'repligen',    // 9. Return to Repligen
        'sphere',      // 10. Orbital Analytics Ring
        'repligen',    // 11. Return to Repligen
        'helix'        // 12. Bioprocessing Strand
    ];
    let shapeIndex = 0;

    function cycleNextShape() {
        shapeIndex = (shapeIndex + 1) % shapesList.length;
        switchShape(shapesList[shapeIndex]);
    }

    let cycleInterval = setInterval(() => {
        isProfileVisible = updateTargetPosition();
        if (isProfileVisible) {
            cycleNextShape();
        }
    }, 16000);

    // Explosive dispersion trigger when particles exit hero viewport
    function triggerExplosion() {
        isExploding = true;
        switchShape('chaos');
        
        // Generate high-velocity radial explosion vectors
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 18.0 + Math.random() * 28.0;
            
            explosionVelocities[i3] = speed * Math.sin(phi) * Math.cos(angle);
            explosionVelocities[i3 + 1] = speed * Math.cos(phi);
            explosionVelocities[i3 + 2] = speed * Math.sin(phi) * Math.sin(angle);
        }

        if (explosionTimer) clearTimeout(explosionTimer);
        explosionTimer = setTimeout(() => {
            isExploding = false;
            targetGroup.position.set(0, 0, 0);
            switchShape('twirlVortex');
        }, 500);
    }

    // Track scroll to manage explosion and continuous twirling vortex
    document.addEventListener('scroll', () => {
        const wasVisible = isProfileVisible;
        isProfileVisible = updateTargetPosition();
        
        if (wasVisible && !isProfileVisible) {
            triggerExplosion();
        } else if (!wasVisible && isProfileVisible) {
            isExploding = false;
            if (explosionTimer) clearTimeout(explosionTimer);
            switchShape(shapesList[shapeIndex]);
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

    // --- Render Loop & Tab Visibility Throttling ---
    const clock = new THREE.Clock();
    let isAppHidden = false;

    document.addEventListener('visibilitychange', () => {
        isAppHidden = document.hidden;
    });

    function animate() {
        requestAnimationFrame(animate);
        if (isAppHidden) return; // Save 100% CPU/GPU resources when tab is backgrounded
        
        const delta = clock.getDelta();
        time += delta;
        material.uniforms.uTime.value = time;

        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        if (isExploding) {
            // Apply explosion burst velocity directly to current positions for dynamic shattering effect
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] += explosionVelocities[i] * delta * 45;
                positions[i + 1] += explosionVelocities[i + 1] * delta * 45;
                positions[i + 2] += explosionVelocities[i + 2] * delta * 45;
            }
            geometry.attributes.position.needsUpdate = true;
        } else if (currentShape !== 'chaos') {
            const isWidescreen = (window.innerWidth / window.innerHeight) >= 1.5;

            if (currentShape === 'twirlVortex' || currentShape === 'scrollSpiral') {
                const scrollY = window.scrollY;
                targetGroup.position.x = Math.sin(time * 0.4) * 12;
                targetGroup.position.y = Math.cos(time * 0.3) * 8;
                targetGroup.position.z = 0;

                const twirlSpeed = time * 0.95 + scrollY * 0.0028;
                const shapeScale = isWidescreen ? 1.8 : 1.0;

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    
                    const baseY = twirlPositions[i3 + 1] * shapeScale;
                    const baseR = Math.hypot(twirlPositions[i3], twirlPositions[i3 + 2]) * shapeScale;
                    const rWave = Math.sin(baseY * 0.02 + time * 2.2) * 14;
                    const finalR = baseR + rWave;
                    
                    const baseAngle = Math.atan2(twirlPositions[i3 + 2], twirlPositions[i3]);
                    const currentAngle = baseAngle + twirlSpeed + (baseY * 0.004);
                    
                    const rotX = finalR * Math.cos(currentAngle);
                    const rotZ = finalR * Math.sin(currentAngle);
                    const rotY = baseY + Math.sin(time * 1.8 + i * 0.15) * 4;

                    destinationPositions[i3] = rotX + targetGroup.position.x;
                    destinationPositions[i3 + 1] = rotY + targetGroup.position.y;
                    destinationPositions[i3 + 2] = rotZ + targetGroup.position.z;
                }
            } else {
                updateTargetPosition();
                
                const timeOffset = time * 0.35;
                let sourceArray = chaosPositions;
                if (currentShape === 'sphere') sourceArray = spherePositions;
                if (currentShape === 'helix') sourceArray = helixPositions;
                if (currentShape === 'tesseract') sourceArray = tesseractPositions;
                if (currentShape === 'trefoil') sourceArray = trefoilPositions;
                if (currentShape === 'mobius') sourceArray = mobiusPositions;
                if (currentShape === 'icosahedron') sourceArray = icosahedronPositions;
                if (currentShape === 'repligen') sourceArray = repligenPositions;
                if (!sourceArray) sourceArray = spherePositions;
                
                const shapeScale = (isWidescreen && currentShape !== 'repligen') ? 2.0 : 1.0;

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    
                    let x = sourceArray[i3] * shapeScale;
                    let y = sourceArray[i3+1] * shapeScale;
                    let z = sourceArray[i3+2] * shapeScale;
                    
                    const cosT = Math.cos(timeOffset);
                    const sinT = Math.sin(timeOffset);
                    
                    // ABSOLUTELY NO ROTATION for Repligen shape! Upright, flat, static, readable!
                    const rotX = currentShape === 'repligen' ? x : (x * cosT - z * sinT);
                    const rotZ = currentShape === 'repligen' ? z : (x * sinT + z * cosT);
                    
                    destinationPositions[i3] = rotX + targetGroup.position.x;
                    destinationPositions[i3+1] = y + targetGroup.position.y;
                    destinationPositions[i3+2] = rotZ + targetGroup.position.z;
                }
            }
        }

        
        // Silky smooth particle lerp
        const positions = geometry.attributes.position.array;
        const lerpFactor = currentShape === 'repligen' ? 0.022 : 0.018; 
        
        for (let i = 0; i < particleCount * 3; i+=3) {
            const driftX = Math.sin(time * 0.6 + i) * 1.2;
            const driftY = Math.cos(time * 0.5 + i) * 1.2;
            const driftZ = Math.sin(time * 0.4 + i) * 1.2;
            
            const destX = destinationPositions[i] + (currentShape === 'chaos' ? driftX : driftX * 0.15);
            const destY = destinationPositions[i+1] + (currentShape === 'chaos' ? driftY : driftY * 0.15);
            const destZ = destinationPositions[i+2] + (currentShape === 'chaos' ? driftZ : driftZ * 0.15);
            
            positions[i] += (destX - positions[i]) * lerpFactor;
            positions[i+1] += (destY - positions[i+1]) * lerpFactor;
            positions[i+2] += (destZ - positions[i+2]) * lerpFactor;
        }
        
        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateTargetPosition();
    });
});
