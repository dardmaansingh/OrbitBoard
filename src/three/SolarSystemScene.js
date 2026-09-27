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

    this.planets = new Map(); // habitId -> PlanetModel
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
    this.scene.background = new THREE.Color(0x020617);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(0, 35, 60);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
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

    // Disable target tracking if user manually drags camera
    this.controls.addEventListener('start', () => {
      if (this.isTrackingPlanet) {
        // User taking over control, keep focus but unlock strict tracking
      }
    });
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredPlanetId = null;
  }

  initObjects() {
    // 1. Deep Space Starfield & Nebulae
    this.deepSpace = new DeepSpace(this.scene);

    // 2. Photorealistic Central Sun
    this.sun = new SunModel(this.scene);

    // 3. Orbit Paths Manager
    this.orbitsManager = new OrbitPathsManager(this.scene);
  }

  syncHabits(habits, completedChecker, selectedHabitId) {
    this.habits = habits;
    this.completedChecker = completedChecker;
    this.selectedHabitId = selectedHabitId;

    // Remove deleted planets
    const currentIds = new Set(habits.map(h => h.id));
    for (const [id, planet] of this.planets.entries()) {
      if (!currentIds.has(id)) {
        planet.dispose();
        this.planets.delete(id);
      }
    }

    // Add or update planets
    habits.forEach(habit => {
      let planet = this.planets.get(habit.id);
      if (!planet) {
        planet = new PlanetModel(this.scene, habit);
        this.planets.set(habit.id, planet);
      } else {
        planet.habit = habit;
      }
    });

    // Update orbit lines
    this.orbitsManager.updateOrbits(habits, selectedHabitId);
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
      this.checkHover(e.clientX, e.clientY);
    };
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);

    this.onClick = (e) => {
      this.checkClick(e);
    };
    this.renderer.domElement.addEventListener('click', this.onClick);
  }

  checkHover(screenX, screenY) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check against all planet meshes
    const meshes = [];
    for (const [, planet] of this.planets) {
      if (planet.mesh) meshes.push(planet.mesh);
    }

    const intersects = this.raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const habit = hit.userData.habit;
      if (habit) {
        this.hoveredPlanetId = habit.id;
        this.container.style.cursor = 'pointer';
        this.onPlanetHover({
          habit,
          screenX,
          screenY,
          visible: true
        });
        return;
      }
    }

    if (this.hoveredPlanetId) {
      this.hoveredPlanetId = null;
      this.container.style.cursor = 'default';
      this.onPlanetHover({ visible: false });
    }
  }

  checkClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const clickRay = new THREE.Raycaster();
    clickRay.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);

    const meshes = [];
    for (const [, planet] of this.planets) {
      if (planet.mesh) meshes.push(planet.mesh);
    }

    const intersects = clickRay.intersectObjects(meshes);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const habit = hit.userData.habit;
      if (habit) {
        this.focusPlanet(habit.id);
        this.onPlanetClick(habit);
      }
    }
  }

  animate = () => {
    this.animId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // 1. Update Sun & Deep Space
    if (this.sun) this.sun.update(delta);
    if (this.deepSpace) this.deepSpace.update(delta);

    // 2. Update Planets
    for (const [id, planet] of this.planets.entries()) {
      const isDone = this.completedChecker ? this.completedChecker(id) : false;
      planet.update(delta, isDone);
    }

    // 3. Camera Fly-To & Tracking Logic
    if (this.activeFocusHabitId) {
      const targetPlanet = this.planets.get(this.activeFocusHabitId);
      if (targetPlanet) {
        const planetPos = new THREE.Vector3();
        targetPlanet.getWorldPosition(planetPos);

        // Position camera smoothly at an offset close to the planet
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
          // Keep target updated as planet orbits
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
