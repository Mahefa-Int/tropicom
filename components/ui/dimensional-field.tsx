"use client";

/**
 * Dimensional Field — fond animé WebGL (d'après le composant 21st.dev « dimensional-field »),
 * réécrit en composant React natif aux couleurs Tropi'Com :
 *  - nappe de lumière ondulante (bruit simplex) bleu canard → rose magenta sur fond noir ;
 *  - sphères « en verre » qui flottent et réagissent à la souris ;
 *  - grille fine en diagonale + grain cinéma par-dessus.
 * Pas d'iframe ni de scripts externes : three.js est installé dans le projet.
 * L'animation se met en pause quand le fond n'est pas à l'écran.
 */

import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";

export type DimensionalFieldProps = {
  /** Couleurs de la lumière (CSS hex). Par défaut : bleu canard et rose magenta de la charte. */
  color1?: string;
  color2?: string;
  /** Intensité de l'effet (0 = invisible, 1 = pleine force). */
  intensity?: number;
  /** Affiche la grille fine en diagonale par-dessus. */
  grid?: boolean;
  className?: string;
  style?: CSSProperties;
};

const SNOISE = /* glsl */ `
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ; m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

/* grain : bruit SVG (comme l'original) */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function DimensionalField({
  color1 = "#3e9d9e",
  color2 = "#de0b7d",
  intensity = 1,
  grid = true,
  className,
  style,
}: DimensionalFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return; // pas de WebGL : on garde le fond noir
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 12;

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_color1: { value: new THREE.Color(color1) },
      u_color2: { value: new THREE.Color(color2) },
    };

    // nappe de lumière en fond
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        ${SNOISE}
        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.x *= u_resolution.x / u_resolution.y;
          vec3 baseColor = vec3(0.0, 0.0, 0.0);
          vec2 st = uv * 0.5;
          st += vec2(snoise(st + u_time * 0.04), snoise(st - u_time * 0.04)) * 0.4;
          float beam = smoothstep(0.2, 0.9, snoise(vec2(st.x + st.y * 2.0 - u_time * 0.1, u_time * 0.03)));
          vec3 glow = mix(u_color1, u_color2, snoise(uv * 2.0 + u_time * 0.15) * 0.5 + 0.5);
          float dist = distance(gl_FragCoord.xy / u_resolution.xy, vec2(0.5));
          float vignette = smoothstep(1.5, 0.1, dist);
          vec3 colorGlow = mix(baseColor, glow, beam * 0.5);
          gl_FragColor = vec4(mix(vec3(0.0), colorGlow, vignette), 1.0);
        }
      `,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });
    const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
    bgMesh.position.z = -15;
    scene.add(bgMesh);

    // sphères en verre
    const glassMaterial = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        varying vec3 vNormal;
        ${SNOISE}
        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv += vNormal.xy * 0.2;
          uv.x *= u_resolution.x / u_resolution.y;
          vec3 baseColor = vec3(0.03, 0.03, 0.03);
          vec2 st = uv * 0.6;
          st += vec2(snoise(st + u_time * 0.06), snoise(st - u_time * 0.06)) * 0.35;
          float beam = smoothstep(0.1, 0.9, snoise(vec2(st.x + st.y * 1.8 - u_time * 0.12, u_time * 0.02)));
          vec3 glow = mix(u_color1, u_color2, snoise(uv * 1.8 + u_time * 0.12) * 0.5 + 0.5);
          float fresnel = pow(clamp(1.0 - dot(vec3(0.0, 0.0, 1.0), vNormal), 0.0, 1.0), 2.5);
          vec3 finalColor = mix(baseColor, glow, clamp((beam * 0.5) + (fresnel * 0.8), 0.0, 1.0));
          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
      uniforms,
      transparent: true,
    });
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    // positions réparties sur la hauteur du bloc (les pastilles sont au centre) :
    // grande bulle à gauche, petite bulle en haut à droite
    const sphereData = [
      { scale: 3.6, x: -7.0, y: -2.0, z: -1.5, speed: 0.002 },
      { scale: 1.3, x: 4.6, y: 3.6, z: 2.5, speed: 0.004 },
      { scale: 0.6, x: -4.5, y: 5.2, z: 4.0, speed: 0.008 },
    ];
    const spheres = sphereData.map((d) => {
      const mesh = new THREE.Mesh(sphereGeo, glassMaterial);
      mesh.scale.setScalar(d.scale);
      mesh.position.set(d.x, d.y, d.z);
      scene.add(mesh);
      return { mesh, baseY: d.y, speed: d.speed, offset: Math.random() * Math.PI * 2 };
    });

    // taille = celle du bloc (pas de la fenêtre)
    const resize = () => {
      const w = Math.max(1, wrap.clientWidth);
      const h = Math.max(1, wrap.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const dist = camera.position.z - bgMesh.position.z;
      const planeH = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
      bgMesh.scale.set((planeH * camera.aspect) / 2, planeH / 2, 1);
      const pr = renderer.getPixelRatio();
      uniforms.u_resolution.value.set(w * pr, h * pr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // la souris fait bouger légèrement la caméra
    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      mouseX = e.clientX - (r.left + r.width / 2);
      mouseY = e.clientY - (r.top + r.height / 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // pause hors écran
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(animate);
    });
    io.observe(wrap);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = 0;
      const t = reduce ? 8 : clock.getElapsedTime();
      uniforms.u_time.value = t;
      camera.position.x += (mouseX * 0.004 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.004 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      spheres.forEach((s) => {
        s.mesh.position.y = s.baseY + Math.sin(t * s.speed * 120 + s.offset) * 0.5;
        s.mesh.rotation.x = t * s.speed * 18;
        s.mesh.rotation.y = t * s.speed * 24;
      });
      renderer.render(scene, camera);
      if (visible && !reduce) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      sphereGeo.dispose();
      bgMesh.geometry.dispose();
      bgMaterial.dispose();
      glassMaterial.dispose();
      renderer.dispose();
    };
  }, [color1, color2]);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", overflow: "hidden", background: "#000", ...style }} aria-hidden="true">
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: intensity }} />
      {/* grille fine en diagonale */}
      {grid && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06 * intensity,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.8) 0, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 56px)",
        }}
      />
      )}
      {/* grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.15 * intensity, mixBlendMode: "overlay", backgroundImage: GRAIN }} />
    </div>
  );
}
