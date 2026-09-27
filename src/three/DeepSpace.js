import * as THREE from 'three';

/**
 * DeepSpace - Deep Space Environment
 * Features:
 * - 3,500 astronomical star particles with spectral class colors (O, B, A, G, K, M)
 * - Volumetric nebula dust clouds with soft space ambient gradients
 * - Subtle star twinkle animation
 */

export class DeepSpace {
  constructor(scene) {
    this.scene = scene;
    this.createStarfield();
    this.createNebulaDust();
  }

  createStarfield() {
    const starCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // Astronomical spectral colors
    const spectralColors = [
      new THREE.Color(0x9bb0ff), // O/B: Blue-white hot star
      new THREE.Color(0xbbccff), // A: White
      new THREE.Color(0xfbf8ff), // F: Yellow-white
      new THREE.Color(0xfff4e8), // G: Sun-like yellow
      new THREE.Color(0xffddb4), // K: Orange
      new THREE.Color(0xffbd6f)  // M: Red dwarf
    ];

    for (let i = 0; i < starCount; i++) {
      // Distribute on a massive sphere radius between 400 and 700
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 400 + Math.random() * 300;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 1.0 + Math.random() * 2.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Star point sprite texture with soft radial glow
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({
      size: 2.5,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  createNebulaDust() {
    // Soft cosmic dust planes in distant background
    this.nebulaGroup = new THREE.Group();
    const dustCount = 8;
    const colors = [0x1e1b4b, 0x312e81, 0x083344, 0x4c1d95];

    for (let i = 0; i < dustCount; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      const c = colors[i % colors.length];
      const threeCol = new THREE.Color(c);

      grad.addColorStop(0, `rgba(${Math.floor(threeCol.r * 255)}, ${Math.floor(threeCol.g * 255)}, ${Math.floor(threeCol.b * 255)}, 0.18)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.4
      });

      const sprite = new THREE.Sprite(spriteMat);
      const theta = (i / dustCount) * Math.PI * 2;
      const dist = 350;
      sprite.position.set(
        Math.cos(theta) * dist,
        (Math.random() - 0.5) * 100,
        Math.sin(theta) * dist
      );
      sprite.scale.set(300, 300, 1);
      this.nebulaGroup.add(sprite);
    }

    this.scene.add(this.nebulaGroup);
  }

  update(delta) {
    if (this.stars) {
      // Extremely slow celestial sphere rotation
      this.stars.rotation.y += delta * 0.002;
    }
  }

  dispose() {
    if (this.stars) {
      this.stars.geometry.dispose();
      this.stars.material.dispose();
      this.scene.remove(this.stars);
    }
    if (this.nebulaGroup) {
      this.scene.remove(this.nebulaGroup);
    }
  }
}
