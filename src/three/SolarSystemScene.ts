import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SunModel } from './SunModel';
import { PlanetModel } from './PlanetModel';
import { OrbitPathsManager } from './Orbits';
import { DeepSpace } from './DeepSpace';
import { RankedHabit, SolarSystemSceneOptions } from '../types';

export class SolarSystemScene {
  public container: HTMLElement;
  public onPlanetClick: (habit: RankedHabit) => void;
  public onPlanetHover: (info: RankedHabit | null) => void;

  public planets: Map<string, PlanetModel>;
  public activeFocusHabitId: string | null = null;
  public isTrackingPlanet: boolean = false;

  public cameraTargetPosition: THREE.Vector3 = new THREE.Vector3(0, 35, 60);
  public controlsTargetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public isLerpingCamera: boolean = false;
  public lerpSpeed: number = 0.045;

  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public controls!: OrbitControls;
  public raycaster!: THREE.Raycaster;
  public mouse!: THREE.Vector2;
  public hoveredPlanetId: string | null = null;
  public clock!: THREE.Clock;

  public deepSpace!: DeepSpace;
  public sun!: SunModel;
  public orbitsManager!: OrbitPathsManager;

  public habits: RankedHabit[] = [];
  public completedChecker: ((id: string) => boolean) | null = null;
  public selectedHabitId: string | null = null;

  private animId: number = 0;
  private onResize!: () => void;
  private onMouseMove!: (e: MouseEvent) => void;
  private onClick!: (e: MouseEvent) => void;

  constructor(container: HTMLElement, options: SolarSystemSceneOptions = {}) {
    this.container = container;
    this.onPlanetClick = options.onPlanetClick || (() => {});
    this.onPlanetHover = options.onPlanetHover || (() => {});

    this.planets = new Map();

    this.initScene();
    this.initControls();
    this.initRaycaster();
    this.initObjects();
    this.bindEvents();
    this.animate();
  }

  private initScene(): void {
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

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 250;
    this.controls.maxPolarAngle = Math.PI * 0.88;
    this.controls.target.set(0, 0, 0);
  }

  private initRaycaster(): void {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredPlanetId = null;
  }

  private initObjects(): void {
    this.deepSpace = new DeepSpace(this.scene);
    this.sun = new SunModel(this.scene);
    this.orbitsManager = new OrbitPathsManager(this.scene);
  }

  public syncHabits(
    habits: RankedHabit[],
    completedChecker: (id: string) => boolean,
    selectedHabitId: string | null
  ): void {
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

  public focusPlanet(habitId: string): void {
    const planet = this.planets.get(habitId);
    if (!planet) return;

    this.activeFocusHabitId = habitId;
    this.isTrackingPlanet = true;
    this.isLerpingCamera = true;
  }

  public setCameraOverview(): void {
    this.activeFocusHabitId = null;
    this.isTrackingPlanet = false;
    this.isLerpingCamera = true;
    this.cameraTargetPosition.set(0, 35, 60);
    this.controlsTargetPosition.set(0, 0, 0);
  }

  public setCameraTactical(): void {
    this.activeFocusHabitId = null;
    this.isTrackingPlanet = false;
    this.isLerpingCamera = true;
    this.cameraTargetPosition.set(0, 95, 0.1);
    this.controlsTargetPosition.set(0, 0, 0);
  }

  private bindEvents(): void {
    this.onResize = () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.onResize);

    this.onMouseMove = (e: MouseEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkIntersection();
    };
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);

    this.onClick = (e: MouseEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleSceneClick(clickX, clickY);
    };
    this.renderer.domElement.addEventListener('click', this.onClick);
  }

  private checkIntersection(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes: THREE.Object3D[] = [];
    for (const [, planet] of this.planets) {
      if (planet.mesh) meshes.push(planet.mesh);
    }

    const intersects = this.raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const habitId = hitMesh.userData.habitId;
      if (this.hoveredPlanetId !== habitId) {
        if (this.hoveredPlanetId && this.planets.has(this.hoveredPlanetId)) {
          this.planets.get(this.hoveredPlanetId)!.setHighlight(false);
        }
        this.hoveredPlanetId = habitId;
        if (this.planets.has(habitId)) {
          this.planets.get(habitId)!.setHighlight(true);
          const habit = hitMesh.userData.habit;
          this.onPlanetHover(habit);
        }
      }
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      if (this.hoveredPlanetId) {
        if (this.planets.has(this.hoveredPlanetId)) {
          this.planets.get(this.hoveredPlanetId)!.setHighlight(false);
        }
        this.hoveredPlanetId = null;
        this.onPlanetHover(null);
      }
      this.renderer.domElement.style.cursor = 'default';
    }
  }

  private handleSceneClick(mouseX: number, mouseY: number): void {
    const clickRay = new THREE.Raycaster();
    clickRay.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);

    const meshes: THREE.Object3D[] = [];
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

  private animate = (): void => {
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

  public dispose(): void {
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
