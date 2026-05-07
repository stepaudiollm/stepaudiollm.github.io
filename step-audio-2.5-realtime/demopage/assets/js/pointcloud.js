// 3D 点云 StepFun Logo · 基于 Three.js
// 设计：极细像素级颗粒，从外圈螺旋收缩到 logo（每个粒子沿一条测地线/弧线被"吸入"）
// 关键技术：在 shader 里做极坐标插值，让轨迹天然呈弧形
import * as THREE from 'three';

// 采样路径：外圆 + 5 个方孔（nonzero 填充规则下方块是挖空区域），粒子只在圆盘外框
const SVG_PATH =
  'M47.24.3C24.08-2.46,3.07,14.07.3,37.23c-2.76,23.16,13.77,44.17,36.92,46.94,23.16,2.76,44.17-13.77,46.94-36.92C86.93,24.08,70.4,3.07,47.24.3Zm-16.36,68.73h-15.44v-15.44h15.44v15.44Zm19.07,0h-15.44v-15.44h15.44v15.44Zm0-19.08h-15.44v-15.44h15.44v15.44Zm0-19.07h-15.44v-15.44h15.44v15.44Zm19.07,0h-15.44v-15.44h15.44v15.44Z';
const VIEWBOX = 84.47;

function sampleSvgPoints(pathStr, viewBoxSize, resolution = 480, step = 3) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  const scale = resolution / viewBoxSize;
  ctx.scale(scale, scale);
  const path = new Path2D(pathStr);
  ctx.fill(path);
  const data = ctx.getImageData(0, 0, resolution, resolution).data;
  const pts = [];
  for (let y = 0; y < resolution; y += step) {
    for (let x = 0; x < resolution; x += step) {
      const jx = x + Math.floor(Math.random() * step);
      const jy = y + Math.floor(Math.random() * step);
      if (jx >= resolution || jy >= resolution) continue;
      const idx = (jy * resolution + jx) * 4;
      if (data[idx + 3] > 128) {
        const nx = (jx / resolution) * 2 - 1;
        const ny = -((jy / resolution) * 2 - 1);
        pts.push([nx, ny]);
      }
    }
  }
  return pts;
}

function colorForPoint(_nx, _ny) {
  // 整个圆盘外框统一用白色
  return [1, 1, 1];
}

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute vec3 aTarget;        // logo 上的目标位置 (x,y,z)
  attribute vec3 aInitPolar;     // 初始极坐标 (angle, radius, z)
  attribute vec3 aDisp;          // 物理扰动位移（CPU 每帧更新）
  attribute float aPhase;
  attribute float aDelay;        // 每粒子独立出发延迟 [0, 0.5]
  uniform float uTime;
  uniform float uProgress;       // 全局入场进度 [0, 1]
  uniform float uBreathe;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }

  void main() {
    vColor = aColor;

    // 每粒子 effective progress + 缓动
    float windowLen = max(0.0001, 1.0 - aDelay);
    float p = clamp((uProgress - aDelay) / windowLen, 0.0, 1.0);
    float ep = easeOutCubic(p);

    // 极坐标插值：角度与半径都线性 mix，就是一条螺旋/弧线（测地线）
    float targetAngle = atan(aTarget.y, aTarget.x);
    float targetRadius = length(aTarget.xy);

    float angle = mix(aInitPolar.x, targetAngle, ep);
    float radius = mix(aInitPolar.y, targetRadius, ep);
    float z = mix(aInitPolar.z, aTarget.z, ep);

    // 聚合后才做微呼吸
    float breathe = 1.0 + sin(uTime * 1.2 + aPhase) * uBreathe * ep;
    radius *= breathe;

    vec3 pos = vec3(cos(angle) * radius, sin(angle) * radius, z);
    pos.y += sin(uTime * 0.8 + aPhase * 2.0) * 0.01 * ep;
    // 叠加物理扰动（只在聚合完成后生效）
    pos += aDisp * ep;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // 像素级小颗粒：整体尺寸系数极小
    gl_PointSize = aSize * uPixelRatio * (6.0 / -mv.z);
    vAlpha = smoothstep(0.0, 0.08, p);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    // 极紧实的圆点：几乎是一个纯色像素，边缘仅一像素抗锯齿
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = 1.0 - smoothstep(0.42, 0.5, d);
    gl_FragColor = vec4(vColor, a * vAlpha * 0.7);
  }
