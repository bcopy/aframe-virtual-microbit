import { html, render } from 'lit-html';
import { Subject, BehaviorSubject } from 'rxjs';
import 'aframe';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-light': any;
    }
  }
}

interface AFrameComponentInitializedEvent extends Event {
  detail: {
    name: string;
    data: any;
    target: AFrameEntity;
  };
}

interface AFrameComponent {
  el: AFrameEntity;
  [key: string]: any;
}

interface AFrameEntity extends HTMLElement {
  object3D: THREE.Object3D;
  setAttribute: (name: string, value: any) => void;
  getAttribute: (name: string) => any;
  components: {
    [key: string]: AFrameComponent;
  };
}


export class VirtualMicrobit {
  private buttonASubject: BehaviorSubject<boolean>;
  private buttonBSubject: BehaviorSubject<boolean>;
  private buttonABSubject: BehaviorSubject<boolean>;
  private displaySubject: Subject<string>;
  private accelerometerSubject: Subject<{x: number, y: number, z: number}>;
  private compassSubject: Subject<number>;

  private scene: AFrameEntity;
  private ledEntities: AFrameEntity[] = [];

  constructor(private container: HTMLElement) {
    this.buttonASubject = new BehaviorSubject<boolean>(false);
    this.buttonBSubject = new BehaviorSubject<boolean>(false);
    this.buttonABSubject = new BehaviorSubject<boolean>(false);
    this.displaySubject = new Subject<string>();
    this.accelerometerSubject = new Subject<{x: number, y: number, z: number}>();
    this.compassSubject = new Subject<number>();

    this.scene = document.createElement('a-scene') as AFrameEntity;
    this.initializeAFrame();
    this.initializeAccelerometer();
    this.initializeCompass();
    this.setupResizeHandler();
  }

  private initializeAFrame() {
    this.scene.setAttribute('embedded', '');
    
    const sceneTemplate = html`
      <a-assets>
        <a-asset-item id="microbit-model" src="assets/microbit.glb"></a-asset-item>
      </a-assets>

      <a-entity id="microbit-group" position="0 0 -0.5">
        <a-entity id="microbit-model" gltf-model="#microbit-model" position="0 -3 -30" rotation="0 0 0" scale="1 1 1"></a-entity>
        ${this.createLEDDisplay()}
        ${this.createButtons()}
      </a-entity>

      <a-entity camera position="0 0 0" look-controls="enabled: false" wasd-controls="enabled: false"></a-entity>
      
      <a-light type="ambient" color="#BBB"></a-light>
      <a-light type="directional" color="#FFF" intensity="0.6" position="-0.5 1 1"></a-light>
    `;

    render(sceneTemplate, this.scene);
    this.container.appendChild(this.scene);
  }

  private createLEDDisplay() {
    return html`
      <a-entity id="led-display" position="0 0.02 0.01">
        ${[...Array(5)].map((_, i) =>
          [...Array(5)].map((_, j) => html`
            <a-entity
              geometry="primitive: sphere; radius: 0.005"
              material="color: #300000; emissive: #300000"
              position="${(j - 2) * 0.015} ${(2 - i) * 0.015} 0"
              @created=${(e: CustomEvent) => this.ledEntities.push(e.target as AFrameEntity)}
            ></a-entity>
          `)
        )}
      </a-entity>
    `;
  }

  private createButtons() {
    return html`
      <a-entity
        id="button-a"
        geometry="primitive: cylinder; radius: 0.01; height: 0.005"
        material="color: #4CAF50"
        position="-0.04 -0.04 0.01"
        text="value: A; align: center; width: 0.1; color: white; zOffset: 0.003"
        @mousedown=${() => this.buttonPress('A', true)}
        @mouseup=${() => this.buttonPress('A', false)}
        @mouseleave=${() => this.buttonPress('A', false)}
      ></a-entity>
      <a-entity
        id="button-b"
        geometry="primitive: cylinder; radius: 0.01; height: 0.005"
        material="color: #4CAF50"
        position="0.04 -0.04 0.01"
        text="value: B; align: center; width: 0.1; color: white; zOffset: 0.003"
        @mousedown=${() => this.buttonPress('B', true)}
        @mouseup=${() => this.buttonPress('B', false)}
        @mouseleave=${() => this.buttonPress('B', false)}
      ></a-entity>
    `;
  }

  private buttonPress(button: 'A' | 'B', isPressed: boolean) {
    const buttonEntity = this.scene.querySelector(`#button-${button.toLowerCase()}`) as AFrameEntity;
    buttonEntity.setAttribute('material', `color: ${isPressed ? '#45a049' : '#4CAF50'}`);

    if (button === 'A') {
      this.buttonASubject.next(isPressed);
    } else {
      this.buttonBSubject.next(isPressed);
    }

    const aPressed = this.buttonASubject.value;
    const bPressed = this.buttonBSubject.value;
    this.buttonABSubject.next(aPressed && bPressed);
  }

  private setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.centerElements();
    });
  }

  private centerElements() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    const camera = this.scene.querySelector('[camera]') as AFrameEntity;
    
    if (camera) {
      camera.setAttribute('aspect', aspect.toString());
      camera.setAttribute('fov', '60');
      
      if (camera.components && camera.components.camera) {
        const cameraComponent = camera.components.camera;
        if (cameraComponent.camera && typeof cameraComponent.camera.updateProjectionMatrix === 'function') {
          cameraComponent.camera.updateProjectionMatrix();
        }
      }
    }

    // Scale the Micro:bit group to fit the view
    const microbitGroup = this.scene.querySelector('#microbit-group') as AFrameEntity;
    if (microbitGroup) {
      const scale = Math.min(width, height) / 1000; // Adjust this factor as needed
      microbitGroup.setAttribute('scale', `${scale} ${scale} ${scale}`);
    }

    // Force A-Frame to update the canvas size
    const sceneEl = this.scene as any;
    if (sceneEl.resize) {
      sceneEl.resize();
    }
  }

  private initializeAccelerometer() {
    // Implement accelerometer logic using device orientation API if available
  }

  private initializeCompass() {
    // Implement compass logic using device orientation API if available
  }

  public setDisplay(pattern: string) {
    const rows = pattern.split('\n');
    rows.forEach((row, i) => {
      for (let j = 0; j < row.length; j++) {
        const index = i * 5 + j;
        if (index < this.ledEntities.length) {
          const brightness = row[j] === '#' ? 1 : 0;
          this.ledEntities[index].setAttribute('material', `emissive: #${brightness.toString(16).repeat(2)}0000`);
        }
      }
    });
    this.displaySubject.next(pattern);
  }
  
  public onButtonA() {
    return this.buttonASubject.asObservable();
  }

  public onButtonB() {
    return this.buttonBSubject.asObservable();
  }

  public onButtonAB() {
    return this.buttonABSubject.asObservable();
  }

  public onDisplayChange() {
    return this.displaySubject.asObservable();
  }

  public onAccelerometerChange() {
    return this.accelerometerSubject.asObservable();
  }

  public onCompassChange() {
    return this.compassSubject.asObservable();
  }
}