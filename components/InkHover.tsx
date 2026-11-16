"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Effet « encre dans l'eau » au survol d'une image (tiré de l'Ink Flow Carousel, sans le carrousel) :
 * la souris remue la photo comme de la peinture fraîche, puis elle se repose.
 * Vraie simulation de fluide sur le GPU (stable fluids + confinement de vorticité + projection de pression).
 * Elle déplace une *carte de coordonnées* : chaque pixel se souvient d'où vient sa peinture, et cette carte
 * est ramenée vers sa place, ce qui fait reposer l'image.
 * Le <canvas> se place au-dessus d'un <img> classique (même cadrage, object-fit: cover) : sans WebGL2 ou
 * float, on garde simplement l'image. Le parent doit recevoir les événements souris (prop `area`).
 */

const SIM = 128; // grille de vitesse (côté court)
const DYE = 512; // grille de la carte de coordonnées
const PRESSURE_ITERATIONS = 16;
const CURL = 16;
const RELAX = 4.5; // vitesse de retour de la peinture (remise en place en 1 à 2 s)
const DISSIPATION = 3.5; // l'eau s'arrête
const VISCOSITY = 9;
const SETTLE_S = 1.8; // arrêt du rendu après le dernier mouvement
const STIR = 1500;
const STIR_RADIUS = 0.0026;

const VERT = `#version 300 es
in vec2 a_position;
uniform vec2 u_texel;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
void main() {
  vUv = a_position * 0.5 + 0.5;
  vL = vUv - vec2(u_texel.x, 0.0); vR = vUv + vec2(u_texel.x, 0.0);
  vT = vUv + vec2(0.0, u_texel.y); vB = vUv - vec2(0.0, u_texel.y);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 o;
`;
const NB = "in vec2 vL;\nin vec2 vR;\nin vec2 vT;\nin vec2 vB;\n";

