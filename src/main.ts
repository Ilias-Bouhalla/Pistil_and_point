import './style.css';
import { init3DViewer } from './capViewer';

// ============================================
// FLOWERCAP PORTFOLIO — MAIN SCRIPT
// ============================================

// --- Types ---
interface Position {
  x: number;
  y: number;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  type: number;
}

interface PixelFlower {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  type: number; // 0-3 different flower shapes
}

type Lang = 'fr' | 'en';

// --- Translations ---
const translations: Record<string, Record<Lang, string>> = {
  // Loader
  loader_tagline: { fr: 'Fait main avec amour 🌸', en: 'Handcrafted with love 🌸' },
  // Hero
  hero_subtitle: { fr: 'CASQUETTES & TAPIS ARTISANAUX • FRANCE', en: 'HANDCRAFTED CAPS & RUGS • FRANCE' },
  hero_tagline: { fr: 'Entre broderie fine et tufting vibrant, chaque pièce est une œuvre unique pour votre style et votre intérieur.', en: 'From fine embroidery to vibrant tufting, each piece is a unique artwork for your style and your home.' },
  hero_cta_discover: { fr: 'Découvrir', en: 'Discover' },
  hero_cta_shop: { fr: 'Acheter sur Vinted', en: 'Shop on Vinted' },
  hero_scroll: { fr: 'Défiler', en: 'Scroll' },
  // Nav
  nav_home: { fr: 'ACCUEIL', en: 'HOME' },
  nav_about: { fr: 'À PROPOS', en: 'ABOUT' },
  nav_caps: { fr: 'CASQUETTES', en: 'CAPS' },
  nav_rugs: { fr: 'TAPIS', en: 'RUGS' },
  nav_process: { fr: 'PROCESSUS', en: 'PROCESS' },
  nav_contact: { fr: 'CONTACT', en: 'CONTACT' },
  // About
  about_label: { fr: 'À PROPOS', en: 'ABOUT ME' },
  about_title_html: {
    fr: 'Salut, moi c\'est Ili 🌷<br />l\'artiste derrière<br /><em>Pistil & Point</em>.',
    en: 'Hi, I\'m Ili 🌷<br />the artist behind<br /><em>Pistil & Point</em>.'
  },
  about_p1: {
    fr: 'Je suis Ili, j\'ai 21 ans et je vis en France. Passionnée par le textile, j\'ai créé Pistil & Point pour explorer deux univers complémentaires : la broderie minutieuse sur casquettes et le tufting vibrant de tapis artistiques.',
    en: 'I\'m Ili, a 21-year-old artist based in France. Passionate about textiles, I created Pistil & Point to explore two complementary worlds: meticulous embroidery on caps and vibrant tufting of artistic rugs.'
  },
  about_p2: {
    fr: 'Qu\'il s\'agisse d\'un bouquet à porter ou d\'un jardin de laine pour votre sol, chaque création est faite main. Mon but est de transformer des objets du quotidien en pièces de collection organiques et poétiques.',
    en: 'Whether it\'s a wearable bouquet or a wool garden for your floor, every creation is handmade. My goal is to transform everyday objects into organic and poetic collector\'s pieces.'
  },
  about_p3: {
    fr: 'Retrouvez mes drops sur Vinted et suivez les coulisses de l\'atelier sur mes réseaux ! ✨',
    en: 'Find my drops on Vinted and follow the workshop behind-the-scenes on my socials! ✨'
  },
  stat_creations: { fr: 'Pièces Uniques', en: 'Unique Pieces' },
  stat_clients: { fr: 'Clients Satisfaits', en: 'Happy Customers' },
  stat_techniques: { fr: 'Techniques Artisanal', en: 'Handcraft Techniques' },
  // Gallery
  gallery_caps_title: { fr: 'La Collection <em>Casquettes</em>', en: 'The <em>Caps</em> Collection' },
  gallery_rugs_title: { fr: 'Le Studio <em>Tapis</em>', en: 'The <em>Rug</em> Studio' },
  gallery_view: { fr: 'Voir les détails →', en: 'View Details →' },
  // Specific projects
  proj_cap1_cat: { fr: 'Hortensia Bleu • Broderie Main', en: 'Blue Hydrangea • Hand Embroidery' },
  proj_cap2_cat: { fr: 'Fleurs Blanches • Perles', en: 'White Flowers • Pearls' },
  proj_rug1_cat: { fr: 'Coquelicots • Tapis Tufté', en: 'Poppies • Tufted Rug' },
  proj_rug2_cat: { fr: 'Pivoine Royale • Forme Découpée', en: 'Royal Peony • Shaped Rug' },
  proj_rug3_cat: { fr: 'Feuillage Tropical • Texture Laine', en: 'Tropical Foliage • Wool Texture' },
  // Product
  product_label: { fr: 'ZOOM SUR', en: 'FOCUS ON' },
  product_title_html: { fr: 'Détails de <em>confection</em>. 🌿', en: 'Craft <em>details</em>. 🌿' },
  product_drag: { fr: 'Glisser pour tourner • Scroll pour zoomer', en: 'Drag to rotate • Scroll to zoom' },
  product_desc: {
    fr: 'Chaque pièce Pistil & Point demande des dizaines d\'heures de travail, entre le choix des fils, le tracé des motifs et la réalisation finale au point par point ou au tufting gun.',
    en: 'Each Pistil & Point piece requires dozens of hours of work, from selecting yarns and sketching patterns to the final execution via stitch or tufting gun.'
  },
  product_material: { fr: 'Matière', en: 'Material' },
  product_craft: { fr: 'Savoir-faire', en: 'Craft' },
  product_handmade: { fr: '100% Artisanal 🌸', en: '100% Handcrafted 🌸' },
  product_buy: { fr: 'Acheter sur Vinted →', en: 'Shop on Vinted →' },
  // Process
  process_label: { fr: 'LE STUDIO', en: 'THE STUDIO' },
  process_title_html: { fr: 'De l\'idée aux <em>fibres</em>. 🌱', en: 'From idea to <em>fibers</em>. 🌱' },
  process_step1_title: { fr: 'Inspiration Botanique', en: 'Botanical Inspiration' },
  process_step1_text: { fr: 'Je m\'inspire de la nature pour dessiner des motifs qui s\'adaptent soit à la courbure d\'une casquette, soit à l\'espace d\'un tapis.', en: 'I draw inspiration from nature to design patterns that adapt either to the curve of a cap or the space of a rug.' },
  process_step1_label: { fr: 'Concept', en: 'Concept' },
  process_step2_title: { fr: 'Préparation Technique', en: 'Technical Setup' },
  process_step2_text: { fr: 'Tracé sur canevas pour les tapis ou montage sur tambour pour les casquettes. Le choix des couleurs de laine et de soie commence ici.', en: 'Sketching on canvas for rugs or mounting on hoops for caps. The choice of wool and silk colors starts here.' },
  process_step2_label: { fr: 'Mise en place', en: 'Setup' },
  process_step3_title: { fr: 'Réalisation', en: 'Execution' },
  process_step3_text: { fr: 'Le tufting gun donne du relief aux tapis, tandis que l\'aiguille apporte la finesse aux casquettes. Deux gestes, une même passion.', en: 'The tufting gun gives relief to rugs, while the needle brings finesse to caps. Two gestures, one passion.' },
  process_step3_label: { fr: 'Action', en: 'Action' },
  // Contact
  contact_label: { fr: 'CONTACT', en: 'GET IN TOUCH' },
  contact_title_html: { fr: 'Faisons <em>fleurir</em><br />votre projet. 🌸', en: 'Let\'s make your<br />project <em>bloom</em>. 🌸' },
  contact_subtitle: { fr: 'Besoin d\'un tapis sur mesure ou d\'une casquette personnalisée ? Discutons de vos envies !', en: 'Need a custom rug or a personalized cap? Let\'s discuss your ideas!' },
};

