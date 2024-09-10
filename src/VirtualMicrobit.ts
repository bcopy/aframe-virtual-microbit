import { html, render } from 'lit-html';
import { Subject, BehaviorSubject } from 'rxjs';
import 'aframe';

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

export class VirtualMicrobit {
  private buttonASubject: BehaviorSubject<boolean>;
  private buttonBSubject: BehaviorSubject<boolean>;
  private buttonABSubject: BehaviorSubject<boolean>;
  private displaySubject: Subject<string>;
  private accelerometerSubject: Subject<{x: number, y: number, z: number}>;
  private compassSubject: Subject<number>;

  private scene: HTMLElement;
  private ledEntities: HTMLElement[];

  constructor(private container: HTMLElement) {
    this.buttonASubject = new BehaviorSubject<boolean>(false);
    this.buttonBSubject = new BehaviorSubject<boolean>(false);
    this.buttonABSubject = new BehaviorSubject<boolean>(false);
    this.displaySubject = new Subject<string>();
    this.accelerometerSubject = new Subject<{x: number, y: number, z: number}>();
    this.compassSubject = new Subject<number>();

    this.scene = document.createElement('a-scene');
    this.ledEntities = [];

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

      <a-entity id="microbit" gltf-model="#microbit-model" position="0 -3 -22" rotation="0 0 0" scale="0.8 0.8 0.8"></a-entity>

      ${this.createLEDDisplay()}
      ${this.createButtons()}

      <a-entity camera position="0 0 0" look-controls="enabled: false" wasd-controls="enabled: false"></a-entity>
      
      <a-light type="ambient" color="#BBB"></a-light>
      <a-light type="directional" color="#FFF" intensity="0.6" position="-0.5 1 1"></a-light>
    `;

    render(sceneTemplate, this.scene);
    this.container.appendChild(this.scene);
  }

  private createLEDDisplay() {
    return html`
      <a-entity id="led-display" position="0 0.02 -0.49">
        ${[...Array(5)].map((_, i) =>
          [...Array(5)].map((_, j) => html`
            <a-entity
              geometry="primitive: sphere; radius: 0.005"
              material="color: #300000; emissive: #300000"
              position="${(j - 2) * 0.015} ${(2 - i) * 0.015} 0"
              @created=${(e: CustomEvent) => this.ledEntities.push(e.target as HTMLElement)}
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
        position="-0.04 -0.04 -0.49"
        text="value: A; align: center; width: 0.1; color: white; zOffset: 0.003"
        @mousedown=${() => this.buttonPress('A', true)}
        @mouseup=${() => this.buttonPress('A', false)}
        @mouseleave=${() => this.buttonPress('A', false)}
      ></a-entity>
      <a-entity
        id="button-b"
        geometry="primitive: cylinder; radius: 0.01; height: 0.005"
        material="color: #4CAF50"
        position="0.04 -0.04 -0.49"
        text="value: B; align: center; width: 0.1; color: white; zOffset: 0.003"
        @mousedown=${() => this.buttonPress('B', true)}
        @mouseup=${() => this.buttonPress('B', false)}
        @mouseleave=${() => this.buttonPress('B', false)}
      ></a-entity>
    `;
  }

  private buttonPress(button: 'A' | 'B', isPressed: boolean) {
    const buttonEntity = this.scene.querySelector(`#button-${button.toLowerCase()}`) as HTMLElement;
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
    const camera = this.scene.querySelector('[camera]') as any;
    camera.setAttribute('aspect', aspect.toString());
    camera.setAttribute('fov', '60');
    camera.object3D.updateProjectionMatrix();
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