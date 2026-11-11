"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Colibri en three.js qui survole la section parente (le hero).
 * - Vol libre : il file d'un point à l'autre puis fait du sur-place.
 * - Quand le curseur s'arrête dans la section, il s'approche et reste en vol stationnaire,
 *   le bec tourné vers le curseur ; dès que le curseur repart, il reprend son vol.
 *
 * Source : colibri.glb (une image sur un plan, sans animation ; rangé dans sources-images/modeles-3d).
 * Son image a été découpée en deux calques :
 * /images/colibri-3d-corps.webp et /images/colibri-3d-aile.webp. L'aile tourne en 3D autour de sa
 * racine (charnière) avec une caméra en perspective → vrai battement en raccourci ; demi-tour en 3D.
 */
const BODY = "/images/colibri-3d-corps.webp";
const WING = "/images/colibri-3d-aile.webp";
const RATIO = 1.3959; // largeur / hauteur de l'image
// charnière de l'aile (coordonnées de texture, y vers le bas)
const H1 = [0.5079, 0.3176];
const H2 = [0.4233, 0.517];
const FLAP_HZ = 11; // battements par seconde
const VIEW = 1.64; // taille visible du canevas (unités de scène) → le colibri occupe ~85 % de la largeur

export default function Hummingbird() {
  const birdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bird = birdRef.current;
    const zone = bird?.parentElement;
    if (!bird || !zone) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- scène ----------
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    bird.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const fov = 30;
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 50);
    camera.position.set(0, 0, VIEW / 2 / Math.tan(((fov / 2) * Math.PI) / 180));
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group(); // demi-tour (rotation Y)
    const tiltG = new THREE.Group(); // inclinaison (rotation Z)
    root.add(tiltG);
    scene.add(root);

    const h = 1;
    const w = RATIO * h;
    const toPlane = (uv: number[]) => new THREE.Vector3((uv[0] - 0.5) * w, (0.5 - uv[1]) * h, 0);
    const hinge = toPlane(H1);
    const axis = toPlane(H2).sub(hinge).normalize();

    const loader = new THREE.TextureLoader();
    const tex = (src: string) => {
      const t = loader.load(src, () => {
        loaded++;
        if (loaded === 2) bird.dataset.ready = "";
      });
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };
    let loaded = 0;
    const mat = (src: string) =>
      new THREE.MeshBasicMaterial({ map: tex(src), transparent: true, side: THREE.DoubleSide, depthTest: false, depthWrite: false });

    const bodyMat = mat(BODY);
    const body = new THREE.Mesh(new THREE.PlaneGeometry(w, h), bodyMat);
    body.renderOrder = 1;
    tiltG.add(body);

    // l'aile : même plan, décalé pour que la charnière soit à l'origine de son groupe
    const wingMat = mat(WING);
    const wingGeo = new THREE.PlaneGeometry(w, h);
    wingGeo.translate(-hinge.x, -hinge.y, 0);
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.renderOrder = 2;
    const wingPivot = new THREE.Group();
    wingPivot.position.copy(hinge);
    wingPivot.add(wing);
    tiltG.add(wingPivot);
    const q = new THREE.Quaternion();

    let side = 0;
    const fit = () => {
      side = bird.offsetWidth;
      renderer.setSize(side, side, false);
    };
    fit();

    // ---------- vol ----------
    let W = zone.clientWidth;
    let H = zone.clientHeight;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    let x = -120;
    let y = H * 0.3;
    let vx = 0;
    let vy = 0;
    let face = 1; // 1 = regarde à droite, -1 = à gauche (lissé → demi-tour en 3D)
    let wayX = W * 0.28;
    let wayY = H * 0.42;
    let nextWay = 0;

    let cx = 0;
    let cy = 0;
    let inside = false;
    let lastMove = 0;
    const IDLE = 350; // ms sans bouger = curseur « arrêté »

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = zone.getBoundingClientRect();
      cx = e.clientX - r.left;
      cy = e.clientY - r.top;
      inside = true;
      lastMove = performance.now();
    };
    const onLeave = () => {
      inside = false;
    };
    const onResize = () => {
      W = zone.clientWidth;
      H = zone.clientHeight;
      fit();
    };
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", onLeave);
    addEventListener("resize", onResize);

    const render = (t: number, tilt: number, flap: boolean) => {
      // battement : l'aile pivote autour de sa racine, vers le spectateur puis vers l'arrière
      const ph = flap ? Math.sin(t * Math.PI * 2 * FLAP_HZ) : 0.3;
      const ang = THREE.MathUtils.degToRad(22 + ph * 48); // -26° ↔ 70°
      q.setFromAxisAngle(axis, ang);
      wingPivot.quaternion.copy(q);
      wingPivot.rotation.z += THREE.MathUtils.degToRad(ph * -6); // léger balayage avant / arrière
      // l'aile s'assombrit quand elle est de biais (lumière)
      const shade = 0.72 + 0.28 * Math.abs(Math.cos(ang));
      wingMat.color.setScalar(shade);
      root.rotation.y = ((1 - face) * Math.PI) / 2;
      tiltG.rotation.z = THREE.MathUtils.degToRad(-tilt);
      renderer.render(scene, camera);
    };

    let raf = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const near = inside && now - lastMove > IDLE;
      let tx: number;
      let ty: number;
      let k: number;
      let look: number;
      if (near) {
        // il se place à côté du curseur (du côté d'où il arrive) ; la pointe du bec
        // (≈ 42 % du canevas à droite du centre, 3 % plus haut) s'arrête à ~10 px du curseur
        const from = x <= cx ? -1 : 1;
        tx = cx + from * (side * 0.42 + 10);
        ty = cy + side * 0.03;
        k = 26;
        look = -from;
      } else {
        // vol libre : nouveau point toutes les 1,6 à 3,8 s
        if (now > nextWay) {
          wayX = rand(W * 0.08, W * 0.92);
          wayY = rand(H * 0.12, H * 0.68);
          nextWay = now + rand(1600, 3800);
        }
        tx = wayX;
        ty = wayY;
        k = 9;
        look = Math.abs(tx - x) > 6 ? Math.sign(tx - x) : Math.sign(face) || 1;
      }

      // ressort amorti
      const c = 2 * Math.sqrt(k) * 0.85;
      vx += ((tx - x) * k - vx * c) * dt;
      vy += ((ty - y) * k - vy * c) * dt;
      x += vx * dt;
      y += vy * dt;

      face += (look - face) * Math.min(1, dt * 9);
      const speed = Math.hypot(vx, vy);
      // en vitesse il se couche vers l'avant ; en sur-place il se redresse légèrement
      const tilt = Math.min(25, speed * 0.04) + Math.max(-10, Math.min(10, vy * 0.03)) - 4;
      const bob = Math.sin(now / 170) * 2.5 + Math.sin(now / 620) * 2;
      bird.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + bob).toFixed(1)}px, 0)`;
      render(now / 1000, tilt, true);
    };

    let io: IntersectionObserver | null = null;
    if (reduce) {
      x = W * 0.3;
      y = H * 0.4;
      bird.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const once = () => render(0, 0, false);
      setTimeout(once, 300);
      setTimeout(once, 1500);
    } else {
      // ne tourne que lorsque la section est à l'écran
      io = new IntersectionObserver(([e]) => {
        cancelAnimationFrame(raf);
        if (e.isIntersecting) {
          prev = performance.now();
          raf = requestAnimationFrame(tick);
        }
      });
      io.observe(zone);
    }

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", onResize);
      bodyMat.map?.dispose();
      wingMat.map?.dispose();
      bodyMat.dispose();
      wingMat.dispose();
      body.geometry.dispose();
      wingGeo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="colibri" aria-hidden="true" ref={birdRef}></div>;
}
