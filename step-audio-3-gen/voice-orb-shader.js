// Homepage orb motion reference and texture provenance: assets/voice-orbs/README.md.
// Spherical projection, domain-warped FBM, slow simplex drift and sound-driven highlights.
export const fragmentSource = `
precision highp float;
uniform sampler2D material;
uniform sampler2D fluidMap;
uniform float time;
uniform vec4 audio;
uniform vec4 cumulative;
uniform vec3 paletteLow;
uniform vec3 paletteMid;
uniform vec3 paletteHigh;
varying vec2 uv;
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0);
 }
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0);
 }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r;
 }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);

    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);


    vec3 i = floor(v + dot(v, C.yyy));

    vec3 x0 = v - i + dot(i, C.xxx);


    vec3 g = step(x0.yzx, x0.xyz);

    vec3 l = 1.0 - g;

    vec3 i1 = min(g.xyz, l.zxy);

    vec3 i2 = max(g.xyz, l.zxy);


    vec3 x1 = x0 - i1 + 1.0 * C.xxx;

    vec3 x2 = x0 - i2 + 2.0 * C.xxx;

    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;


    i = mod(i, 289.0);

    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));


    float n_ = 1.0/7.0;

    vec3 ns = n_ * D.wyz - D.xzx;


    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);


    vec4 x_ = floor(j * ns.z);

    vec4 y_ = floor(j - 7.0 * x_);


    vec4 x = x_ * ns.x + ns.yyyy;

    vec4 y = y_ * ns.x + ns.yyyy;

    vec4 h = 1.0 - abs(x) - abs(y);


    vec4 b0 = vec4(x.xy, y.xy);

    vec4 b1 = vec4(x.zw, y.zw);


    vec4 s0 = floor(b0) * 2.0 + 1.0;

    vec4 s1 = floor(b1) * 2.0 + 1.0;

    vec4 sh = -step(h, vec4(0.0));


    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;

    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;


    vec3 p0 = vec3(a0.xy, h.x);

    vec3 p1 = vec3(a0.zw, h.y);

    vec3 p2 = vec3(a1.xy, h.z);

    vec3 p3 = vec3(a1.zw, h.w);


    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));

    p0 *= norm.x;

    p1 *= norm.y;

    p2 *= norm.z;

    p3 *= norm.w;


    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);

    m = m * m;

    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));

}

float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);

}

float noise(in vec2 _st) {
    vec2 i = floor(_st);

    vec2 f = fract(_st);


    float a = random(i);

    float b = random(i + vec2(1.0, 0.0));

    float c = random(i + vec2(0.0, 1.0));

    float d = random(i + vec2(1.0, 1.0));


    vec2 u = f * f * (3.0 - 2.0 * f);


    return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;

}

#define NUM_OCTAVES 4
float fbm(in vec2 _st) {
    float v = 0.0;

    float a = 0.5;

    vec2 shift = vec2(100.0);

    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));

    for (int i = 0;
 i < NUM_OCTAVES;
 ++i) {
        v += a * noise(_st);

        _st = rot * _st * 2.0 + shift;

        a *= 0.5;

    }
    return v;

}


void main() {
  vec2 v = vec2(1.0 - uv.x, uv.y);
  vec2 sphere = (vec2(1.0 - v.x, v.y) - 0.5) * 2.0;
  float depth = pow(sqrt(1.0 - clamp(dot(sphere, sphere), 0.0, 1.0)), 1.1);
  vec2 refracted = (sphere * 0.9 / (depth + 1.0) + 1.0) * 0.5;
  vec2 st = refracted * 3.25;
  vec2 q = vec2(fbm(st), fbm(st + vec2(1.0)));
  float flowTime = time * 2.25 + cumulative.x * 0.25;
  vec2 r = vec2(
    fbm(st + q + vec2(91.3, 0.55) + 0.15 * flowTime),
    fbm(st + q - vec2(45.33, 1.2) + 0.126 * flowTime)
  );
  float f = fbm(st + r);
  float folds = mix(0.8, 0.66, clamp(f * f * 2.75, 0.0, 1.0));
  folds = mix(folds, 0.0, clamp(length(q), 0.0, 1.0));
  folds = mix(folds, 1.0, clamp(abs(r.x), 0.0, 1.0));
  vec2 drift = vec2(
    snoise(vec3(v * 0.65, time * 0.125 + cumulative.z * 0.1)),
    snoise(vec3(v * 0.65 + vec2(54.0), time * 0.25))
  ) * (1.0 + audio.z * 0.25);
  vec3 fluid = texture2D(fluidMap, v).rgb;
  refracted += sphere * (folds - 0.5) * 0.65 + drift * 0.15 - fluid.rg * 0.001;
  vec3 color = texture2D(material, refracted).rgb;

  // A moving internal highlight responds to the voice spectrum, not a fixed pulse.
  vec2 ring = (v - 0.5) * 1.5;
  float angle = atan(ring.y, ring.x);
  float radius = length(ring);
  float ringTime = -time * 0.5 - cumulative.w * 0.2;
  ring.x += 1.0 + audio.y * 1.5;
  float n = snoise(vec3(ring * (0.65 + audio.x * 0.4), ringTime * 0.5)) * 0.5 + 0.5;
  // Explicit inversions avoid GLSL's undefined reversed smoothstep edges.
  float outer = 1.0 - smoothstep(mix(0.25, 1.0, n * 0.5), 1.0, radius);
  float inner = pow(smoothstep(0.25, mix(0.25, 1.0, n * 0.75), radius), 2.0);
  float highlight = (cos(angle + ringTime * 2.0) * 0.5 + 0.5) * outer * inner;
  highlight = clamp(pow(highlight * min(audio.w * 4.0, 1.0), 3.0), 0.0, 1.0);
  color += highlight * 0.25;
  color = mix(color, vec3(1.0), clamp(length(fluid) * 0.001, 0.0, 1.0));
  // Same sRGB luminance map as the static fallback, applied before composition.
  // Moving canvases no longer depend on an external SVG filter staying attached.
  color = clamp(color * 1.15, 0.0, 1.0);
  float luminance = dot(color, vec3(0.213, 0.715, 0.072));
  color = luminance < 0.5
    ? mix(paletteLow, paletteMid, luminance * 2.0)
    : mix(paletteMid, paletteHigh, luminance * 2.0 - 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`
