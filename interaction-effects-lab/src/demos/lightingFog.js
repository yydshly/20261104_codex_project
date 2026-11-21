const vertex = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
out vec4 pixel;
uniform vec2 resolution;
uniform float time, surge, night, reading, interior;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 id = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(id), hash(id + vec2(1.0, 0.0)), w.x),
             mix(hash(id + vec2(0.0, 1.0)), hash(id + 1.0), w.x), w.y);
}
float fog(vec2 p) {
  float value = 0.0;
  float weight = 0.53;
  mat2 turn = mat2(1.62, 1.21, -1.21, 1.62);
  for (int i = 0; i < 4; i++) {
    value += noise(p) * weight;
    p = turn * p + 7.2;
    weight *= 0.5;
  }
  return value;
}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv.y = 1.0 - uv.y;
  vec2 flow = uv * vec2(4.2, 3.6) + vec2(time * 0.10, time * -0.041);
  float cloud = fog(flow + vec2(fog(flow * 0.73 + 5.0), fog(flow + 21.5)) * 1.95);
  float foreground = smoothstep(0.67, 1.01, uv.y + (cloud - 0.53) * 0.34);
  float lower = mix(0.67, 0.14, interior) * foreground;
  float surgeFront = 1.04 - 0.82 * surge;
  float covered = smoothstep(surgeFront - 0.09, surgeFront + 0.22,
                            uv.y + (cloud - 0.5) * 0.34);
  float alpha = max(lower, max(covered * surge * 0.985, surge * (0.28 + 0.40 * cloud)));
  vec3 dayFog = mix(vec3(0.78, 0.77, 0.70), vec3(0.98, 0.93, 0.85), cloud);
  vec3 nightFog = mix(vec3(0.11, 0.16, 0.26), vec3(0.39, 0.44, 0.55), cloud);
  vec3 color = mix(dayFog, nightFog, night);
  color = mix(color, vec3(0.80, 0.62, 0.44), reading * 0.64);
  float porch = exp(-9.0 * length(uv - vec2(0.74, 0.72)));
  color = mix(color, vec3(0.85, 0.50, 0.21), porch * night * (1.0 - surge) * 0.56);
  pixel = vec4(color * alpha, alpha);
}`;

export function createLightingFog(canvas, interior) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const shaders = [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]].map(([kind, source]) => {
    const shader = gl.createShader(kind);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  });
  const program = gl.createProgram();
  shaders.forEach((shader) => gl.attachShader(program, shader));
  gl.linkProgram(program);
  shaders.forEach((shader) => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const uniforms = Object.fromEntries(['resolution', 'time', 'surge', 'night', 'reading', 'interior']
    .map((key) => [key, gl.getUniformLocation(program, key)]));
  let latest = [0, 0, 0, 0];
  function render() {
    const [time, surge, night, reading] = latest;
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.surge, surge);
    gl.uniform1f(uniforms.night, night);
    gl.uniform1f(uniforms.reading, reading);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  gl.uniform1f(uniforms.interior, Number(interior));
  const resize = new ResizeObserver(([{ contentRect }]) => {
    const width = Math.round(Math.min(contentRect.width, 850));
    const height = Math.round(contentRect.height / Math.max(contentRect.width, 1) * width);
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.resolution, width, height);
    render();
  });
  resize.observe(canvas);

  return {
    paint(time, surge, night, reading) {
      latest = [time, surge, night, reading];
      render();
    },
    dispose() {
      resize.disconnect();
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}
