// ============================================
// 3D CAP VIEWER — Three.js
// ============================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- Product texture data ---
interface CapProduct {
    name: string;
    description: string;
    crownColor: string;
    brimColor: string;
    frontTexture: string;
}

const PRODUCTS: Record<string, CapProduct> = {
    blue: {
        name: 'Floral Cap — Sky Blue',
        description:
            'Handcrafted New Era fitted cap adorned with delicate blue hydrangea flowers, intricate white lace embroidery, and pearl bead accents. Each piece is uniquely made with love and attention to detail.',
        crownColor: '#b8b0a3',
        brimColor: '#a8a095',
        frontTexture: '/caps/cap_blue_front.png',
    },
    white: {
        name: 'Floral Cap — Pearl White',
        description:
            'Elegant gray New Era cap embellished with pristine white fabric flowers, delicate lace leaves, and lustrous pearl accents. A timeless piece that blends streetwear with haute couture.',
        crownColor: '#b8b0a3',
        brimColor: '#a8a095',
        frontTexture: '/caps/cap_white_front.png',
    },
    pink: {
        name: 'Floral Cap — Rose Pink',
        description:
            'Bold royal blue New Era LA Dodgers cap decorated with soft pink roses, golden lace embroidery, and pearl details. A stunning fusion of sporty and feminine aesthetics.',
        crownColor: '#2244aa',
        brimColor: '#1a3488',
        frontTexture: '/caps/cap_pink_front.png',
    },
};

// --- Build the 3D cap geometry ---
function createCapCrown(): THREE.Group {
    const group = new THREE.Group();

    // === CROWN (dome) ===
    // Profile for LatheGeometry: a baseball cap crown cross-section
    const profilePoints: THREE.Vector2[] = [];
    const segments = 40;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // A profile that goes from bottom-center to top like a cap dome
        const angle = t * Math.PI * 0.52; // not full half — flatter on top
        const r = 1.35 - t * 0.15; // slight narrowing upward
        const x = Math.sin(angle) * r;
        const y = Math.cos(angle) * r * 0.75; // flatten the dome
        profilePoints.push(new THREE.Vector2(x, y));
    }

    const crownGeometry = new THREE.LatheGeometry(profilePoints, 64, 0, Math.PI * 2);

    // Create material
    const crownMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b8b0a3'),
        roughness: 0.85,
        metalness: 0.02,
        side: THREE.DoubleSide,
    });

    const crownMesh = new THREE.Mesh(crownGeometry, crownMaterial);
    crownMesh.position.y = -0.15;
    crownMesh.name = 'crown';
    group.add(crownMesh);

    // === BUTTON on top ===
    const buttonGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const buttonMaterial = new THREE.MeshStandardMaterial({
        color: '#b8b0a3',
        roughness: 0.5,
        metalness: 0.1,
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    // Calculate top position
    const topPoint = profilePoints[profilePoints.length - 1];
    button.position.set(0, topPoint.y - 0.15 + 0.03, 0);
    button.name = 'button';
    group.add(button);

    // === BRIM / VISOR ===
    const brimShape = new THREE.Shape();
    // Starting from near the face opening
    brimShape.moveTo(0, 0);
    brimShape.quadraticCurveTo(0.8, 0.05, 1.5, 0.15);
    brimShape.quadraticCurveTo(1.6, 0.18, 1.5, 0.22);
    brimShape.quadraticCurveTo(0.8, 0.1, 0, 0.06);
    brimShape.quadraticCurveTo(-0.8, 0.1, -1.5, 0.22);
    brimShape.quadraticCurveTo(-1.6, 0.18, -1.5, 0.15);
    brimShape.quadraticCurveTo(-0.8, 0.05, 0, 0);

    const brimExtrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: 0.04,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.02,
        bevelSegments: 3,
    };

    const brimGeometry = new THREE.ExtrudeGeometry(brimShape, brimExtrudeSettings);
    const brimMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#a8a095'),
        roughness: 0.7,
        metalness: 0.03,
        side: THREE.DoubleSide,
    });

    const brimMesh = new THREE.Mesh(brimGeometry, brimMaterial);
    brimMesh.rotation.x = -Math.PI / 2 + 0.2; // tilt slightly down
    brimMesh.position.set(0, -0.15, 1.15);
    brimMesh.name = 'brim';
    group.add(brimMesh);

    // === SEAM LINES on crown ===
    for (let i = 0; i < 6; i++) {
        const seamAngle = (i / 6) * Math.PI * 2;
        const seamPoints: THREE.Vector3[] = [];

        for (let j = 0; j <= 20; j++) {
            const t = j / 20;
            const angle = t * Math.PI * 0.52;
            const r = 1.35 - t * 0.15;
            const x = Math.sin(angle) * r * 0.995;
            const y = Math.cos(angle) * r * 0.75 - 0.15;

            seamPoints.push(new THREE.Vector3(
                x * Math.sin(seamAngle),
                y,
                x * Math.cos(seamAngle)
            ));
        }

        const seamGeometry = new THREE.BufferGeometry().setFromPoints(seamPoints);
        const seamMaterial = new THREE.LineBasicMaterial({
            color: '#9a9285',
            transparent: true,
            opacity: 0.4,
        });
        const seam = new THREE.Line(seamGeometry, seamMaterial);
        seam.name = `seam_${i}`;
        group.add(seam);
    }

    // === EYELETS (ventilation holes) ===
    for (let i = 0; i < 6; i++) {
        const eyeletAngle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const eyeletGeometry = new THREE.TorusGeometry(0.03, 0.008, 8, 16);
        const eyeletMaterial = new THREE.MeshStandardMaterial({
            color: '#c0b8a8',
            metalness: 0.4,
            roughness: 0.3,
        });
        const eyelet = new THREE.Mesh(eyeletGeometry, eyeletMaterial);

        // Position on the crown surface
        const eyeAngle = Math.PI * 0.25; // vertical angle (mid-height)
        const r = 1.35 - 0.5 * 0.15;
        const surfaceR = Math.sin(eyeAngle) * r * 0.99;
        const surfaceY = Math.cos(eyeAngle) * r * 0.75 - 0.15;

        eyelet.position.set(
            surfaceR * Math.sin(eyeletAngle),
            surfaceY,
            surfaceR * Math.cos(eyeletAngle)
        );

        // Orient to face outward
        eyelet.lookAt(0, surfaceY, 0);
        eyelet.name = `eyelet_${i}`;
        group.add(eyelet);
    }

    // === SWEATBAND (inner rim) ===
    const bandGeometry = new THREE.TorusGeometry(1.3, 0.06, 8, 64, Math.PI * 2);
    const bandMaterial = new THREE.MeshStandardMaterial({
        color: '#d4c9b8',
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide,
    });
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.rotation.x = Math.PI / 2;
    band.position.y = -0.15;
    band.name = 'sweatband';
    group.add(band);

    return group;
}

