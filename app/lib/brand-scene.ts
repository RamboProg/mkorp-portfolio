export type BrandMotion = "spin" | "sway" | "none";

export type BrandSceneOptions = {
  src: string;
  motion: BrandMotion;
  tilt: boolean;
};

export type DisposeScene = () => void;

const FOV = 32;
const MAX_DPR = 2;

/**
 * Mounts a three.js canvas into `host`, loads a GLB brand model and animates it.
 * three is imported dynamically so it never lands in the main bundle.
 * Lighting mirrors the Claude Design `three-d-stage.js` studio setup.
 */
export async function mountBrandScene(host: HTMLElement, { src, motion, tilt }: BrandSceneOptions): Promise<DisposeScene> {
  const [THREE, { GLTFLoader }] = await Promise.all([import("three"), import("three/examples/jsm/loaders/GLTFLoader.js")]);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.001, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 7, 5);
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
  fill.position.set(-5, 3, -4);
  scene.add(key, fill);

  let model: InstanceType<typeof THREE.Group>;
  try {
    model = (await new GLTFLoader().loadAsync(src)).scene;
  } catch (err) {
    renderer.dispose();
    canvas.remove();
    throw new Error(`Failed to load brand model ${src}`, { cause: err });
  }
  const box = new THREE.Box3().setFromObject(model);
  model.position.sub(box.getCenter(new THREE.Vector3()));
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);

  const viewDir = new THREE.Vector3(0, 0.3, 1).normalize();
  const frame = (): void => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Fit the bounding sphere to whichever axis is tighter.
    const vHalf = (FOV * Math.PI) / 360;
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const dist = (radius / Math.sin(Math.min(vHalf, hHalf))) * 1.02;
    camera.position.copy(viewDir).multiplyScalar(dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  frame();

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (e: PointerEvent): void => {
    const r = host.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
  };
  const animate = !reduceMotion && (motion !== "none" || tilt);
  if (animate && tilt) window.addEventListener("pointermove", onPointerMove, { passive: true });

  const clock = new THREE.Clock();
  let spin = 0;
  let tiltX = 0;
  let tiltY = 0;
  const loop = (): void => {
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    if (motion === "spin") spin += dt * 0.7;
    if (motion === "sway") spin = Math.sin(t * 0.6) * 0.35;
    if (tilt) {
      tiltX += (pointer.y * 0.18 - tiltX) * 0.06;
      tiltY += (pointer.x * 0.35 - tiltY) * 0.06;
    }
    pivot.rotation.set(tiltX, spin + tiltY, 0);
    if (motion === "sway") pivot.position.y = Math.sin(t * 1.2) * radius * 0.03;
    renderer.render(scene, camera);
  };
  const renderOnce = (): void => renderer.render(scene, camera);

  const resizeObserver = new ResizeObserver(() => {
    frame();
    if (!animate) renderOnce();
  });
  resizeObserver.observe(host);

  // Only burn GPU while the model is on screen.
  const visibility = new IntersectionObserver(([entry]) => {
    if (!animate) return;
    if (entry?.isIntersecting) {
      clock.getDelta();
      renderer.setAnimationLoop(loop);
    } else {
      renderer.setAnimationLoop(null);
    }
  });
  visibility.observe(host);
  renderOnce();

  return () => {
    renderer.setAnimationLoop(null);
    visibility.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    model.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.geometry.dispose();
      const materials: unknown[] = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of materials) if (m instanceof THREE.Material) m.dispose();
    });
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
