import * as THREE from 'three';

const SunSurfaceShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewDir;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewDir;

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

    void main() {
      float mu = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
      float r = 1.0 - mu;

      float tSlow = uTime * 0.06;
      vec3 pGranule = vPosition * 2.2;
      float granule1 = snoise(pGranule + vec3(tSlow * 0.5, tSlow * 0.3, 0.0));
      float granule2 = snoise(pGranule * 2.0 - vec3(0.0, tSlow * 0.4, tSlow * 0.2));
      float granulation = (granule1 * 0.7 + granule2 * 0.3) * 0.07;

      float factor = clamp(r + granulation, 0.0, 1.0);

      vec3 c0 = vec3(1.0, 0.965, 0.863);
      vec3 c35 = vec3(1.0, 0.824, 0.478);
      vec3 c65 = vec3(0.949, 0.604, 0.180);
      vec3 c88 = vec3(0.710, 0.278, 0.106);
      vec3 cLimb = vec3(0.48, 0.16, 0.06);

      vec3 color;
      if (factor <= 0.35) {
        color = mix(c0, c35, factor / 0.35);
      } else if (factor <= 0.65) {
        color = mix(c35, c65, (factor - 0.35) / 0.30);
      } else if (factor <= 0.88) {
        color = mix(c65, c88, (factor - 0.65) / 0.23);
      } else {
        color = mix(c88, cLimb, (factor - 0.88) / 0.12);
      }

      color *= (0.4 + 0.6 * pow(mu, 0.3));

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

const CoronaWarmShader = {
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
      float edge = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6) * uIntensity;
      gl_FragColor = vec4(uColor, clamp(edge, 0.0, 1.0));
    }
  `
};

export class SunModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.radius = 4.2;

    this.createCore();
    this.createWarmCoronas();
    this.createLight();
    this.createWarmHalo();

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

  createWarmCoronas() {
    const innerGeo = new THREE.SphereGeometry(this.radius * 1.07, 48, 48);
    const innerMat = new THREE.ShaderMaterial({
      vertexShader: CoronaWarmShader.vertexShader,
      fragmentShader: CoronaWarmShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#F29A2E') },
        uIntensity: { value: 1.6 }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.innerCorona = new THREE.Mesh(innerGeo, innerMat);
    this.group.add(this.innerCorona);

    const outerGeo = new THREE.SphereGeometry(this.radius * 1.22, 48, 48);
    const outerMat = new THREE.ShaderMaterial({
      vertexShader: CoronaWarmShader.vertexShader,
      fragmentShader: CoronaWarmShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#B5471B') },
        uIntensity: { value: 1.0 }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.outerCorona = new THREE.Mesh(outerGeo, outerMat);
    this.group.add(this.outerCorona);
  }

  createWarmHalo() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 242, 220, 0.7)');
    grad.addColorStop(0.25, 'rgba(242, 163, 58, 0.45)');
    grad.addColorStop(0.65, 'rgba(181, 71, 27, 0.18)');
    grad.addColorStop(1.0, 'rgba(181, 71, 27, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.8
    });

    this.haloSprite = new THREE.Sprite(spriteMat);
    this.haloSprite.scale.set(this.radius * 3.8, this.radius * 3.8, 1);
    this.group.add(this.haloSprite);
  }

  createLight() {
    this.pointLight = new THREE.PointLight(0xfff6dc, 3.2, 350, 0.5);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.width = 1024;
    this.pointLight.shadow.mapSize.height = 1024;
    this.pointLight.shadow.camera.near = 1.0;
    this.pointLight.shadow.camera.far = 250;
    this.group.add(this.pointLight);

    const ambientLight = new THREE.AmbientLight(0x15110c, 0.35);
    this.scene.add(ambientLight);
    this.ambientLight = ambientLight;
  }

  update(delta) {
    if (this.uniforms) {
      this.uniforms.uTime.value += delta;
    }
    if (this.haloSprite) {
      const s = this.radius * (3.8 + Math.sin(this.uniforms.uTime.value * 0.6) * 0.06);
      this.haloSprite.scale.set(s, s, 1);
    }
  }

  dispose() {
    this.coreMesh.geometry.dispose();
    this.sunMaterial.dispose();
    this.innerCorona.geometry.dispose();
    this.innerCorona.material.dispose();
    this.outerCorona.geometry.dispose();
    this.outerCorona.material.dispose();
    if (this.haloSprite) {
      this.haloSprite.material.dispose();
    }
    if (this.ambientLight) {
      this.scene.remove(this.ambientLight);
    }
    this.scene.remove(this.group);
  }
}
