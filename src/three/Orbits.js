import * as THREE from 'three';

export class OrbitPathsManager {
  constructor(scene) {
    this.scene = scene;
    this.orbitMeshes = new Map(); 
    this.unitGeometry = this.createUnitCircleGeometry();
  }

  createUnitCircleGeometry() {
    const segments = 180;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }

  updateOrbits(habits, selectedId, planetsMap) {
    const currentIds = new Set(habits.map(h => h.id));

    for (const [id, mesh] of this.orbitMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        mesh.material.dispose();
        this.orbitMeshes.delete(id);
      }
    }

    habits.forEach(habit => {
      let orbit = this.orbitMeshes.get(habit.id);
      const isRank1 = habit.rank === 1;
      const isSelected = habit.id === selectedId;

      if (!orbit) {
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(0xffffff),
          transparent: true,
          opacity: 0.07,
          depthWrite: false
        });

        orbit = new THREE.Line(this.unitGeometry, material);
        orbit.rotation.x = 0;
        this.scene.add(orbit);
        this.orbitMeshes.set(habit.id, orbit);
      }

      if (isRank1) {
        orbit.material.color.setStyle(habit.color || '#F2A33A');
        orbit.material.opacity = 0.35;
      } else if (isSelected) {
        orbit.material.color.setStyle(habit.color || '#E8E4DC');
        orbit.material.opacity = 0.28;
      } else {
        orbit.material.color.setHex(0xffffff);
        orbit.material.opacity = 0.07; 
      }

      const planet = planetsMap ? planetsMap.get(habit.id) : null;
      const radius = planet ? planet.currentRadius : (habit.orbitDistance || 16);
      orbit.scale.set(radius, 1, radius);
    });
  }

  syncRadii(planetsMap) {
    if (!planetsMap) return;
    for (const [id, mesh] of this.orbitMeshes.entries()) {
      const planet = planetsMap.get(id);
      if (planet) {
        mesh.scale.set(planet.currentRadius, 1, planet.currentRadius);
      }
    }
  }

  dispose() {
    for (const [, mesh] of this.orbitMeshes.entries()) {
      this.scene.remove(mesh);
      mesh.material.dispose();
    }
    this.orbitMeshes.clear();
    if (this.unitGeometry) {
      this.unitGeometry.dispose();
    }
  }
}
