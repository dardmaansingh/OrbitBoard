import * as THREE from 'three';

/**
 * SunModel - Hyper-realistic Photorealistic Sun
 * Features:
 * - Dynamic Procedural Solar Plasma Shader with animated convection cells & sunspots
 * - Multi-layered incandescent Fresnel atmospheric corona shells
 * - Outer volumetric radial solar flare halo with camera-facing billboard
 * - Dynamic PointLight casting physical illumination across all orbiting planets
 */

// Custom GLSL Shader for Solar Plasma Turbulence & Convection Cells
const SunSurfaceShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Simplex Noise 3D helper functions
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
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
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    // Fractal Brownian Motion (FBM)
    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 4; ++i) {
        v += a * snoise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      
      // Moving plasma coordinate
      vec3 p = vPosition * 0.8;
      float speed = uTime * 0.25;
      
      // Multi-layer turbulence
      float n1 = fbm(p + vec3(speed * 0.3, speed * 0.4, 0.0));
      float n2 = fbm(p * 2.2 - vec3(0.0, speed * 0.5, speed * 0.2));
      float plasma = n1 * 0.6 + n2 * 0.4;
      
      // Color Palettes: White Core -> Golden Yellow -> Solar Orange -> Deep Thermonuclear Flare
      vec3 colCore = vec3(1.0, 1.0, 0.95);
      vec3 colGold = vec3(1.0, 0.78, 0.15);
      vec3 colOrange = vec3(0.96, 0.36, 0.04);
      vec3 colDarkSpot = vec3(0.45, 0.08, 0.01);

      vec3 color = mix(colOrange, colGold, smoothstep(-0.4, 0.2, plasma));
      color = mix(color, colCore, smoothstep(0.2, 0.7, plasma));
      color = mix(color, colDarkSpot, smoothstep(-0.8, -0.4, plasma) * 0.4);

      // Solar Limb Darkening & Rim Highlight
      float fresnel = 1.0 - max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
      color += colGold * pow(fresnel, 2.5) * 0.8;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// Corona Atmospheric Glow Shader
const CoronaGlowShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec3 vNormal;

    void main() {
      float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8) * uIntensity;
      gl_FragColor = vec4(uColor, intensity);
    }
  `
};

export class SunModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.radius = 4.2;

    this.createCore();
    this.createCoronas();
    this.createLight();
    this.createSolarHalo();

    this.scene.add(this.group);
  }

  createCore() {
    this.uniforms = {
      uTime: { value: 0.0 }
    };

    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    this.sunMaterial = new THREE.ShaderMaterial({
      vertexShader: SunSurfaceShader.vertexShader,
      fragmentShader: SunSurfaceShader.fragmentShader,
      uniforms: this.uniforms
    });

    this.coreMesh = new THREE.Mesh(geometry, this.sunMaterial);
    this.coreMesh.name = 'SunCore';
    this.group.add(this.coreMesh);
  }

  createCoronas() {
    // Inner Corona Shell (Intense atmospheric rim glow)
    const innerGeo = new THREE.SphereGeometry(this.radius * 1.08, 48, 48);
    const innerMat = new THREE.ShaderMaterial({
      vertexShader: CoronaGlowShader.vertexShader,
      fragmentShader: CoronaGlowShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0xffb703) },
        uIntensity: { value: 2.2 }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.innerCorona = new THREE.Mesh(innerGeo, innerMat);
    this.group.add(this.innerCorona);

    // Outer Corona Shell (Soft diffuse flare glow)
    const outerGeo = new THREE.SphereGeometry(this.radius * 1.25, 48, 48);
    const outerMat = new THREE.ShaderMaterial({
      vertexShader: CoronaGlowShader.vertexShader,
      fragmentShader: CoronaGlowShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0xfb8500) },
        uIntensity: { value: 1.5 }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.outerCorona = new THREE.Mesh(outerGeo, outerMat);
    this.group.add(this.outerCorona);
  }

  createSolarHalo() {
    // Large Billboard Flare Sprite (Google Earth style radiant sun rays)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0.0, 'rgba(255, 255, 240, 1.0)');
    grad.addColorStop(0.15, 'rgba(255, 200, 50, 0.8)');
    grad.addColorStop(0.4, 'rgba(255, 120, 10, 0.35)');
    grad.addColorStop(0.7, 'rgba(255, 60, 0, 0.1)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.haloSprite = new THREE.Sprite(spriteMat);
    this.haloSprite.scale.set(this.radius * 6.5, this.radius * 6.5, 1);
    this.group.add(this.haloSprite);
  }

  createLight() {
    // Physical PointLight illuminating all planets
    this.pointLight = new THREE.PointLight(0xfff7e6, 3.5, 300, 0.5);
    this.pointLight.position.set(0, 0, 0);
    this.group.add(this.pointLight);

    // Warm ambient base so dark sides have subtle cosmological visibility
    const ambientLight = new THREE.AmbientLight(0x1a243b, 0.45);
    this.scene.add(ambientLight);
  }

  update(delta) {
    if (this.uniforms) {
      this.uniforms.uTime.value += delta;
    }
    // Slow majestic solar axial rotation
    if (this.coreMesh) {
      this.coreMesh.rotation.y += delta * 0.05;
    }
    // Subtle pulsating breathing effect on outer halo
    if (this.haloSprite) {
      const pulse = 1.0 + Math.sin(Date.now() * 0.0018) * 0.04;
      this.haloSprite.scale.set(this.radius * 6.5 * pulse, this.radius * 6.5 * pulse, 1);
    }
  }

  dispose() {
    this.coreMesh.geometry.dispose();
    this.coreMesh.material.dispose();
    this.innerCorona.geometry.dispose();
    this.innerCorona.material.dispose();
    this.outerCorona.geometry.dispose();
    this.outerCorona.material.dispose();
    this.scene.remove(this.group);
  }
}
