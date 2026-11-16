"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Effets WebGL au survol d'une image (page d'essai) :
 * - "lens"    : loupe liquide — une goutte transparente suit la souris, grossit et courbe l'image, reflet irisé au bord ;
 * - "scatter" : pixels qui se dispersent — l'image se défait en petits carrés autour de la souris puis se recompose ;
 * - "rgb"     : décalage RGB — les couleurs se séparent selon la vitesse de la souris ;
 * - "reveal"  : révélation couleur au pinceau — image en noir et blanc, la souris peint la couleur qui s'efface ensuite ;
 * - "wind"    : vent — l'image ondule doucement comme une toile, plus fort sous la souris.
 * Une « traînée » (texture qui garde la trace de la souris et s'estompe) pilote l'intensité locale.
 * Le <canvas> se pose au-dessus d'un <img> classique (même cadrage, object-fit: cover).
 */

export type HoverFxEffect = "lens" | "scatter" | "rgb" | "reveal" | "wind";

// traînée : rayon (fraction de la hauteur), force par mouvement, disparition par seconde
const TRAIL: Record<HoverFxEffect, { radius: number; amount: number; fade: number; settle: number }> = {
  lens: { radius: 0.1, amount: 0, fade: 4, settle: 1.2 },
  scatter: { radius: 0.09, amount: 0.9, fade: 1.6, settle: 2.6 },
  rgb: { radius: 0.12, amount: 1, fade: 2.5, settle: 1.6 },
  reveal: { radius: 0.075, amount: 0.8, fade: 0.55, settle: 6 },
  wind: { radius: 0.14, amount: 0.6, fade: 1.2, settle: Infinity },
};

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

// commun à l'affichage : image en cover, traînée, souris
const DISPLAY_HEAD =
  HEAD +
  `uniform sampler2D u_image; uniform sampler2D u_trail; uniform float u_imgAspect; uniform vec2 u_res;
uniform vec2 u_mouse; uniform vec2 u_vel; uniform float u_hover; uniform float u_time;
float A() { return u_res.x / u_res.y; }
vec2 S() { float a = A(); return a > u_imgAspect ? vec2(1.0, u_imgAspect / a) : vec2(a / u_imgAspect, 1.0); }
vec3 img(vec2 p) {
  vec2 s = S(); vec2 plain = (vUv - 0.5) * s;
  return textureGrad(u_image, (clamp(p, 0.0, 1.0) - 0.5) * s + 0.5, dFdx(plain), dFdy(plain)).rgb;
}
float trail(vec2 p) { return texture(u_trail, p).r; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`;

const DISPLAY: Record<HoverFxEffect, string> = {
  lens:
    DISPLAY_HEAD +
    `void main() {
  float a = A();
  float R = 0.13;
  vec2 d = (vUv - u_mouse) * vec2(a, 1.0);
  float r = length(d) / R;
  vec3 col = img(vUv);
  if (u_hover > 0.001 && r < 1.0) {
    // bombé : on lit plus près du centre (grossissement), plus fort au milieu
    float k = 1.0 - sqrt(max(0.0, 1.0 - r * r));
    vec2 toC = (vUv - u_mouse);
    vec2 p = u_mouse + toC * mix(0.55, 1.0, k);
    // bord : légère séparation des couleurs (irisé)
    vec2 sh = toC * 0.04 * k * k;
    vec3 lens = vec3(img(p + sh).r, img(p).g, img(p - sh).b);
    // reflet en haut à gauche + liseré
    vec2 hl = d / R - vec2(-0.35, 0.4);
    lens += smoothstep(0.22, 0.0, length(hl)) * 0.35;
    lens += smoothstep(0.86, 1.0, r) * 0.18;
    lens *= 1.0 - smoothstep(0.93, 1.0, r) * 0.15;
    col = mix(col, lens, u_hover * smoothstep(1.0, 0.97, r));
  }
  o = vec4(col, 1.0);
}`,
  scatter:
    DISPLAY_HEAD +
    `void main() {
  float cell = 18.0;
  vec2 px = vUv * u_res;
  vec2 id = floor(px / cell);
  vec2 cuv = (id + 0.5) * cell / u_res;
  float t = smoothstep(0.02, 0.9, trail(cuv));
  vec3 base = img(vUv);
  if (t < 0.005) { o = vec4(base, 1.0); return; }
  // chaque carré part dans une direction au hasard et rétrécit
  float ang = hash(id) * 6.2831;
  float size = 0.5 * (1.0 - 0.6 * t);
  // le carré glisse dans sa case (sans en sortir) et l'image qu'il porte part un peu plus loin
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 local = (px - id * cell) / cell - 0.5;
  vec2 lp = local - dir * (0.5 - size) * hash(id + 3.0);
  float inside = step(abs(lp.x), size) * step(abs(lp.y), size);
  vec3 c = img(cuv + dir * t * (6.0 + 24.0 * hash(id + 7.0)) / u_res);
  vec3 sq = mix(vec3(0.0), c, inside);
  o = vec4(mix(base, sq, smoothstep(0.0, 0.25, t)), 1.0);
}`,
  rgb:
    DISPLAY_HEAD +
    `void main() {
  float t = trail(vUv);
  vec2 v = u_vel;
  vec2 sh = v * (0.15 + 0.85 * t) * 0.06;
  float r = img(vUv + sh).r;
  float g = img(vUv).g;
  float b = img(vUv - sh).b;
  vec3 col = vec3(r, g, b);
  // fines lignes de balayage là où la souris passe
  col *= 1.0 - t * 0.08 * step(0.5, fract(vUv.y * u_res.y * 0.5));
  o = vec4(col, 1.0);
}`,
  reveal:
    DISPLAY_HEAD +
    `void main() {
  vec3 c = img(vUv);
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  vec3 gray = vec3(lum) * 0.95;
  // bord du pinceau irrégulier
  float t = trail(vUv) + (hash(floor(vUv * u_res / 3.0)) - 0.5) * 0.08;
  o = vec4(mix(gray, c, smoothstep(0.15, 0.55, t)), 1.0);
}`,
  wind:
    DISPLAY_HEAD +
    `void main() {
  float t = trail(vUv);
  float k = 0.0025 + 0.012 * t;
  vec2 off = vec2(
    sin(vUv.y * 9.0 + u_time * 1.3) + 0.5 * sin(vUv.y * 23.0 - u_time * 2.1 + vUv.x * 4.0),
    cos(vUv.x * 7.0 + u_time * 1.1) + 0.5 * cos(vUv.x * 19.0 + u_time * 1.7 + vUv.y * 3.0)
  ) * k;
  vec3 col = img(vUv + off);
  // ombre/lumière légère des plis
  col *= 1.0 + 0.05 * sin(vUv.y * 9.0 + u_time * 1.3 + 1.2) * (0.3 + t);
  o = vec4(col, 1.0);
}`,
};

const TRAIL_FRAG =
  HEAD +
  `uniform sampler2D u_prev; uniform float u_fade; uniform vec2 u_from; uniform vec2 u_to; uniform float u_radius;
uniform float u_amount; uniform float u_aspect;
float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h); }
void main() {
  float prev = texture(u_prev, vUv).r * u_fade;
  vec2 k = vec2(u_aspect, 1.0);
  float d = seg(vUv * k, u_from * k, u_to * k) / u_radius;
  float add = exp(-d * d * 2.5) * u_amount;
  o = vec4(min(1.0, prev + add), 0.0, 0.0, 1.0);
}`;

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Prog = { prog: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
type Uniform = number | number[] | { tex: WebGLTexture };

export default function HoverFx({ src, effect, className }: { src: string; effect: HoverFxEffect; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const zone = canvas.parentElement;
    if (!zone) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl || !(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) return;
    const cfg = TRAIL[effect];

    let disposed = false;
    let raf = 0;
    let last = 0;
    let energy = -1e9;
    let visible = false;
    let aspect = 1.6;
    let image: { tex: WebGLTexture } | null = null;
    let imgAspect = 1;
    let ta: Target, tb: Target;
    const owned: { textures: WebGLTexture[]; fbos: WebGLFramebuffer[] } = { textures: [], fbos: [] };
    let trailP: Prog, displayP: Prog;
    // souris : position lissée, vitesse lissée, présence (0 → 1)
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0, inside: false, hover: 0, moved: false };
    const t0 = performance.now();

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
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
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
    const allocate = () => {
      release();
      const s = 192;
      const w = aspect >= 1 ? Math.round(s * aspect) : s;
      const h = aspect >= 1 ? s : Math.round(s / aspect);
      ta = target(w, h);
      tb = target(w, h);
    };

    const draw = (now: number) => {
      if (!image) return;
      run(displayP, null, {
        image,
        trail: ta,
        imgAspect,
        res: [canvas.width, canvas.height],
        mouse: [mouse.x, mouse.y],
        vel: [mouse.vx, mouse.vy],
        hover: mouse.hover,
        time: (now - t0) / 1000,
      });
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      // souris lissée (la loupe glisse), vitesse amortie
      const ease = 1 - Math.exp(-dt * 14);
      mouse.x += (mouse.tx - mouse.x) * ease;
      mouse.y += (mouse.ty - mouse.y) * ease;
      mouse.hover += ((mouse.inside ? 1 : 0) - mouse.hover) * (1 - Math.exp(-dt * 8));
      mouse.vx *= Math.exp(-dt * 6);
      mouse.vy *= Math.exp(-dt * 6);
      // traînée : s'estompe, + segment parcouru depuis l'image précédente
      run(trailP, tb, {
        prev: ta,
        fade: Math.exp(-cfg.fade * dt),
        from: [mouse.px, mouse.py],
        to: [mouse.tx, mouse.ty],
        radius: cfg.radius,
        amount: mouse.moved ? cfg.amount : 0,
        aspect,
      });
      const t = ta;
      ta = tb;
      tb = t;
      mouse.px = mouse.tx;
      mouse.py = mouse.ty;
      mouse.moved = false;
      draw(now);
      const busy = mouse.inside || mouse.hover > 0.01 || now - energy < cfg.settle * 1000;
      if (visible && (busy || effect === "wind")) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (raf || disposed || !image || !visible) return;
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
      const ar = w / h;
      if (!ta || Math.abs(ar - aspect) / aspect > 0.02) {
        aspect = ar;
        allocate();
      }
      draw(performance.now());
    };

    try {
      trailP = program(TRAIL_FRAG);
      displayP = program(DISPLAY[effect]);
      gl.bindVertexArray(gl.createVertexArray());
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      aspect = Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1);
      allocate();
    } catch (err) {
      console.warn("HoverFx", effect, err);
      return;
    }

    const ro = new ResizeObserver(() => image && resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && effect === "wind") kick();
    });
    io.observe(canvas);

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
      owned.textures.push(imgTex);
      image = { tex: imgTex };
      imgAspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
      resize();
      canvas.dataset.ready = "";
      kick();
    };
    img.src = src;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      if (!mouse.inside) {
        // entrée : on part de là, sans trait depuis l'ancienne position
        mouse.inside = true;
        mouse.x = mouse.px = x;
        mouse.y = mouse.py = y;
      }
      mouse.vx = mouse.vx * 0.5 + (x - mouse.tx) * 0.5 * aspect * 20;
      mouse.vy = mouse.vy * 0.5 + (y - mouse.ty) * 0.5 * 20;
      mouse.tx = x;
      mouse.ty = y;
      mouse.moved = true;
      energy = performance.now();
      kick();
    };
    const onLeave = () => {
      mouse.inside = false;
      energy = performance.now();
    };
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      release();
      gl.deleteProgram(trailP.prog);
      gl.deleteProgram(displayP.prog);
    };
  }, [src, effect]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