// --- Create flower decoration on the cap ---
function createFloralDecoration(color1: string, color2: string, pearlColor: string): THREE.Group {
    const floral = new THREE.Group();

    // Create multiple flowers at different positions on the crown
    const flowerPositions = [
        { angle: Math.PI * 0.15, height: 0.35, scale: 1.0 },
        { angle: Math.PI * 0.05, height: 0.55, scale: 0.7 },
        { angle: Math.PI * 0.25, height: 0.25, scale: 0.8 },
        { angle: -Math.PI * 0.05, height: 0.45, scale: 0.6 },
        { angle: Math.PI * 0.1, height: 0.15, scale: 0.5 },
        { angle: Math.PI * 0.2, height: 0.5, scale: 0.55 },
        { angle: Math.PI * 0.0, height: 0.3, scale: 0.45 },
    ];

    flowerPositions.forEach((pos, idx) => {
        const flower = createSingleFlower(
            idx % 2 === 0 ? color1 : color2,
            pearlColor,
            pos.scale
        );

        // Position on crown surface  
        const vertAngle = pos.height * Math.PI * 0.52;
        const r = 1.35 - pos.height * 0.15;
        const surfR = Math.sin(vertAngle) * r;
        const surfY = Math.cos(vertAngle) * r * 0.75 - 0.15;

        flower.position.set(
            surfR * Math.sin(pos.angle),
            surfY,
            surfR * Math.cos(pos.angle)
        );

        // Orient outward from crown center
        const outward = new THREE.Vector3(
            Math.sin(pos.angle),
            0.3,
            Math.cos(pos.angle)
        ).normalize();
        flower.lookAt(
            flower.position.x + outward.x,
            flower.position.y + outward.y,
            flower.position.z + outward.z
        );

        floral.add(flower);
    });

    // Add leaves between flowers
    const leafPositions = [
        { angle: Math.PI * 0.1, height: 0.2 },
        { angle: Math.PI * 0.22, height: 0.4 },
        { angle: -Math.PI * 0.02, height: 0.6 },
        { angle: Math.PI * 0.15, height: 0.5 },
        { angle: Math.PI * 0.08, height: 0.1 },
    ];

    leafPositions.forEach((pos) => {
        const leaf = createLeaf('#c5b898');
        const vertAngle = pos.height * Math.PI * 0.52;
        const r = 1.35 - pos.height * 0.15;
        const surfR = Math.sin(vertAngle) * r * 1.01;
        const surfY = Math.cos(vertAngle) * r * 0.75 - 0.15;

        leaf.position.set(
            surfR * Math.sin(pos.angle),
            surfY,
            surfR * Math.cos(pos.angle)
        );

        leaf.rotation.z = Math.random() * Math.PI;
        const outward2 = new THREE.Vector3(
            Math.sin(pos.angle), 0.2, Math.cos(pos.angle)
        ).normalize();
        leaf.lookAt(
            leaf.position.x + outward2.x,
            leaf.position.y + outward2.y,
            leaf.position.z + outward2.z
        );

        floral.add(leaf);
    });

    return floral;
}

