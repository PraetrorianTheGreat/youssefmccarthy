document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('webgl-bg');
    if (!canvas || typeof THREE === 'undefined') return;

    // --- WebGL Setup ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const sceneWireframe = new THREE.Scene();
    sceneWireframe.fog = new THREE.FogExp2(0x0a0e1a, 0.02);
    
    const cameraWireframe = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraWireframe.position.set(0, 10, 30);
    cameraWireframe.lookAt(0, 0, 0);

    const clock = new THREE.Clock();

    // --- Background: Wireframe Waves ---
    const waveGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    waveGeometry.rotateX(-Math.PI / 2);
    
    const waveMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    
    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.position.y = -8;
    sceneWireframe.add(waveMesh);

    // --- State and Toggle Logic ---
    let currentMode = 'original'; // 'original' or 'wireframe'
    
    const toggleBtn = document.getElementById('webgl-toggle-btn');
    const toggleText = toggleBtn?.querySelector('.webgl-toggle-text');
    const particlesCanvas = document.getElementById('particles');
    const bgGrid = document.querySelector('.bg-grid');
    
    let isAnimating = false;

    // Reduced motion: render one still frame instead of a loop (WCAG 2.2.2), and follow live changes.
    const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const prefersReduced = () => !!(reducedMotion && reducedMotion.matches);
    let rafId = null;

    function startWireframe() {
        if (currentMode !== 'wireframe') return;
        if (prefersReduced()) {
            renderFrame(0); // matches the first animated frame
        } else if (!isAnimating) {
            isAnimating = true;
            animate();
        }
    }

    if (reducedMotion) {
        const onChange = () => {
            if (prefersReduced()) {
                if (rafId !== null) cancelAnimationFrame(rafId);
                rafId = null;
                isAnimating = false;
            } else {
                startWireframe();
            }
        };
        if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onChange);
        else if (reducedMotion.addListener) reducedMotion.addListener(onChange);
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (currentMode === 'original') {
                currentMode = 'wireframe';
                toggleText.textContent = 'Back to Original';
                canvas.style.display = 'block';
                if (particlesCanvas) particlesCanvas.style.opacity = '0';
                if (bgGrid) bgGrid.style.opacity = '0';
                
                // Restart animation loop (or draw a still frame for reduced motion)
                startWireframe();
            } else {
                currentMode = 'original';
                toggleText.textContent = 'Try New Background';
                canvas.style.display = 'none';
                if (particlesCanvas) particlesCanvas.style.opacity = '1';
                if (bgGrid) bgGrid.style.opacity = '1';
            }
        });
    }

    // --- Resize Handler ---
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        cameraWireframe.aspect = window.innerWidth / window.innerHeight;
        cameraWireframe.updateProjectionMatrix();
        if (currentMode === 'wireframe' && prefersReduced()) renderer.render(sceneWireframe, cameraWireframe);
    });

    // --- Animation Loop ---
    function animate() {
        rafId = null;
        if (currentMode === 'original' || prefersReduced()) {
            isAnimating = false;
            return; // Completely stop loop
        }
        
        rafId = requestAnimationFrame(animate);
        
        renderFrame(clock.getElapsedTime());
    }

    function renderFrame(elapsedTime) {
        if (currentMode === 'wireframe') {
            const positions = waveMesh.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const z = positions.getZ(i);
                const y = Math.sin(x * 0.2 + elapsedTime * 1.0) * 1.5 + 
                          Math.cos(z * 0.15 + elapsedTime * 0.8) * 1.5;
                positions.setY(i, y);
            }
            positions.needsUpdate = true;
            
            waveMesh.rotation.y = Math.sin(elapsedTime * 0.05) * 0.05;
            
            renderer.render(sceneWireframe, cameraWireframe);
        }
    }

    startWireframe();
});
