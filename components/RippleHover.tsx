"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Effet « ondulation d'eau » au survol d'une image : la souris fait des ronds dans l'eau,
 * les vaguelettes s'élargissent, rebondissent sur les bords et s'éteignent.
 * Simulation de vagues sur le GPU (équation d'onde sur une grille de hauteurs, deux états en alternance),
 * puis l'image est lue à travers la surface : réfraction selon la pente des vagues + reflet de lumière.
 * Le <canvas> se pose au-dessus d'un <img> classique (même cadrage, object-fit: cover) ;
 * sans WebGL2 ou float, on garde l'image.
 */

const SIM = 256; // grille des vagues (côté court)
const DAMPING = 0.986; // amortissement par pas
const STEPS = 2; // pas de simulation par image
const SETTLE_S = 2.2; // arrêt du rendu après la dernière goutte
const RADIUS = 0.028; // taille d'une goutte (fraction de la hauteur)
const STRENGTH = 0.3; // force d'une goutte au survol
const REFRACTION = 0.012; // déplacement de l'image selon la pente
const SPECULAR = 0.35; // reflet de lumière sur les crêtes

const VERT = `#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() { vUv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 o;
`;

const FRAGS = {
  // r = hauteur actuelle, g = hauteur précédente
  wave:
    HEAD +
    `uniform sampler2D u_state; uniform vec2 u_texel; uniform float u_damping;
void main() {
  vec4 s = texture(u_state, vUv);
  float L = texture(u_state, vUv - vec2(u_texel.x, 0.0)).r;
  float R = texture(u_state, vUv + vec2(u_texel.x, 0.0)).r;
  float T = texture(u_state, vUv + vec2(0.0, u_texel.y)).r;
  float B = texture(u_state, vUv - vec2(0.0, u_texel.y)).r;
  float h = ((L + R + T + B) * 0.5 - s.g) * u_damping;
  o = vec4(h, s.r, 0.0, 1.0);
}`,
  drop:
    HEAD +
    `uniform sampler2D u_state; uniform vec2 u_point; uniform float u_radius; uniform float u_strength; uniform float u_aspect;
void main() {
  vec4 s = texture(u_state, vUv);
  vec2 p = vUv - u_point; p.x *= u_aspect;
  float d = max(0.0, 1.0 - length(p) / u_radius);
  d = 0.5 - cos(d * 3.14159265) * 0.5;
  s.r += d * u_strength;
  o = s;
}`,
  clear: HEAD + `void main() { o = vec4(0.0, 0.0, 0.0, 1.0); }`,
  display:
    HEAD +
    `uniform sampler2D u_state; uniform sampler2D u_image; uniform float u_imgAspect; uniform vec2 u_res;
uniform vec2 u_texel; uniform float u_refraction; uniform float u_specular;
void main() {
  float L = texture(u_state, vUv - vec2(u_texel.x, 0.0)).r;
  float R = texture(u_state, vUv + vec2(u_texel.x, 0.0)).r;
  float T = texture(u_state, vUv + vec2(0.0, u_texel.y)).r;
  float B = texture(u_state, vUv - vec2(0.0, u_texel.y)).r;
  vec2 slope = vec2(R - L, T - B);
  vec3 n = normalize(vec3(-slope * 6.0, 1.0));
  float a = u_res.x / u_res.y;
  vec2 s = a > u_imgAspect ? vec2(1.0, u_imgAspect / a) : vec2(a / u_imgAspect, 1.0);
  vec2 plain = (vUv - 0.5) * s;
  vec2 uv = (vUv + slope * u_refraction - 0.5) * s + 0.5;
  vec3 col = textureGrad(u_image, uv, dFdx(plain), dFdy(plain)).rgb;
  // reflet : lumière venant du haut à gauche
  vec3 light = normalize(vec3(-0.4, 0.6, 0.7));
  float spec = pow(max(dot(n, light), 0.0), 60.0) * u_specular * smoothstep(0.0, 0.02, length(slope));
  o = vec4(col + spec, 1.0);
}`,
};

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Prog = { prog: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
type Uniform = number | number[] | { tex: WebGLTexture };

export default function RippleHover({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const zone = canvas.parentElement;
    if (!zone) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl || !(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) return;

    let disposed = false;
    let raf = 0;
    let energy = 0;
    let aspect = 1.6;
    let image: { tex: WebGLTexture } | null = null;
    let imgAspect = 1;
    let a: Target, b: Target;
    const owned: { textures: WebGLTexture[]; fbos: WebGLFramebuffer[] } = { textures: [], fbos: [] };
    const P: Record<string, Prog> = {};
    const drops: { x: number; y: number; s: number }[] = [];

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
    const target = (w: number, h: number): Target => {
      const tex = gl.createTexture()!;
      const fbo = gl.createFramebuffer()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("target");
      owned.textures.push(tex);
      owned.fbos.push(fbo);
      return { tex, fbo, w, h };
    };
    const release = () => {
      owned.textures.forEach((t) => gl.deleteTexture(t));
      owned.fbos.forEach((f) => gl.deleteFramebuffer(f));
      owned.textures = [];
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
        else if (Array.isArray(v)) gl.uniform2f(loc, v[0], v[1]);
        else {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, v.tex);
          gl.uniform1i(loc, unit++);
        }
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fbo : null);
      gl.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const swap = () => {
      const t = a;
      a = b;
      b = t;
    };
    const allocate = () => {
      release();
      const w = aspect >= 1 ? Math.round(SIM * aspect) : SIM;
      const h = aspect >= 1 ? SIM : Math.round(SIM / aspect);
      a = target(w, h);
      b = target(w, h);
      run(P.clear, a, {});
      run(P.clear, b, {});
    };
    const texel = () => [1 / a.w, 1 / a.h];

    const display = () => {
      if (!image) return;
      run(P.display, null, {
        state: a,
        image,
        imgAspect,
        res: [canvas.width, canvas.height],
        texel: texel(),
        refraction: REFRACTION,
        specular: SPECULAR,
      });
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      for (const d of drops.splice(0)) {
        run(P.drop, b, { state: a, point: [d.x, d.y], radius: RADIUS, strength: d.s, aspect });
        swap();
        energy = now;
      }
      for (let i = 0; i < STEPS; i++) {
        run(P.wave, b, { state: a, texel: texel(), damping: DAMPING });
        swap();
      }
      display();
      if (now - energy < SETTLE_S * 1000) raf = requestAnimationFrame(frame);
      else {
        // l'eau est calme : surface remise à plat, on arrête de dessiner
        run(P.clear, a, {});
        run(P.clear, b, {});
        display();
      }
    };
    const kick = () => {
      if (!raf && !disposed && image) raf = requestAnimationFrame(frame);
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
      const ar = w / h;
      if (!a || Math.abs(ar - aspect) / aspect > 0.02) {
        aspect = ar;
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

    let imgTex: WebGLTexture | null = null;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      imgTex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, imgTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      image = { tex: imgTex };
      imgAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
      resize();
      canvas.dataset.ready = "";
    };
    img.src = src;

    // gouttes le long du trajet de la souris (espacées, pour des ronds nets) ; un clic = grosse goutte
    let prev: { x: number; y: number } | null = null;
    const point = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    };
    const onMove = (e: PointerEvent) => {
      const p = point(e);
      if (!prev) {
        prev = p;
        return;
      }
      const dist = Math.hypot((p.x - prev.x) * aspect, p.y - prev.y);
      if (dist < RADIUS * 0.6) return;
      const n = Math.min(4, Math.ceil(dist / (RADIUS * 1.2)));
      for (let i = 1; i <= n; i++) {
        drops.push({ x: prev.x + ((p.x - prev.x) * i) / n, y: prev.y + ((p.y - prev.y) * i) / n, s: STRENGTH / n });
      }
      prev = p;
      kick();
    };
    const onDown = (e: PointerEvent) => {
      const p = point(e);
      drops.push({ ...p, s: STRENGTH * 2.5 });
      kick();
    };
    const onLeave = () => (prev = null);
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerdown", onDown);
    zone.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerdown", onDown);
      zone.removeEventListener("pointerleave", onLeave);
      release();
      if (imgTex) gl.deleteTexture(imgTex);
      Object.values(P).forEach((p) => gl.deleteProgram(p.prog));
    };
  }, [src]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
