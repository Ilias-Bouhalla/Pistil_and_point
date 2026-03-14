// ============================================
// 3D CAP VIEWER — Three.js
// ============================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- Product texture data ---
interface CapProduct {
    name: string;
    description: string;
    modelUrl: string;
}

const PRODUCTS: Record<string, CapProduct> = {
    blue: {
        name: 'Floral Cap — Sky Blue',
        description:
            'Handcrafted New Era fitted cap adorned with delicate blue hydrangea flowers, intricate white lace embroidery, and pearl bead accents. Each piece is uniquely made with love and attention to detail.',
        modelUrl: './cap3d1.glb',
    },
    white: {
        name: 'Floral Cap — Pearl White',
        description:
            'Elegant gray New Era cap embellished with pristine white fabric flowers, delicate lace leaves, and lustrous pearl accents. A timeless piece that blends streetwear with haute couture.',
        modelUrl: './cap3d2.glb',
    },
    pink: {
        name: 'Floral Cap — Rose Pink',
        description:
            'Bold royal blue New Era LA Dodgers cap decorated with soft pink roses, golden lace embroidery, and pearl details. A stunning fusion of sporty and feminine aesthetics.',
        modelUrl: './cap3d1.glb',
    },
};

// ============================================
// MAIN INIT
// ============================================
export function init3DViewer(): void {
    const container = document.getElementById('viewer3D');
    const dragHint = document.getElementById('viewerDragHint');
    const productThumbs = document.querySelectorAll<HTMLButtonElement>('.product-thumb');
    const productNameEl = document.getElementById('productName');
    const productDescEl = document.getElementById('productDescription');

    if (!container) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    scene.background = null; // transparent — CSS handles background

    const camera = new THREE.PerspectiveCamera(
        35,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 0.8, 4.5); // Move camera slightly back

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.insertBefore(renderer.domElement, container.firstChild);

    // --- Lighting ---
    // Soft ambient
    const ambientLight = new THREE.AmbientLight('#fff8f0', 0.8);
    scene.add(ambientLight);

    // Key light (warm, from top-front-right)
    const keyLight = new THREE.DirectionalLight('#fffaf0', 1.5);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(2048);
    keyLight.shadow.radius = 4;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill light (cool, from left)
    const fillLight = new THREE.DirectionalLight('#e0e8ff', 0.6);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Rim light (backlight for depth)
    const rimLight = new THREE.DirectionalLight('#ffd4b8', 0.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Soft bottom fill
    const bottomLight = new THREE.DirectionalLight('#f0e8dc', 0.4);
    bottomLight.position.set(0, -2, 1);
    scene.add(bottomLight);

    // --- Ground plane (shadow catcher) ---
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({
        opacity: 0.12,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.0;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Create cap group ---
    const capGroup = new THREE.Group();
    scene.add(capGroup);

    // Load actual GLTF / GLB model
    const loader = new GLTFLoader();
    let currentModel: THREE.Group | null = null;
    let loadedUrl: string = '';

    function loadModel(url: string) {
        if (url === loadedUrl) return; // Prevent reloading same model
        loadedUrl = url;

        loader.load(
            url,
            (gltf) => {
                const model = gltf.scene;

                // Automatically normalize scale and center the model
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                const maxDim = Math.max(size.x, size.y, size.z);
                const targetSize = 2.5; // adjust to make it look right in the scene
                if (maxDim > 0) {
                    const scale = targetSize / maxDim;
                    model.scale.setScalar(scale);
                }

                model.position.sub(center.multiplyScalar(model.scale.x));
                model.position.y += 0.2; // lifting it slightly above ground zero

                // Ensure meshes can cast and receive shadows
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                if (currentModel) {
                    capGroup.remove(currentModel);
                }
                currentModel = model;
                capGroup.add(model);
            },
            undefined,
            (error) => {
                console.error('An error happened loading the cap model:', error);
                loadedUrl = ''; // Allow retry
            }
        );
    }

    loadModel(PRODUCTS['blue'].modelUrl);
    capGroup.rotation.y = -Math.PI / 4;

    // --- OrbitControls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.0;
    controls.minPolarAngle = Math.PI * 0.1;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.target.set(0, 0.3, 0);
    controls.update();

    // Pause auto-rotate on interaction
    let interactionTimeout: number | null = null;
    const pauseAutoRotate = () => {
        controls.autoRotate = false;
        if (interactionTimeout) clearTimeout(interactionTimeout);
        interactionTimeout = window.setTimeout(() => {
            controls.autoRotate = true;
        }, 4000);

        // Hide drag hint
        if (dragHint && !dragHint.classList.contains('hidden')) {
            dragHint.classList.add('hidden');
        }
    };

    controls.addEventListener('start', pauseAutoRotate);

    // --- Switch product ---
    function switchProduct(key: string): void {
        const product = PRODUCTS[key];
        if (!product) return;

        // Update info panel
        if (productNameEl) productNameEl.textContent = product.name;
        if (productDescEl) productDescEl.textContent = product.description;

        // Update thumbnails
        productThumbs.forEach((thumb) => {
            thumb.classList.toggle('active', thumb.dataset.product === key);
        });

        loadModel(product.modelUrl);
    }

    // Thumbnail click handlers
    productThumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            const key = thumb.dataset.product || 'blue';
            switchProduct(key);
        });
    });

    // --- Animation loop ---
    function animate(): void {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // --- Resize handler ---
    const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    resizeObserver.observe(container);
}