const FRAGS = {
  splat:
    HEAD +
    `uniform sampler2D u_target; uniform float u_aspect; uniform vec3 u_value; uniform vec2 u_point; uniform float u_radius;
void main() {
  vec2 p = vUv - u_point; p.x *= u_aspect;
  o = vec4(texture(u_target, vUv).xyz + exp(-dot(p, p) / u_radius) * u_value, 1.0);
}`,
  advect:
    HEAD +
    `uniform sampler2D u_velocity; uniform sampler2D u_source; uniform vec2 u_simTexel; uniform float u_dt; uniform float u_dissipation;
void main() {
  vec2 back = vUv - u_dt * texture(u_velocity, vUv).xy * u_simTexel;
  o = texture(u_source, back) / (1.0 + u_dissipation * u_dt);
}`,
  relax:
    HEAD +
    NB +
    `uniform sampler2D u_velocity; uniform sampler2D u_source; uniform vec2 u_simTexel; uniform float u_dt; uniform float u_relax; uniform float u_viscosity;
void main() {
  vec2 back = vUv - u_dt * texture(u_velocity, vUv).xy * u_simTexel;
  vec2 d = texture(u_source, back).xy - vUv;
  vec2 around = 0.25 * (
    texture(u_source, back + vL - vUv).xy - vL + texture(u_source, back + vR - vUv).xy - vR +
    texture(u_source, back + vT - vUv).xy - vT + texture(u_source, back + vB - vUv).xy - vB);
  d = mix(d, around, 1.0 - exp(-u_viscosity * u_dt));
  o = vec4(vUv + d * exp(-u_relax * u_dt), 0.0, 1.0);
}`,
  identity: HEAD + `void main() { o = vec4(vUv, 0.0, 1.0); }`,
  scale: HEAD + `uniform sampler2D u_source; uniform float u_value; void main() { o = texture(u_source, vUv) * u_value; }`,
  curl:
    HEAD +
    NB +
    `uniform sampler2D u_velocity;
void main() {
  float L = texture(u_velocity, vL).y; float R = texture(u_velocity, vR).y;
  float T = texture(u_velocity, vT).x; float B = texture(u_velocity, vB).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
  vorticity:
    HEAD +
    NB +
    `uniform sampler2D u_velocity; uniform sampler2D u_curl; uniform float u_strength; uniform float u_dt;
void main() {
  float L = texture(u_curl, vL).x; float R = texture(u_curl, vR).x;
  float T = texture(u_curl, vT).x; float B = texture(u_curl, vB).x; float C = texture(u_curl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001; force *= u_strength * C; force.y *= -1.0;
  o = vec4(clamp(texture(u_velocity, vUv).xy + force * u_dt, -1000.0, 1000.0), 0.0, 1.0);
}`,
  divergence:
    HEAD +
    NB +
    `uniform sampler2D u_velocity;
void main() {
  vec2 C = texture(u_velocity, vUv).xy;
  float L = vL.x < 0.0 ? -C.x : texture(u_velocity, vL).x;
  float R = vR.x > 1.0 ? -C.x : texture(u_velocity, vR).x;
  float T = vT.y > 1.0 ? -C.y : texture(u_velocity, vT).y;
  float B = vB.y < 0.0 ? -C.y : texture(u_velocity, vB).y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
  pressure:
    HEAD +
    NB +
    `uniform sampler2D u_pressure; uniform sampler2D u_divergence;
void main() {
  float L = texture(u_pressure, vL).x; float R = texture(u_pressure, vR).x;
  float T = texture(u_pressure, vT).x; float B = texture(u_pressure, vB).x;
  o = vec4((L + R + B + T - texture(u_divergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient:
    HEAD +
    NB +
    `uniform sampler2D u_pressure; uniform sampler2D u_velocity;
void main() {
  float L = texture(u_pressure, vL).x; float R = texture(u_pressure, vR).x;
  float T = texture(u_pressure, vT).x; float B = texture(u_pressure, vB).x;
  o = vec4(texture(u_velocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
}`,
  // image en object-fit: cover, lue à travers la carte de coordonnées
  display:
    HEAD +
    `uniform sampler2D u_map; uniform sampler2D u_image; uniform float u_imgAspect; uniform vec2 u_res;
void main() {
  vec2 uv = texture(u_map, vUv).xy;
  float a = u_res.x / u_res.y;
  vec2 s = a > u_imgAspect ? vec2(1.0, u_imgAspect / a) : vec2(a / u_imgAspect, 1.0);
  vec2 plain = (vUv - 0.5) * s;
  o = vec4(textureGrad(u_image, (uv - 0.5) * s + 0.5, dFdx(plain), dFdy(plain)).rgb, 1.0);
}`,
};

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Double = { read: Target; write: Target; swap: () => void };
type Prog = { prog: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
type Uniform = number | number[] | { tex: WebGLTexture };

export default function InkHover({
  src,
  className,
  area,
  stir = 1,
}: {
  src: string;
  className?: string;
  /** élément qui reçoit la souris (par défaut le parent du canvas) */
  area?: React.RefObject<HTMLElement | null>;
  stir?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const zone = area?.current ?? canvas.parentElement;
    if (!zone) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl || !(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) return;
    const precise = !!gl.getExtension("EXT_color_buffer_float") && !!gl.getExtension("OES_texture_float_linear");

    let disposed = false;
    let raf = 0;
    let last = 0;
    let energy = 0;
    let aspect = 1.6;
    let image: { tex: WebGLTexture } | null = null;
    let imgAspect = 1;
    const stirs: { x: number; y: number; dx: number; dy: number }[] = [];
    const owned: { textures: WebGLTexture[]; fbos: WebGLFramebuffer[] } = { textures: [], fbos: [] };
    const P: Record<string, Prog> = {};
    let vel: Double, pres: Double, map: Double, div: Target, curl: Target;

    const shader = (type: number, s: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader");
      return sh;
    };
    const program = (frag: string): Prog => {
      const prog = gl.createProgram()!;
      const v = shader(gl.VERTEX_SHADER, VERT);
      const f = shader(gl.FRAGMENT_SHADER, frag);
      gl.attachShader(prog, v);
      gl.attachShader(prog, f);
      gl.bindAttribLocation(prog, 0, "a_position");
      gl.linkProgram(prog);
      gl.deleteShader(v);
      gl.deleteShader(f);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
      const u: Prog["u"] = {};
      const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(prog, i);
        if (info) u[info.name.replace(/^u_/, "")] = gl.getUniformLocation(prog, info.name);
      }
      return { prog, u };
    };
    const target = (w: number, h: number, wide = false): Target => {
      const tex = gl.createTexture()!;
      const fbo = gl.createFramebuffer()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const full = wide && precise;
      gl.texImage2D(gl.TEXTURE_2D, 0, full ? gl.RGBA32F : gl.RGBA16F, w, h, 0, gl.RGBA, full ? gl.FLOAT : gl.HALF_FLOAT, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("target");
      owned.textures.push(tex);
      owned.fbos.push(fbo);
      return { tex, fbo, w, h };
    };
    const double = (w: number, h: number, wide = false): Double => {
      const d = { read: target(w, h, wide), write: target(w, h, wide), swap: () => {} };
      d.swap = () => {
        const t = d.read;
        d.read = d.write;
        d.write = t;
      };
      return d;
    };
    const release = () => {
      owned.textures.forEach((t) => t !== image?.tex && gl.deleteTexture(t));
      owned.fbos.forEach((f) => gl.deleteFramebuffer(f));
      owned.textures = image ? [image.tex] : [];
      owned.fbos = [];
    };
    const run = (p: Prog, dst: Target | null, u: Record<string, Uniform>) => {
      gl.useProgram(p.prog);
      let unit = 0;
      for (const k in u) {
        const loc = p.u[k];
        if (!loc) continue;
        const v = u[k];
        if (typeof v === "number") gl.uniform1f(loc, v);
        else if (Array.isArray(v)) {
          if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
          else gl.uniform3f(loc, v[0], v[1], v[2]);
        } else {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, v.tex);
          gl.uniform1i(loc, unit++);
        }
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fbo : null);
      gl.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const zero = (t: Target) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
    const texel = (t: Target) => [1 / t.w, 1 / t.h];
    const settle = () => {
      [vel.read, vel.write, pres.read, pres.write].forEach(zero);
      run(P.identity, map.read, {});
      run(P.identity, map.write, {});
    };
    const size = (short: number) => (aspect >= 1 ? [Math.round(short * aspect), short] : [short, Math.round(short / aspect)]);
    const allocate = () => {
      release();
      const [sw, sh] = size(SIM);
      const [dw, dh] = size(DYE);
      vel = double(sw, sh);
      pres = double(sw, sh);
      div = target(sw, sh);
      curl = target(sw, sh);
      map = double(dw, dh, true);
      settle();
    };

    const step = (dt: number) => {
      const st = texel(vel.read);
      run(P.curl, curl, { velocity: vel.read, texel: st });
      run(P.vorticity, vel.write, { velocity: vel.read, curl, strength: CURL, dt, texel: st });
      vel.swap();
      run(P.divergence, div, { velocity: vel.read, texel: st });
      run(P.scale, pres.write, { source: pres.read, value: 0.8, texel: st });
      pres.swap();
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        run(P.pressure, pres.write, { pressure: pres.read, divergence: div, texel: st });
        pres.swap();
      }
      run(P.gradient, vel.write, { pressure: pres.read, velocity: vel.read, texel: st });
      vel.swap();
      run(P.advect, vel.write, { velocity: vel.read, source: vel.read, simTexel: st, dt, dissipation: DISSIPATION, texel: st });
      vel.swap();
      run(P.relax, map.write, { velocity: vel.read, source: map.read, simTexel: st, dt, relax: RELAX, viscosity: VISCOSITY, texel: texel(map.read) });
      map.swap();
    };

    const display = () => {
      if (!image) return;
      run(P.display, null, { map: map.read, image, imgAspect, res: [canvas.width, canvas.height], texel: texel(map.read) });
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      for (const s of stirs.splice(0)) {
        run(P.splat, vel.write, { target: vel.read, point: [s.x, s.y], value: [s.dx * STIR * stir, s.dy * STIR * stir, 0], radius: STIR_RADIUS, aspect, texel: texel(vel.write) });
        vel.swap();
        energy = now;
      }
      step(dt);
      display();
      if (now - energy < SETTLE_S * 1000) raf = requestAnimationFrame(frame);
      else {
        // plus rien ne bouge : on remet l'image à plat et on arrête de dessiner
        settle();
        display();
      }
    };
    const kick = () => {
      if (raf || disposed || !image) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (!w || !h) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const a = w / h;
      if (!vel || Math.abs(a - aspect) / aspect > 0.02) {
        aspect = a;
        allocate();
      }
      display();
    };

    try {
      (Object.keys(FRAGS) as (keyof typeof FRAGS)[]).forEach((k) => (P[k] = program(FRAGS[k])));
      gl.bindVertexArray(gl.createVertexArray());
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      aspect = Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1);
      allocate();
    } catch {
      return;
    }

    const ro = new ResizeObserver(() => image && resize());
    ro.observe(canvas);

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      image = { tex };
      owned.textures.push(tex);
      imgAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
      resize();
      canvas.dataset.ready = "";
    };
    img.src = src;

    // la souris remue la peinture (survol ; au doigt, en glissant)
    let prev: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const p = { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
      if (prev && image) {
        stirs.push({ x: p.x, y: p.y, dx: p.x - prev.x, dy: p.y - prev.y });
        kick();
      }
      prev = p;
    };
    const onLeave = () => (prev = null);
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      image = null;
      release();
      Object.values(P).forEach((p) => gl.deleteProgram(p.prog));
    };
  }, [src, area, stir]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
