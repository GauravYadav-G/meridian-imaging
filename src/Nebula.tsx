import { useEffect, useRef } from "react";
import { useReducedMotion } from "./shared/motion";

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uDepth;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for(int i = 0; i < 5; i++){
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
  float t = uTime * 0.045;

  // gravity lens around the cursor
  vec2 dm = p - m;
  float dl = length(dm);
  p += dm * (0.11 / (dl * dl * 16.0 + 1.0));

  // domain-warped fractal noise
  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(p * 1.6 + 3.2 * q + vec2(1.7, 9.2) + t * 1.4),
    fbm(p * 1.6 + 3.2 * q + vec2(8.3, 2.8) - t * 1.2)
  );
  float f = fbm(p * 1.4 + 3.4 * r);

  // palette drifts with depth: ember/violet -> ion/teal
  vec3 c1 = mix(vec3(0.015, 0.02, 0.06), vec3(0.01, 0.04, 0.10), uDepth);
  vec3 c2 = mix(vec3(0.17, 0.09, 0.42), vec3(0.02, 0.26, 0.36), uDepth);
  vec3 c3 = mix(vec3(1.00, 0.34, 0.16), vec3(0.42, 0.97, 0.80), uDepth);

  vec3 col = mix(c1, c2, smoothstep(0.15, 0.78, f));
  col = mix(col, c3, smoothstep(0.55, 1.0, f * f * 1.7 + r.x * 0.35) * 0.55);
  col += vec3(0.85, 0.92, 1.0) * pow(max(0.0, 1.0 - length(q)), 4.0) * 0.07;

  // cursor bloom
  col += c3 * (0.055 / (dl * dl * 22.0 + 0.3));

  // twinkling stars, dimmed inside dense gas
  vec2 g = floor(frag / 2.6);
  float h = hash(g);
  float star = step(0.9962, h);
  float tw = 0.55 + 0.45 * sin(uTime * 2.0 + h * 90.0);
  col += star * tw * vec3(0.82, 0.9, 1.0) * (1.0 - f * 0.65);

  // vignette + grain
  col *= 1.0 - 0.75 * dot(uv - 0.5, uv - 0.5) * 1.6;
  col += (hash(frag + uTime) - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`;

type Props = {
  depthRef: { current: number };
  pausedRef: { current: boolean };
};

export default function Nebula({ depthRef, pausedRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) return; // CSS gradient fallback stays visible

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uDepth = gl.getUniformLocation(prog, "uDepth");

    // render below native resolution: nebulae are soft, and this keeps 60fps on laptops
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
    const resize = () => {
      canvas.width = Math.max(2, Math.floor(canvas.clientWidth * scale));
      canvas.height = Math.max(2, Math.floor(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const mouse = { x: 0.62, y: 0.55, tx: 0.62, ty: 0.55 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };

    let raf = 0;
    let depth = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      depth += (depthRef.current - depth) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduced ? 24 : (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uDepth, depth);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current || document.hidden) return;
      draw(now);
    };

    window.addEventListener("resize", resize);
    if (reduced) {
      draw(performance.now());
      const redraw = () => {
        resize();
        draw(performance.now());
      };
      window.addEventListener("resize", redraw);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("resize", redraw);
      };
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [reduced, depthRef, pausedRef]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(60% 50% at 70% 35%, rgba(255,91,46,0.22), transparent 70%), radial-gradient(70% 60% at 25% 75%, rgba(70,50,190,0.35), transparent 70%), #04050a",
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