// --- DOM Elements ---
const loader = document.getElementById('loader')!;
const loaderBarFill = document.getElementById('loaderBarFill')!;
const mainContent = document.getElementById('mainContent')!;
const bottomNav = document.getElementById('bottomNav')!;
const cursorFollower = document.getElementById('cursorFollower')!;
const cursorDot = document.getElementById('cursorDot')!;
const langToggle = document.getElementById('langToggle')!;

// --- State ---
let mousePos: Position = { x: 0, y: 0 };
let cursorPos: Position = { x: 0, y: 0 };
let currentLang: Lang = 'fr';

// ============================================
// LANGUAGE TOGGLE SYSTEM
// ============================================
function initLanguageToggle(): void {
  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    applyLanguage(currentLang);
  });
}

function applyLanguage(lang: Lang): void {
  // Update toggle button
  const flag = langToggle.querySelector('.lang-flag')!;
  const label = langToggle.querySelector('.lang-label')!;
  if (lang === 'fr') {
    flag.textContent = '🇬🇧';
    label.textContent = 'EN';
  } else {
    flag.textContent = '🇫🇷';
    label.textContent = 'FR';
  }

  // Update html lang
  document.documentElement.lang = lang;

  // Update page title
  document.title = lang === 'fr'
    ? 'Pistil & Point — Créations Textiles & Florales'
    : 'Pistil & Point — Handcrafted Floral & Textile Arts';

  // Update all [data-i18n] elements
  const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n')!;
    const translation = translations[key];
    if (translation) {
      if (key.endsWith('_html')) {
        el.innerHTML = translation[lang];
      } else {
        el.textContent = translation[lang];
      }
    }
  });
}

