import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SunModel } from './SunModel';
import { PlanetModel } from './PlanetModel';
import { OrbitPathsManager } from './Orbits';
import { DeepSpace } from './DeepSpace';

export class SolarSystemScene {
  constructor(container, options = {}) {
    this.container = container;
    this.onPlanetClick = options.onPlanetClick || (() => {});
    this.onPlanetHover = options.onPlanetHover || (() => {});

    this.planets = new Map(); 
    this.activeFocusHabitId = null;
    this.isTrackingPlanet = false;

    this.cameraTargetPosition = new THREE.Vector3(0, 35, 60);
    this.controlsTargetPosition = new THREE.Vector3(0, 0, 0);
    this.isLerpingCamera = false;
    this.lerpSpeed = 0.045;

    this.initScene();
    this.initControls();
    this.initRaycaster();
    this.initObjects();
    this.bindEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    
    this.scene.background = null;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(0, 35, 60);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 250;
    this.controls.maxPolarAngle = Math.PI * 0.88;
    this.controls.target.set(0, 0, 0);

    this.controls.addEventListener('start', () => {
      if (this.isTrackingPlanet) {
        
      }
    });
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredPlanetId = null;
  }

  initObjects() {
    
    this.deepSpace = new DeepSpace(this.scene);

    this.sun = new SunModel(this.scene);

    this.orbitsManager = new OrbitPathsManager(this.scene);
  }

  syncHabits(habits, completedChecker, selectedHabitId) {
    this.habits = habits;
    this.completedChecker = completedChecker;
    this.selectedHabitId = selectedHabitId;

    const currentIds = new Set(habits.map(h => h.id));
    for (const [id, planet] of this.planets.entries()) {
      if (!currentIds.has(id)) {
        planet.dispose();
        this.planets.delete(id);
      }
    }

    habits.forEach(habit => {
      let planet = this.planets.get(habit.id);
      if (!planet) {
        planet = new PlanetModel(this.scene, habit);
        this.planets.set(habit.id, planet);
      } else {
        planet.updateHabitData(habit);
      }
    });

    this.orbitsManager.updateOrbits(habits, selectedHabitId, this.planets);
  }

  focusPlanet(habitId) {
    const planet = this.planets.get(habitId);
    if (!planet) return;

    this.activeFocusHabitId = habitId;
    this.isTrackingPlanet = true;
    this.isLerpingCamera = true;
  }

  setCameraOverview() {
    this.activeFocusHabitId = null;
    this.isTrackingPlanet = false;
    this.isLerpingCamera = true;
    this.cameraTargetPosition.set(0, 35, 60);
    this.controlsTargetPosition.set(0, 0, 0);
  }

  setCameraTactical() {
    this.activeFocusHabitId = null;
    this.isTrackingPlanet = false;
    this.isLerpingCamera = true;
    this.cameraTargetPosition.set(0, 95, 0.1);
    this.controlsTargetPosition.set(0, 0, 0);
  }

  bindEvents() {
    this.onResize = () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.onResize);

    this.onMouseMove = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkIntersection();
    };
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);

    this.onClick = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleSceneClick(clickX, clickY);
    };
    this.renderer.domElement.addEventListener('click', this.onClick);
  }

  checkIntersection() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = [];
    for (const [, planet] of this.planets) {
      if (planet.mesh) meshes.push(planet.mesh);
    }

    const intersects = this.raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const habitId = hitMesh.userData.habitId;
      if (this.hoveredPlanetId !== habitId) {
        if (this.hoveredPlanetId && this.planets.has(this.hoveredPlanetId)) {
          this.planets.get(this.hoveredPlanetId).setHighlight(false);
        }
        this.hoveredPlanetId = habitId;
        if (this.planets.has(habitId)) {
          this.planets.get(habitId).setHighlight(true);
          const habit = hitMesh.userData.habit;
          this.onPlanetHover(habit);
        }
      }
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      if (this.hoveredPlanetId) {
        if (this.planets.has(this.hoveredPlanetId)) {
          this.planets.get(this.hoveredPlanetId).setHighlight(false);
        }
        this.hoveredPlanetId = null;
        this.onPlanetHover(null);
      }
      this.renderer.domElement.style.cursor = 'default';
    }
  }

  handleSceneClick(mouseX, mouseY) {
    const clickRay = new THREE.Raycaster();
    clickRay.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);

    const meshes = [];
    for (const [, planet] of this.planets) {
      if (planet.mesh) meshes.push(planet.mesh);
    }

    const intersects = clickRay.intersectObjects(meshes);
    if (intersects.length > 0) {
      const habit = intersects[0].object.userData.habit;
      if (habit) {
        this.focusPlanet(habit.id);
        this.onPlanetClick(habit);
      }
    }
  }

  animate = () => {
    this.animId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    if (this.sun) this.sun.update(delta);
    if (this.deepSpace) this.deepSpace.update(delta);

    for (const [id, planet] of this.planets.entries()) {
      const isDone = this.completedChecker ? this.completedChecker(id) : false;
      planet.update(delta, isDone);
    }

    if (this.orbitsManager) {
      this.orbitsManager.syncRadii(this.planets);
    }

    if (this.activeFocusHabitId) {
      const targetPlanet = this.planets.get(this.activeFocusHabitId);
      if (targetPlanet) {
        const planetPos = new THREE.Vector3();
        targetPlanet.getWorldPosition(planetPos);

        const offset = new THREE.Vector3(
          targetPlanet.radius * 2.8,
          targetPlanet.radius * 1.5,
          targetPlanet.radius * 3.2
        );
        const targetCamPos = planetPos.clone().add(offset);

        if (this.isLerpingCamera) {
          this.camera.position.lerp(targetCamPos, this.lerpSpeed);
          this.controls.target.lerp(planetPos, this.lerpSpeed);

          if (this.camera.position.distanceTo(targetCamPos) < 0.2) {
            this.isLerpingCamera = false;
          }
        } else if (this.isTrackingPlanet) {
          const shift = planetPos.clone().sub(this.controls.target);
          this.camera.position.add(shift);
          this.controls.target.copy(planetPos);
        }
      }
    } else if (this.isLerpingCamera) {
      this.camera.position.lerp(this.cameraTargetPosition, this.lerpSpeed);
      this.controls.target.lerp(this.controlsTargetPosition, this.lerpSpeed);

      if (this.camera.position.distanceTo(this.cameraTargetPosition) < 0.2) {
        this.isLerpingCamera = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.domElement.removeEventListener('click', this.onClick);

    if (this.sun) this.sun.dispose();
    if (this.deepSpace) this.deepSpace.dispose();
    if (this.orbitsManager) this.orbitsManager.dispose();

    for (const [, planet] of this.planets) {
      planet.dispose();
    }
    this.planets.clear();

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