`;

export function initHeroPointCloud(canvas) {
  // 新 logo 是近似填满 viewBox 的圆形（里面有 5 个方孔），采样面积比旧的 step 形大很多
  // 适当增大 step 控制粒子数 ~6000，避免 CPU 物理循环变慢
  const samples = sampleSvgPoints(SVG_PATH, VIEWBOX, 480, 5);
  const N = samples.length;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const PR = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(PR);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 4.0);

  const targetPos = new Float32Array(N * 3);
  const initPolar = new Float32Array(N * 3);  // (angle, radius, z)
  const colors = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const phases = new Float32Array(N);
  const delays = new Float32Array(N);
  // position 仍存（虽然 shader 里不直接用）以便某些 Three.js 内部逻辑
  const positions = new Float32Array(N * 3);
  // 物理扰动状态：位移 + 速度，每帧 CPU 更新
  const disp = new Float32Array(N * 3);
  const velArr = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const [nx, ny] = samples[i];
    // 新圆形 logo 填满 [-1,1]，scale 适当缩小避免占屏过满
    const scale = 1.1;
    const tx = nx * scale;
    const ty = ny * scale;
    const tz = (Math.random() - 0.5) * 0.22;
    targetPos[i * 3 + 0] = tx;
    targetPos[i * 3 + 1] = ty;
    targetPos[i * 3 + 2] = tz;

    // 每粒子的初始极坐标：在目标角度基础上提前 Δ，然后从更大的半径（>屏幕）出发
    const targetAngle = Math.atan2(ty, tx);
    // 角度偏移 ±(0.6 ~ 1.8) 弧度 → 聚合时会扫过一段弧（测地线感）
    // 80% 顺时针 + 20% 逆时针，整体呈现协调的旋涡收缩
    let sweep = 0.6 + Math.random() * 1.2;
    if (Math.random() < 0.2) sweep = -sweep;
    const initAngle = targetAngle + sweep;
    const initRadius = 3.8 + Math.random() * 1.4;   // > 视口半径 ~1.66，确保屏幕外起步
    const initZ = (Math.random() - 0.5) * 0.6;

    initPolar[i * 3 + 0] = initAngle;
    initPolar[i * 3 + 1] = initRadius;
    initPolar[i * 3 + 2] = initZ;

    // 存一份 cartesian 初始位置（仅供 Three.js 默认 position 属性填充；不在 shader 里使用）
    positions[i * 3 + 0] = Math.cos(initAngle) * initRadius;
    positions[i * 3 + 1] = Math.sin(initAngle) * initRadius;
    positions[i * 3 + 2] = initZ;

    const [cr, cg, cb] = colorForPoint(nx, ny);
    colors[i * 3 + 0] = cr;
    colors[i * 3 + 1] = cg;
    colors[i * 3 + 2] = cb;

    // 粒子尺寸：非常小，1-2 CSS 像素
    sizes[i] = 0.8 + Math.random() * 0.6;
    phases[i] = Math.random() * Math.PI * 2;
    // 入场延迟 0~0.5：外层先动、里层后动或反之，形成涟漪感
    delays[i] = Math.random() * 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(targetPos, 3));
  geometry.setAttribute('aInitPolar', new THREE.BufferAttribute(initPolar, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));
  geometry.setAttribute('aDisp', new THREE.BufferAttribute(disp, 3));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uBreathe: { value: 0.02 },
    uPixelRatio: { value: PR },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * PR || canvas.height !== h * PR) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 720 ? 3.4 : 4.0;
      camera.updateProjectionMatrix();
    }
  }
  window.addEventListener('resize', resize);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  // 鼠标世界坐标（投影到粒子所在的 z=0 平面）+ 世界速度
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const worldHit = new THREE.Vector3();
  let mouseWorld = null;       // 当前鼠标在 z=0 平面的位置
  const mouseVel = { x: 0, y: 0 };
  let lastMouseMoveTime = 0;

  function updateMouseWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    // 鼠标不在 canvas 内就忽略（scroll 走了也就不再推粒子）
    if (
      clientX < rect.left || clientX > rect.right ||
      clientY < rect.top  || clientY > rect.bottom
    ) {
      mouseWorld = null;
      return;
    }
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(plane, worldHit)) {
      const now = performance.now();
      const dt = Math.max(0.008, (now - lastMouseMoveTime) / 1000);
      if (mouseWorld && dt < 0.12) {
        // 指数平滑速度（避免单帧抖动）
        const nvx = (worldHit.x - mouseWorld.x) / dt;
        const nvy = (worldHit.y - mouseWorld.y) / dt;
        mouseVel.x = mouseVel.x * 0.4 + nvx * 0.6;
        mouseVel.y = mouseVel.y * 0.4 + nvy * 0.6;
      }
      mouseWorld = mouseWorld || { x: 0, y: 0 };
      mouseWorld.x = worldHit.x;
      mouseWorld.y = worldHit.y;
      lastMouseMoveTime = now;
    }
  }
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    updateMouseWorld(e.clientX, e.clientY);
  });

  // 物理参数（手感关键）
  const SPRING_K = 55;         // 弹簧刚度：越大回弹越快
  const DAMPING  = 7;          // 阻尼：越大越快衰减
  const INFLUENCE_R = 0.42;    // 鼠标影响半径（世界单位）
  const RADIAL_F = 5.0;        // 径向推开力
  const VEL_F = 1.1;           // 沿鼠标速度方向的冲击力（"子弹穿透感"关键）
  const INFLUENCE_R2 = INFLUENCE_R * INFLUENCE_R;

  function updatePhysics(dt) {
    // 帧间速度衰减（鼠标停下后冲击力快速消失）
    mouseVel.x *= 0.88;
    mouseVel.y *= 0.88;

    const dampFactor = Math.exp(-DAMPING * dt);
    const mx = mouseWorld ? mouseWorld.x : 0;
    const my = mouseWorld ? mouseWorld.y : 0;
    const hasMouse = !!mouseWorld;
    const vx = mouseVel.x;
    const vy = mouseVel.y;
    const speed = Math.hypot(vx, vy);

    for (let i = 0; i < N; i++) {
      const ix = i * 3;

      // 当前粒子位置（target + disp）
      const px = targetPos[ix]     + disp[ix];
      const py = targetPos[ix + 1] + disp[ix + 1];
      const pz = targetPos[ix + 2] + disp[ix + 2];

      // 弹簧回位
      let fx = -SPRING_K * disp[ix];
      let fy = -SPRING_K * disp[ix + 1];
      let fz = -SPRING_K * disp[ix + 2];

      // 鼠标影响
      if (hasMouse) {
        const dx = px - mx;
        const dy = py - my;
        const d2 = dx * dx + dy * dy;   // 2D 距离（忽略 z，粒子基本在 z≈0）
        if (d2 < INFLUENCE_R2) {
          const d = Math.sqrt(d2);
          const falloff = 1 - d / INFLUENCE_R;
          const w = falloff * falloff;    // 平滑衰减

          // 径向推开（所有速度下都有）
          if (d > 0.0005) {
            const invD = 1 / d;
            fx += dx * invD * RADIAL_F * w;
            fy += dy * invD * RADIAL_F * w;
          }
          // 沿鼠标速度方向的冲击：鼠标越快，力越大
          // → 快速穿透时粒子沿轨迹方向溅射，形成"子弹孔 + 尾迹"
          if (speed > 0.05) {
            fx += vx * VEL_F * w;
            fy += vy * VEL_F * w;
          }
          // 轻微 z 轴扰动，让溅射有立体感
          fz += (Math.random() - 0.5) * 0.6 * w;
        }
      }

      // 积分
      velArr[ix]     = (velArr[ix]     + fx * dt) * dampFactor;
      velArr[ix + 1] = (velArr[ix + 1] + fy * dt) * dampFactor;
      velArr[ix + 2] = (velArr[ix + 2] + fz * dt) * dampFactor;
      disp[ix]     += velArr[ix]     * dt;
      disp[ix + 1] += velArr[ix + 1] * dt;
      disp[ix + 2] += velArr[ix + 2] * dt;
    }
    geometry.attributes.aDisp.needsUpdate = true;
  }

  // 快速收缩：1.8s 完成所有粒子聚合
  const START_DELAY = 120;
  const DURATION = 1800;
  const startTime = performance.now() + START_DELAY;

  const clock = new THREE.Clock();
  let running = true;
  let lastFrameTime = performance.now();

  function render() {
    if (!running) return;
    resize();
    const now = performance.now();
    const dt = Math.min(1 / 30, Math.max(0.001, (now - lastFrameTime) / 1000));
    lastFrameTime = now;
    const elapsed = Math.max(0, now - startTime);
    const progress = Math.min(1, elapsed / DURATION);
    uniforms.uProgress.value = progress;
    uniforms.uTime.value = clock.getElapsedTime();

    // 物理仿真：聚合完成后才启用
    if (progress >= 1) updatePhysics(dt);

    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    const settled = Math.max(0, (progress - 0.7) / 0.3);
    points.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05 * settled + mouse.x * 0.07 * settled;
    points.rotation.x = -mouse.y * 0.05 * settled;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      render();
    }
  });

  render();

  return { renderer, scene, camera };
}
