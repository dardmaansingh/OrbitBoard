import * as THREE from 'three';

/**
 * PlanetModel - Photorealistic Procedural Planets
 * Features:
 * - High-res procedural canvas texture maps (continents, oceans, storm bands, craters)
 * - Independent rotating cloud sphere & atmospheric Rayleigh scattering Fresnel glow
 * - Saturn / Ring systems with transparency & shadow projection
 * - Real orbiting moons with natural solar lighting (showing real moon phases)
 * - Dynamic data mapping (streak -> orbit speed, completion rate -> size)
 */

// Procedural Texture Generators
function createTerranTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep Blue Ocean base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0c2461');
  oceanGrad.addColorStop(0.5, '#1e3799');
  oceanGrad.addColorStop(1, '#0c2461');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Procedural Continental Landmasses
  ctx.fillStyle = '#2e7d32'; // Emerald green land
  for (let i = 0; i < 28; i++) {
    const cx = (Math.sin(i * 123.4) * 0.5 + 0.5) * 1024;
    const cy = (Math.cos(i * 45.6) * 0.4 + 0.5) * 512;
    const radius = 60 + (i % 5) * 25;
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Mountain ridges
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 5, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e7d32';
  }

  // Polar Ice Caps
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1024, 38);
  ctx.fillRect(0, 474, 1024, 38);

  return new THREE.CanvasTexture(canvas);
}

function createCloudsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 512);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 70; i++) {
    const cx = (Math.sin(i * 78.9) * 0.5 + 0.5) * 1024;
    const cy = (Math.cos(i * 92.1) * 0.4 + 0.5) * 512;
    const rx = 50 + (i % 6) * 30;
    const ry = 18 + (i % 4) * 12;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.sin(i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createGasGiantTexture(colorA, colorB, stormColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Multi-band atmospheric gradients
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  for (let y = 0; y <= 512; y += 32) {
    const factor = y / 512;
    const c = Math.sin(factor * Math.PI * 8) > 0 ? colorA : colorB;
    grad.addColorStop(factor, c);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Great Atmospheric Storm Vortex (like Jupiter Great Red Spot / Neptune Great Dark Spot)
  ctx.fillStyle = stormColor;
  ctx.beginPath();
  ctx.ellipse(650, 310, 80, 42, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Subtle wispy storm ripples
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  for (let i = 0; i < 40; i++) {
    const y = 50 + i * 10;
    ctx.fillRect(0, y, 1024, 3);
  }

  return new THREE.CanvasTexture(canvas);
}

function createCrateredEmberTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rust & Crimson Basalt Base
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#59111b');
  grad.addColorStop(0.5, '#991b1b');
  grad.addColorStop(1, '#450a0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Volcanic Craters & Dark Basins
  ctx.fillStyle = '#290606';
  for (let i = 0; i < 45; i++) {
    const cx = (Math.sin(i * 37.8) * 0.5 + 0.5) * 1024;
    const cy = (Math.cos(i * 84.1) * 0.45 + 0.5) * 512;
    const r = 15 + (i % 7) * 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Rim highlight
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function createRingsTexture(primaryColorHex, secondaryColorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.15, primaryColorHex);
  grad.addColorStop(0.45, secondaryColorHex);
  grad.addColorStop(0.52, 'rgba(0, 0, 0, 0.15)'); // Cassini Division gap
  grad.addColorStop(0.58, primaryColorHex);
  grad.addColorStop(0.85, secondaryColorHex);
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);

  return new THREE.CanvasTexture(canvas);
}

export class PlanetModel {
  constructor(scene, habitData) {
    this.scene = scene;
    this.habit = habitData;
    this.group = new THREE.Group();
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.moonAngle = Math.random() * Math.PI * 2;

    this.initPlanet();
    this.scene.add(this.group);
  }

  initPlanet() {
    const { planetType, planetRadius = 1.4, completionRate = 80, hasRings, color } = this.habit;
    
    // Scale planet size based on completion rate (blueprint: planet size = completion rate)
    const scaleFactor = 0.8 + (completionRate / 100) * 0.45;
    this.radius = planetRadius * scaleFactor;

    // 1. Surface Material & Texture based on planet type
    let surfaceTexture;
    let roughness = 0.6;
    let metalness = 0.1;

    switch (planetType) {
      case 'terran':
        surfaceTexture = createTerranTexture();
        roughness = 0.4;
        break;
      case 'azure-gas':
        surfaceTexture = createGasGiantTexture('#083344', '#0284c7', '#0369a1');
        break;
      case 'purple-ringed':
        surfaceTexture = createGasGiantTexture('#3b0764', '#9333ea', '#c084fc');
        break;
      case 'opal-ice':
        surfaceTexture = createGasGiantTexture('#042f2e', '#0d9488', '#2dd4bf');
        roughness = 0.2;
        metalness = 0.3;
        break;
      case 'crimson-ember':
        surfaceTexture = createCrateredEmberTexture();
        roughness = 0.8;
        break;
      case 'saturn-gold':
      default:
        surfaceTexture = createGasGiantTexture('#451a03', '#d97706', '#f59e0b');
        break;
    }

    const geometry = new THREE.SphereGeometry(this.radius, 48, 48);
    const material = new THREE.MeshStandardMaterial({
      map: surfaceTexture,
      roughness: roughness,
      metalness: metalness
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.userData = { habitId: this.habit.id, habitName: this.habit.name, habit: this.habit };
    this.group.add(this.mesh);

    // 2. Terran Clouds Layer (if Earth-like)
    if (planetType === 'terran') {
      const cloudGeo = new THREE.SphereGeometry(this.radius * 1.025, 40, 40);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: createCloudsTexture(),
        transparent: true,
        opacity: 0.85,
        blending: THREE.NormalBlending,
        depthWrite: false
      });
      this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.group.add(this.cloudsMesh);
    }

    // 3. Atmospheric Rayleigh Scattering Fresnel Glow
    const atmosGeo = new THREE.SphereGeometry(this.radius * 1.15, 32, 32);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(uColor, intensity * 0.8);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(this.habit.atmosphereColor || color) }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.group.add(this.atmosphereMesh);

    // 4. Planetary Rings (e.g. Saturn & Purple Giant)
    if (hasRings) {
      const innerRadius = this.radius * 1.5;
      const outerRadius = this.radius * 2.8;
      const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
      
      // Remap UVs so gradient wraps radially
      const pos = ringGeo.attributes.position;
      const uvs = ringGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const r = Math.sqrt(x * x + y * y);
        const u = (r - innerRadius) / (outerRadius - innerRadius);
        uvs.setXY(i, u, 0.5);
      }

      const ringTexture = createRingsTexture(this.habit.color, '#ffffff');
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        roughness: 0.5
      });

      this.ringsMesh = new THREE.Mesh(ringGeo, ringMat);
      this.ringsMesh.rotation.x = Math.PI * 0.45;
      this.ringsMesh.rotation.y = Math.PI * 0.1;
      this.group.add(this.ringsMesh);
    }

    // 5. Orbiting Moon (Astronomy feature with natural lunar phase illumination)
    this.createMoon();

    // 6. Completion Energetic Pulse Ring (shows if completed today)
    this.createCompletionAura();

    // Apply planetary axial tilt
    this.group.rotation.z = (Math.PI / 180) * 15; // 15-23 deg tilt
  }

  createMoon() {
    this.moonGroup = new THREE.Group();
    const moonGeo = new THREE.SphereGeometry(this.radius * 0.24, 24, 24);
    
    // Moon crater surface
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.9,
      metalness: 0.05
    });

    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonDistance = this.radius * 2.8;
    this.moonMesh.position.set(this.moonDistance, 0, 0);
    this.moonGroup.add(this.moonMesh);
    this.group.add(this.moonGroup);
  }

  createCompletionAura() {
    const auraGeo = new THREE.RingGeometry(this.radius * 1.25, this.radius * 1.35, 48);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.auraMesh.rotation.x = Math.PI / 2;
    this.group.add(this.auraMesh);
  }

  update(delta, isCompletedToday) {
    // 1. Orbital Revolution around the Sun
    // Blueprint: streak determines speed (faster streak = faster planet orbit)
    const streakSpeedMultiplier = 1.0 + Math.min(3.0, (this.habit.streak || 1) * 0.07);
    const orbitSpeed = (this.habit.baseSpeed || 0.5) * 0.15 * streakSpeedMultiplier;
    this.orbitAngle += delta * orbitSpeed;

    const dist = this.habit.orbitDistance || 15;
    this.group.position.x = Math.cos(this.orbitAngle) * dist;
    this.group.position.z = Math.sin(this.orbitAngle) * dist;

    // 2. Axial Planetary Rotation
    if (this.mesh) {
      this.mesh.rotation.y += delta * 0.6;
    }
    // Independent cloud rotation
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += delta * 0.72;
    }

    // 3. Moon Orbit
    if (this.moonGroup) {
      this.moonAngle += delta * 1.8;
      this.moonGroup.rotation.y = this.moonAngle;
    }

    // 4. Energetic Aura if habit completed today
    if (this.auraMesh) {
      if (isCompletedToday) {
        this.auraMesh.material.opacity = 0.7 + Math.sin(Date.now() * 0.005) * 0.25;
        this.auraMesh.rotation.z += delta * 0.8;
      } else {
        this.auraMesh.material.opacity = 0;
      }
    }
  }

  setHighlight(isHighlighted) {
    if (this.atmosphereMesh && this.atmosphereMesh.material.uniforms) {
      this.atmosphereMesh.scale.setScalar(isHighlighted ? 1.28 : 1.15);
    }
  }

  getWorldPosition(targetVec) {
    return this.group.getWorldPosition(targetVec);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    if (this.cloudsMesh) {
      this.cloudsMesh.geometry.dispose();
      this.cloudsMesh.material.dispose();
    }
    if (this.atmosphereMesh) {
      this.atmosphereMesh.geometry.dispose();
      this.atmosphereMesh.material.dispose();
    }
    if (this.ringsMesh) {
      this.ringsMesh.geometry.dispose();
      this.ringsMesh.material.dispose();
    }
    this.scene.remove(this.group);
  }
}
