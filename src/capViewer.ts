// ============================================
// 3D CAP VIEWER — Three.js
// ============================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as TWEEN from '@tweenjs/tween.js';

// --- Product texture data ---
interface CapProduct {
    name: string;
    description: string;
    modelUrl: string;
}

const basePath = import.meta.env.BASE_URL;

const PRODUCTS: Record<string, CapProduct> = {
    blue: {
        name: 'Floral Cap — Sky Blue',
        description:
            'Handcrafted New Era fitted cap adorned with delicate blue hydrangea flowers, intricate white lace embroidery, and pearl bead accents. Each piece is uniquely made with love and attention to detail.',
        modelUrl: `${basePath}cap3d1.glb`,
    },
    white: {
        name: 'Floral Cap — Pearl White',
        description:
            'Elegant gray New Era cap embellished with pristine white fabric flowers, delicate lace leaves, and lustrous pearl accents. A timeless piece that blends streetwear with haute couture.',
        modelUrl: `${basePath}cap3d2.glb`,
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
    const viewerLoading = document.getElementById('viewerLoading');

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
    loader.setMeshoptDecoder(MeshoptDecoder);
    let currentModel: THREE.Group | null = null;
    let loadedUrl: string = '';
    const modelCache: Record<string, THREE.Group> = {};
    let isTransitioning = false;

    function loadModel(url: string) {
        if (url === loadedUrl || isTransitioning) return; // Prevent reloading same model or overriding transition
        loadedUrl = url;

        if (viewerLoading && !modelCache[url]) viewerLoading.classList.remove('hidden');

        const showModel = (model: THREE.Group) => {
            if (viewerLoading) viewerLoading.classList.add('hidden');
            if (currentModel) {
                isTransitioning = true;
                new TWEEN.Tween(currentModel.scale)
                    .to({ x: 0.001, y: 0.001, z: 0.001 }, 300)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(() => {
                        capGroup.remove(currentModel!);
                        
                        model.scale.setScalar(0.001);
                        capGroup.add(model);
                        currentModel = model;
                        const targetScale = model.userData.targetScale || 1;

                        new TWEEN.Tween(model.scale)
                            .to({ x: targetScale, y: targetScale, z: targetScale }, 600)
                            .easing(TWEEN.Easing.Elastic.Out)
                            .onComplete(() => { isTransitioning = false; })
                            .start();
                    })
                    .start();
            } else {
                capGroup.add(model);
                currentModel = model;
                const targetScale = model.userData.targetScale || 1;
                model.scale.setScalar(0.001);
                new TWEEN.Tween(model.scale)
                    .to({ x: targetScale, y: targetScale, z: targetScale }, 800)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .start();
            }
        };

        if (modelCache[url]) {
            showModel(modelCache[url]);
            return;
        }

        loader.load(
            url,
            (gltf) => {
                const model = gltf.scene;

                // Automatically normalize scale and center the model
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                const maxDim = Math.max(size.x, size.y, size.z);
                const targetScale = maxDim > 0 ? 2.5 / maxDim : 1;
                
                model.userData.targetScale = targetScale;
                model.position.sub(center.clone().multiplyScalar(targetScale));
                model.position.y += 0.2; // lifting it slightly above ground zero

                // Ensure meshes can cast and receive shadows
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                modelCache[url] = model;

                if (loadedUrl === url) {
                    showModel(model);
                }
            },
            undefined,
            (error) => {
                console.error('An error happened loading the cap model:', error);
                if (loadedUrl === url) loadedUrl = ''; // Allow retry
            }
        );
    }

    loadModel(PRODUCTS['blue'].modelUrl);
    capGroup.rotation.y = -Math.PI / 4;

    // Preload other models after a short delay
    setTimeout(() => {
        Object.values(PRODUCTS).forEach((p) => {
             if (!modelCache[p.modelUrl] && p.modelUrl !== loadedUrl) {
                 loader.load(p.modelUrl, (gltf) => {
                      const model = gltf.scene;
                      const box = new THREE.Box3().setFromObject(model);
                      const size = box.getSize(new THREE.Vector3());
                      const center = box.getCenter(new THREE.Vector3());
                      
                      const maxDim = Math.max(size.x, size.y, size.z);
                      const targetScale = maxDim > 0 ? 2.5 / maxDim : 1;
                      
                      model.userData.targetScale = targetScale;
                      model.position.sub(center.clone().multiplyScalar(targetScale));
                      model.position.y += 0.2;
                      
                      model.traverse((child) => {
                          if ((child as THREE.Mesh).isMesh) {
                              child.castShadow = true;
                              child.receiveShadow = true;
                          }
                      });
                      
                      modelCache[p.modelUrl] = model;
                 });
             }
        });
    }, 2500);

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
    function animate(time?: number): void {
        requestAnimationFrame(animate);
        if (time !== undefined) {
            TWEEN.update(time);
        }
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
