import * as THREE from 'three';

/**
 * DeepSpace - Astronomical Starfield
 * Implements Phase 3 Design Guidelines:
 * - Sparse stars (approx 1,200), varied size and brightness
 * - Tinted between #FFE9D0 (warm star) and #CFE0FF (cool white star)
 * - Zero purple/violet gradients
 */

export class DeepSpace {
  constructor(scene) {
    this.scene = scene;
    this.createSparseStarfield();
  }

  createSparseStarfield() {
    const starCount = 1200; // Sparse starfield
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    // Warm star tint #FFE9D0
    const warmTint = new THREE.Color('#FFE9D0');
    // Cool star tint #CFE0FF
    const coolTint = new THREE.Color('#CFE0FF');

    for (let i = 0; i < starCount; i++) {
      // Distribute sparsely across spherical shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 450 + Math.random() * 350;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Interpolate between warm #FFE9D0 and cool #CFE0FF
      const blend = Math.random();
      const col = new THREE.Color().copy(warmTint).lerp(coolTint, blend);

      // Varied brightness (0.35 to 1.0)
      const brightness = 0.35 + Math.random() * 0.65;
      colors[i * 3] = col.r * brightness;
      colors[i * 3 + 1] = col.g * brightness;
      colors[i * 3 + 2] = col.b * brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Star point sprite with soft natural optical falloff
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({
      size: 2.0,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  update(delta) {
    if (this.stars) {
      // Extremely slow cosmic sphere rotation
      this.stars.rotation.y += delta * 0.001;
    }
  }

  dispose() {
    if (this.stars) {
      this.stars.geometry.dispose();
      this.stars.material.dispose();
      this.scene.remove(this.stars);
    }
  }
}