// ============================================
// LOADING ANIMATION
// ============================================
function initLoader(): Promise<void> {
  return new Promise((resolve) => {
    let progress = 0;
    const duration = 2200;
    const startTime = performance.now();

    function updateProgress(currentTime: number) {
      const elapsed = currentTime - startTime;
      progress = Math.min((elapsed / duration) * 100, 100);
      const eased = easeOutQuart(progress / 100) * 100;
      loaderBarFill.style.width = `${eased}%`;

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          loader.classList.add('hidden');
          resolve();
        }, 400);
      }
    }

    requestAnimationFrame(updateProgress);
  });
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// ============================================
// PIXEL FLOWERS BACKGROUND (Subtle, cubic)
// ============================================
function initPixelFlowers(): void {
  const canvas = document.getElementById('pixelFlowersCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  let flowers: PixelFlower[] = [];

  const flowerColors = [
    'rgba(196, 135, 138, VAR)',  // rose
    'rgba(168, 184, 156, VAR)',  // sage
    'rgba(137, 180, 216, VAR)',  // sky blue
    'rgba(232, 180, 182, VAR)',  // light rose
    'rgba(196, 168, 124, VAR)',  // gold
    'rgba(181, 212, 236, VAR)',  // light sky
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateFlowers();
  }

  function generateFlowers() {
    flowers = [];
    const count = Math.floor((canvas.width * canvas.height) / 50000); // ~25-30 flowers on a 1080p screen
    for (let i = 0; i < count; i++) {
      const baseOpacity = 0.03 + Math.random() * 0.06; // Very subtle: 0.03 to 0.09
      flowers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 3 + Math.random() * 6, // Small: 3-9px per pixel block
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        opacity: baseOpacity,
        baseOpacity,
        pulseSpeed: 0.3 + Math.random() * 0.7,
        pulseOffset: Math.random() * Math.PI * 2,
        type: Math.floor(Math.random() * 4),
      });
    }
  }

  function drawPixelFlower(f: PixelFlower, time: number) {
    const pulse = Math.sin(time * f.pulseSpeed + f.pulseOffset) * 0.3 + 0.7;
    const alpha = f.baseOpacity * pulse;
    const color = f.color.replace('VAR', alpha.toFixed(3));
    const s = f.size; // pixel block size

    ctx.fillStyle = color;

    if (f.type === 0) {
      // Cross/plus flower (5 blocks)
      ctx.fillRect(f.x, f.y - s, s, s);     // top
      ctx.fillRect(f.x - s, f.y, s, s);     // left
      ctx.fillRect(f.x, f.y, s, s);         // center
      ctx.fillRect(f.x + s, f.y, s, s);     // right
      ctx.fillRect(f.x, f.y + s, s, s);     // bottom
    } else if (f.type === 1) {
      // Diamond flower (5 blocks)
      ctx.fillRect(f.x, f.y - s, s, s);
      ctx.fillRect(f.x - s, f.y, s, s);
      ctx.fillRect(f.x + s, f.y, s, s);
      ctx.fillRect(f.x, f.y + s, s, s);
      // center dot
      const centerAlpha = alpha * 1.5;
      ctx.fillStyle = f.color.replace('VAR', Math.min(centerAlpha, 0.15).toFixed(3));
      ctx.fillRect(f.x, f.y, s, s);
    } else if (f.type === 2) {
      // Small 3x3 with corners (X shape)
      ctx.fillRect(f.x - s, f.y - s, s, s);
      ctx.fillRect(f.x + s, f.y - s, s, s);
      ctx.fillRect(f.x, f.y, s, s);
      ctx.fillRect(f.x - s, f.y + s, s, s);
      ctx.fillRect(f.x + s, f.y + s, s, s);
    } else {
      // Single pixel dot with halo
      ctx.fillRect(f.x, f.y, s, s);
      const haloAlpha = alpha * 0.4;
      ctx.fillStyle = f.color.replace('VAR', haloAlpha.toFixed(3));
      ctx.fillRect(f.x - s, f.y, s, s);
      ctx.fillRect(f.x + s, f.y, s, s);
      ctx.fillRect(f.x, f.y - s, s, s);
      ctx.fillRect(f.x, f.y + s, s, s);
    }
  }

  let time = 0;
  function animate() {
    time += 0.01;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flowers.forEach(f => drawPixelFlower(f, time));
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animate();
}

