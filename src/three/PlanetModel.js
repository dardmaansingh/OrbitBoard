import * as THREE from 'three';
import { getCategoryColor } from '../utils/ranking';

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function createTerranTexture(baseColorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#101726');
  oceanGrad.addColorStop(0.5, '#1e293b');
  oceanGrad.addColorStop(1, '#101726');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = baseColorHex;
  for (let i = 0; i < 24; i++) {
    const cx = (Math.sin(i * 123.4) * 0.5 + 0.5) * 1024;
    const cy = (Math.cos(i * 45.6) * 0.4 + 0.5) * 512;
    const radius = 60 + (i % 5) * 25;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#26221c';
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 4, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = baseColorHex;
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 1024, 32);
  ctx.fillRect(0, 480, 1024, 32);

  return new THREE.CanvasTexture(canvas);
}

function createCloudsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 512);

  ctx.fillStyle = 'rgba(235, 230, 220, 0.55)';
  for (let i = 0; i < 60; i++) {
    const cx = (Math.sin(i * 78.9) * 0.5 + 0.5) * 1024;
    const cy = (Math.cos(i * 92.1) * 0.4 + 0.5) * 512;
    const rx = 50 + (i % 6) * 28;
    const ry = 16 + (i % 4) * 10;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.sin(i) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createGasGiantTexture(colorA, colorB, stormColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  for (let y = 0; y <= 512; y += 32) {
    const factor = y / 512;
    const c = Math.sin(factor * Math.PI * 8) > 0 ? colorA : colorB;
    grad.addColorStop(factor, c);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = stormColor;
  ctx.beginPath();
  ctx.ellipse(650, 310, 70, 36, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 35; i++) {
    const y = 80 + (i * 11) % 360;
    ctx.fillRect(0, y, 1024, 3 + (i % 4));
  }

  return new THREE.CanvasTexture(canvas);
}

function createCrateredTexture(baseColorHex, darkHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 1024, 512);

  for (let i = 0; i < 90; i++) {
    const cx = (Math.sin(i * 37.1) * 0.5 + 0.5) * 1024;
    const cy = (Math.cos(i * 83.3) * 0.5 + 0.5) * 512;
    const r = 6 + (i % 7) * 7;

    ctx.fillStyle = darkHex;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 2, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function createRingsTexture(primaryColorHex, secondaryColorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.12, primaryColorHex);
  grad.addColorStop(0.45, secondaryColorHex);
  grad.addColorStop(0.52, 'rgba(0, 0, 0, 0.1)'); 
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

    const initialRadius = Number(this.habit.orbitDistance) || 16.0;
    this.currentRadius = initialRadius;
    this.targetRadius = initialRadius;
    this.startRadius = initialRadius;
    this.transitionProgress = 1.0;
    this.transitionDuration = 1.5; 

    this.initPlanet();
    this.scene.add(this.group);
  }

  initPlanet() {
    const { category, completionRate = 50, monthlyCompletion = 50, hasRings } = this.habit;
    const categoryColor = getCategoryColor(category);

    const completion = monthlyCompletion != null ? monthlyCompletion : completionRate;
    const scaleFactor = 0.75 + (Math.max(0, Math.min(100, completion)) / 100) * 0.55;
    this.baseRadius = 1.4;
    this.radius = this.baseRadius * scaleFactor;

    let surfaceTexture;
    let roughness = 0.6;
    let metalness = 0.08;

    switch (category) {
      case 'Health':
      case 'Fitness':
      case 'Health / Fitness':
        
        surfaceTexture = createCrateredTexture('#C1583A', '#722b18');
        roughness = 0.75;
        break;
      case 'Knowledge':
        
        surfaceTexture = createGasGiantTexture('#5c3c13', '#D4A55A', '#8f6828');
        break;
      case 'Mindfulness':
        
        surfaceTexture = createTerranTexture('#4E9F98');
        roughness = 0.45;
        break;
      case 'Focus':
        
        surfaceTexture = createGasGiantTexture('#1b2d4b', '#4A6FA5', '#2a4369');
        roughness = 0.35;
        break;
      case 'Creativity':
        
        surfaceTexture = createGasGiantTexture('#542431', '#B5667A', '#7a3b4c');
        break;
      case 'Other':
      default:
        
        surfaceTexture = createGasGiantTexture('#4d3725', '#B08D6E', '#78563c');
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

    if (category === 'Mindfulness') {
      const cloudGeo = new THREE.SphereGeometry(this.radius * 1.025, 36, 36);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: createCloudsTexture(),
        transparent: true,
        opacity: 0.65,
        blending: THREE.NormalBlending,
        depthWrite: false
      });
      this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.group.add(this.cloudsMesh);
    }

    const atmosGeo = new THREE.SphereGeometry(this.radius * 1.12, 32, 32);
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
          float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6) * 1.1;
          gl_FragColor = vec4(uColor, intensity);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(categoryColor) }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.group.add(this.atmosphereMesh);

    if (hasRings || category === 'Knowledge' || category === 'Creativity') {
      this.createPlanetaryRings(categoryColor);
    }

    this.createNaturalMoon();

    this.createCompletionAura();
  }

  createPlanetaryRings(primaryColorHex) {
    const innerRadius = this.radius * 1.45;
    const outerRadius = this.radius * 2.3;
    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);

    const pos = ringGeo.attributes.position;
    const uvs = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const d = Math.sqrt(x * x + y * y);
      const u = (d - innerRadius) / (outerRadius - innerRadius);
      uvs.push(u, 0.5);
    }
    ringGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    const ringMat = new THREE.MeshStandardMaterial({
      map: createRingsTexture(primaryColorHex, '#1c1815'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      roughness: 0.7,
      metalness: 0.1
    });

    this.ringsMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringsMesh.rotation.x = Math.PI * 0.42;
    this.ringsMesh.rotation.y = Math.PI * 0.08;
    this.ringsMesh.receiveShadow = true;
    this.group.add(this.ringsMesh);
  }

  createNaturalMoon() {
    this.moonGroup = new THREE.Group();
    const moonRadius = this.radius * 0.22;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 24, 24);

    const moonMat = new THREE.MeshStandardMaterial({
      color: 0x948f88,
      roughness: 0.9,
      metalness: 0.05
    });

    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonDistance = this.radius * 2.7;
    this.moonMesh.position.set(this.moonDistance, 0, 0);
    this.moonMesh.castShadow = true;
    this.moonMesh.receiveShadow = true;

    this.moonGroup.add(this.moonMesh);
    this.group.add(this.moonGroup);
  }

  createCompletionAura() {
    const auraGeo = new THREE.RingGeometry(this.radius * 1.25, this.radius * 1.32, 48);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xf2a33a, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.auraMesh.rotation.x = Math.PI / 2;
    this.group.add(this.auraMesh);
  }

  setTargetRadius(newRadius) {
    const target = Number(newRadius);
    if (!isNaN(target) && Math.abs(target - this.targetRadius) > 0.01) {
      this.startRadius = this.currentRadius;
      this.targetRadius = target;
      this.transitionProgress = 0.0;
    }
  }

  updateHabitData(newHabit) {
    this.habit = newHabit;
    if (newHabit.orbitDistance != null) {
      this.setTargetRadius(newHabit.orbitDistance);
    }

    const completion = newHabit.monthlyCompletion != null ? newHabit.monthlyCompletion : newHabit.completionRate;
    const scaleFactor = 0.75 + (Math.max(0, Math.min(100, completion || 50)) / 100) * 0.55;
    const newRadius = this.baseRadius * scaleFactor;
    if (Math.abs(newRadius - this.radius) > 0.02) {
      this.radius = newRadius;
      const ratio = this.radius / (this.baseRadius * 0.75);
      this.mesh.scale.setScalar(ratio);
      if (this.cloudsMesh) this.cloudsMesh.scale.setScalar(ratio);
      if (this.atmosphereMesh) this.atmosphereMesh.scale.setScalar(ratio);
    }
  }

  update(delta, isCompletedToday) {
    
    if (this.transitionProgress < 1.0) {
      this.transitionProgress += delta / this.transitionDuration;
      if (this.transitionProgress > 1.0) {
        this.transitionProgress = 1.0;
      }
      const t = easeOutCubic(this.transitionProgress);
      this.currentRadius = this.startRadius + (this.targetRadius - this.startRadius) * t;
    } else {
      this.currentRadius = this.targetRadius;
    }

    const safeRadius = Math.max(8.0, this.currentRadius);
    const angularSpeed = 18.0 * Math.pow(safeRadius, -1.5);

    this.orbitAngle += delta * angularSpeed;

    this.group.position.x = Math.cos(this.orbitAngle) * this.currentRadius;
    this.group.position.z = Math.sin(this.orbitAngle) * this.currentRadius;

    if (this.mesh) {
      this.mesh.rotation.y += delta * 0.45;
    }
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += delta * 0.55;
    }

    if (this.moonGroup) {
      this.moonAngle += delta * 1.5;
      this.moonGroup.rotation.y = this.moonAngle;
    }

    if (this.auraMesh) {
      if (isCompletedToday) {
        this.auraMesh.material.opacity = 0.45 + Math.sin(Date.now() * 0.003) * 0.15;
        this.auraMesh.rotation.z += delta * 0.4;
      } else {
        this.auraMesh.material.opacity = 0.0;
      }
    }
  }

  setHighlight(isHighlighted) {
    if (this.atmosphereMesh) {
      this.atmosphereMesh.scale.setScalar(isHighlighted ? 1.25 : 1.12);
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
    if (this.auraMesh) {
      this.auraMesh.geometry.dispose();
      this.auraMesh.material.dispose();
    }
    this.scene.remove(this.group);
  }
}
