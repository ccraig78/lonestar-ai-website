import * as THREE from 'https://esm.sh/three@0.164.1';
import { OrbitControls } from 'https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';

const mount = document.querySelector('[data-logo-viewer]');

if (mount) {
  const canvas = mount.querySelector('canvas');
  const status = mount.querySelector('[data-logo-status]');
  const fallback = mount.querySelector('[data-logo-fallback]');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  camera.position.set(0, 0.6, 5.6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x102040, 1.45));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);

  const redRim = new THREE.PointLight(0xe3343f, 2.4, 12);
  redRim.position.set(-3.5, 2.5, 3.5);
  scene.add(redRim);

  const blueRim = new THREE.PointLight(0x1669d8, 2.35, 12);
  blueRim.position.set(3.8, -1.5, 3.8);
  scene.add(blueRim);

  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.72;
  controls.autoRotate = false;

  let userRotated = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;

  const stopAutoRotation = () => {
    userRotated = true;
    mount.classList.add('is-paused');
  };

  renderer.domElement.addEventListener('pointerdown', (event) => {
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  window.addEventListener('pointerup', () => {
    dragging = false;
  });

  renderer.domElement.addEventListener('pointermove', (event) => {
    if (!dragging || userRotated) return;
    const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
    if (moved > 6) stopAutoRotation();
  });

  const resize = () => {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(320, rect.width);
    const height = Math.max(320, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const setLoaded = () => {
    mount.classList.add('is-loaded');
    if (status) status.textContent = 'Drag to rotate';
    if (fallback) fallback.hidden = true;
  };

  const loader = new GLTFLoader();
  loader.load(
    'assets/models/lonestar-logo.glb',
    (gltf) => {
      const object = gltf.scene;

      object.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = false;
        child.receiveShadow = false;
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            material.side = THREE.DoubleSide;
            if ('metalness' in material) material.metalness = Math.min(material.metalness ?? 0.25, 0.38);
            if ('roughness' in material) material.roughness = Math.max(material.roughness ?? 0.42, 0.34);
          });
        }
      });

      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;

      object.position.sub(center);
      object.scale.setScalar(3.15 / maxAxis);
      object.rotation.x = -0.16;
      object.rotation.y = -0.38;

      modelGroup.add(object);
      setLoaded();
    },
    undefined,
    (error) => {
      console.error('Could not load LoneStar 3D logo model:', error);
      mount.classList.add('has-error');
      if (status) status.textContent = '3D logo unavailable';
    }
  );

  const animate = () => {
    requestAnimationFrame(animate);
    if (!userRotated) {
      modelGroup.rotation.y += 0.0045;
      modelGroup.rotation.x = Math.sin(performance.now() * 0.00055) * 0.045;
    }
    controls.update();
    renderer.render(scene, camera);
  };

  resize();
  window.addEventListener('resize', resize);
  animate();
}