function createSingleFlower(color: string, pearlColor: string, scale: number): THREE.Group {
    const flower = new THREE.Group();

    // Petals — 5 petals arranged around center
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
        const petalAngle = (i / petalCount) * Math.PI * 2;
        const petalGeometry = new THREE.SphereGeometry(0.08 * scale, 8, 6);
        petalGeometry.scale(1, 0.3, 1.8); // flatten and elongate

        const petalMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.6,
            metalness: 0.05,
            side: THREE.DoubleSide,
        });

        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.set(
            Math.cos(petalAngle) * 0.06 * scale,
            0,
            Math.sin(petalAngle) * 0.06 * scale
        );
        petal.rotation.y = petalAngle;
        flower.add(petal);
    }

    // Pearl center
    const pearlGeometry = new THREE.SphereGeometry(0.025 * scale, 12, 12);
    const pearlMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pearlColor),
        roughness: 0.15,
        metalness: 0.5,
        envMapIntensity: 1.5,
    });
    const pearl = new THREE.Mesh(pearlGeometry, pearlMaterial);
    pearl.position.y = 0.02 * scale;
    flower.add(pearl);

    return flower;
}

function createLeaf(color: string): THREE.Group {
    const leaf = new THREE.Group();

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.03, 0.04, 0, 0.1);
    leafShape.quadraticCurveTo(-0.03, 0.04, 0, 0);

    const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
        depth: 0.005,
        bevelEnabled: false,
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.7,
        metalness: 0.05,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    });

    const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.add(leafMesh);

    return leaf;
}

// --- Floral color presets ---
const FLORAL_PRESETS: Record<string, { color1: string; color2: string; pearl: string }> = {
    blue: { color1: '#7cb4e0', color2: '#a8d4f0', pearl: '#e8e0d8' },
    white: { color1: '#f0ece6', color2: '#ffffff', pearl: '#f5f0e8' },
    pink: { color1: '#f0a0b0', color2: '#f8c0cc', pearl: '#f0e8e0' },
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
    camera.position.set(0, 0.8, 3.5);

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
    const ambientLight = new THREE.AmbientLight('#fff8f0', 0.6);
    scene.add(ambientLight);

    // Key light (warm, from top-front-right)
    const keyLight = new THREE.DirectionalLight('#fffaf0', 1.4);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(1024);
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    // Fill light (cool, from left)
    const fillLight = new THREE.DirectionalLight('#e0e8ff', 0.5);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Rim light (backlight for depth)
    const rimLight = new THREE.DirectionalLight('#ffd4b8', 0.7);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Soft bottom fill
    const bottomLight = new THREE.DirectionalLight('#f0e8dc', 0.3);
    bottomLight.position.set(0, -2, 1);
    scene.add(bottomLight);

    // --- Ground plane (shadow catcher) ---
    const groundGeometry = new THREE.PlaneGeometry(6, 6);
    const groundMaterial = new THREE.ShadowMaterial({
        opacity: 0.12,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.0;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Create cap ---
    const capGroup = new THREE.Group();
    const capStructure = createCapCrown();
    capGroup.add(capStructure);

    // Add floral decoration
    let floralDecor = createFloralDecoration(
        FLORAL_PRESETS.blue.color1,
        FLORAL_PRESETS.blue.color2,
        FLORAL_PRESETS.blue.pearl
    );
    capGroup.add(floralDecor);

    // Position cap
    capGroup.rotation.x = -0.15; // slight tilt
    capGroup.position.y = 0.1;
    scene.add(capGroup);

    // Enable shadows on all cap meshes
    capGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

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
        const floralPreset = FLORAL_PRESETS[key];
        if (!product || !floralPreset) return;

        // Update info panel
        if (productNameEl) productNameEl.textContent = product.name;
        if (productDescEl) productDescEl.textContent = product.description;

        // Update thumbnails
        productThumbs.forEach((thumb) => {
            thumb.classList.toggle('active', thumb.dataset.product === key);
        });

        // Update cap colors
        capStructure.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.name === 'crown' || child.name === 'button') {
                    (child.material as THREE.MeshStandardMaterial).color.set(product.crownColor);
                }
                if (child.name === 'brim') {
                    (child.material as THREE.MeshStandardMaterial).color.set(product.brimColor);
                }
            }
        });

        // Replace floral decoration
        capGroup.remove(floralDecor);
        floralDecor = createFloralDecoration(
            floralPreset.color1,
            floralPreset.color2,
            floralPreset.pearl
        );
        capGroup.add(floralDecor);

        // Re-enable shadows
        floralDecor.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
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
