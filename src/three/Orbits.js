import * as THREE from 'three';

/**
 * Orbits - Luminous Planetary Orbit Paths
 * Features:
 * - Geometric elliptical/circular orbit rings
 * - Interactive hover & selection neon glow
 * - Subtle celestial dash/dot patterns
 */

export class OrbitPathsManager {
  constructor(scene) {
    this.scene = scene;
    this.orbitMeshes = new Map(); // habitId -> mesh
  }

  updateOrbits(habits, selectedId) {
    // Clean up old orbits that no longer exist
    const currentIds = new Set(habits.map(h => h.id));
    for (const [id, mesh] of this.orbitMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.orbitMeshes.delete(id);
      }
    }

    // Create or update orbits
    habits.forEach(habit => {
      const isSelected = habit.id === selectedId;
      const radius = habit.orbitDistance || 15;

      let orbit = this.orbitMeshes.get(habit.id);
      if (!orbit) {
        // Create circle line geometry
        const segments = 128;
        const points = [];
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(habit.color || 0x38bdf8),
          transparent: true,
          opacity: 0.22,
          linewidth: 1
        });

        orbit = new THREE.Line(geometry, material);
        orbit.rotation.x = 0;
        this.scene.add(orbit);
        this.orbitMeshes.set(habit.id, orbit);
      }

      // Update appearance based on active selection
      if (isSelected) {
        orbit.material.opacity = 0.85;
        orbit.material.color.setHex(0x38bdf8);
      } else {
        orbit.material.opacity = 0.22;
        orbit.material.color.setStyle(habit.color || '#38bdf8');
      }
    });
  }

  dispose() {
    for (const [, mesh] of this.orbitMeshes.entries()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.orbitMeshes.clear();
  }
}