// ============================================
// FALLING PETALS ANIMATION
// ============================================
function initFallingPetals(): void {
  const canvas = document.getElementById('petalsCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  let petals: Petal[] = [];
  const petalCount = 15;
  const petalColors = [
    'rgba(196, 135, 138, 0.35)',
    'rgba(232, 180, 182, 0.3)',
    'rgba(137, 180, 216, 0.3)',
    'rgba(181, 212, 236, 0.25)',
    'rgba(168, 184, 156, 0.25)',
    'rgba(196, 168, 124, 0.25)',
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createPetal(): Petal {
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      size: 4 + Math.random() * 7,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: 0.3 + Math.random() * 0.5,
      opacity: 0.15 + Math.random() * 0.3,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      type: Math.floor(Math.random() * 3),
    };
  }

  function drawPetal(petal: Petal) {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.globalAlpha = petal.opacity;

    if (petal.type === 0) {
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = petal.color;
      ctx.fill();
    } else if (petal.type === 1) {
      ctx.beginPath();
      ctx.moveTo(0, -petal.size);
      ctx.quadraticCurveTo(petal.size * 0.8, 0, 0, petal.size * 0.6);
      ctx.quadraticCurveTo(-petal.size * 0.8, 0, 0, -petal.size);
      ctx.fillStyle = petal.color;
      ctx.fill();
    } else {
      const points = 5;
      const outerR = petal.size * 0.5;
      const innerR = petal.size * 0.25;
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = petal.color;
      ctx.fill();
    }

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    while (petals.length < petalCount) {
      petals.push(createPetal());
    }

    petals.forEach((petal, index) => {
      petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.2;
      petal.y += petal.speedY;
      petal.rotation += petal.rotationSpeed;
      petal.speedX += (Math.random() - 0.5) * 0.01;

      drawPetal(petal);

      if (petal.y > canvas.height + 20 || petal.x < -20 || petal.x > canvas.width + 20) {
        petals[index] = createPetal();
      }
    });

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animate();
}

// ============================================
// CUSTOM CURSOR
// ============================================
function initCursor(): void {
  if ('ontouchstart' in window) return;

  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
  });

  setTimeout(() => {
    cursorFollower.classList.add('active');
    cursorDot.classList.add('active');
  }, 100);

  const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], .project-card, .journal-item');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorFollower.classList.add('hovering');
      cursorDot.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursorFollower.classList.remove('hovering');
      cursorDot.classList.remove('hovering');
    });
  });

  function animateCursor() {
    const dx = mousePos.x - cursorPos.x;
    const dy = mousePos.y - cursorPos.y;
    cursorPos.x += dx * 0.12;
    cursorPos.y += dy * 0.12;
    cursorFollower.style.left = `${cursorPos.x}px`;
    cursorFollower.style.top = `${cursorPos.y}px`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

// ============================================
// MAGNETIC BUTTONS
// ============================================
function initMagneticButtons(): void {
  if ('ontouchstart' in window) return;

  const magneticElements = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations(): void {
  const animatedElements = document.querySelectorAll('[data-animate], .project-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const siblings = Array.from(el.parentElement?.children || []);
          const index = siblings.indexOf(el);
          const delay = index * 100;
          setTimeout(() => { el.classList.add('revealed'); }, delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

// ============================================
// HERO REVEAL
// ============================================
function revealHero(): void {
  const titleLine = document.querySelector('.title-line') as HTMLElement;
  const subtitle = document.querySelector('.hero-subtitle') as HTMLElement;
  const tagline = document.querySelector('.hero-tagline') as HTMLElement;
  const ctaGroup = document.querySelector('.hero-cta-group') as HTMLElement;

  setTimeout(() => titleLine?.classList.add('revealed'), 200);
  setTimeout(() => subtitle?.classList.add('revealed'), 600);
  setTimeout(() => tagline?.classList.add('revealed'), 800);
  setTimeout(() => ctaGroup?.classList.add('revealed'), 1000);
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = parseInt(el.getAttribute('data-count') || '0', 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(el: HTMLElement, target: number): void {
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);
    el.textContent = Math.round(target * eased).toString();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation(): void {
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link, .nav-contact');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.replace('#', '');
      const targetSection = document.getElementById(targetId || '');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  function updateActiveLink() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function initScrollProgress(): void {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${scrollPercent}%`;
  }, { passive: true });
}

// ============================================
// NAV REVEAL
// ============================================
function initNavReveal(): void {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      bottomNav.classList.add('visible');
    } else {
      bottomNav.classList.remove('visible');
    }
  }, { passive: true });

  setTimeout(() => { bottomNav.classList.add('visible'); }, 3200);
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu(): void {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('mobileMenuOverlay');
  if (!menuBtn || !overlay) return;

  function openMenu() {
    menuBtn!.classList.add('open');
    overlay!.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuBtn!.classList.remove('open');
    overlay!.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when clicking a link
  const mobileLinks = overlay.querySelectorAll<HTMLAnchorElement>('.mobile-nav-link');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.replace('#', '');
      closeMenu();
      setTimeout(() => {
        const targetSection = document.getElementById(targetId || '');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
    });
  });

  // Close on background click
  const bg = overlay.querySelector('.mobile-menu-bg');
  bg?.addEventListener('click', closeMenu);
}

// ============================================
// TEXT SCRAMBLE EFFECT
// ============================================
function textScramble(element: HTMLElement, finalText: string): void {
  const chars = '!@#$%^&*()_+{}|:<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ🌸🌺🌷✿🌿';
  let iteration = 0;

  const interval = setInterval(() => {
    element.textContent = finalText
      .split('')
      .map((_letter, index) => {
        if (index < iteration) return finalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    if (iteration >= finalText.length) clearInterval(interval);
    iteration += 1 / 2;
  }, 40);
}

// ============================================
// INITIALIZE
// ============================================
async function init(): Promise<void> {
  // 1. Run loader
  await initLoader();

  // 2. Show main content
  mainContent.classList.add('visible');

  // 3. Reveal hero
  revealHero();

  // 4. Scramble subtitle
  const subtitle = document.querySelector('.hero-subtitle') as HTMLElement;
  if (subtitle) {
    setTimeout(() => {
      textScramble(subtitle, currentLang === 'fr'
        ? 'CASQUETTES & TAPIS ARTISANAUX • FRANCE'
        : 'HANDCRAFTED CAPS & RUGS • FRANCE'
      );
    }, 800);
  }

  // 5. Init everything
  initLanguageToggle();
  initCursor();
  initMagneticButtons();
  initScrollAnimations();
  initCounters();
  initNavigation();
  initScrollProgress();
  initNavReveal();
  initMobileMenu();
  initPixelFlowers();
  initFallingPetals();
  init3DViewer();
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
