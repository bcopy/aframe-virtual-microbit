import { html, render } from 'lit-html';
import { Subject } from 'rxjs';
import 'aframe';

export class VirtualMicrobit {
  private buttonASubject = new Subject<boolean>();
  private buttonBSubject = new Subject<boolean>();
  private buttonABSubject = new Subject<boolean>();
  private displaySubject = new Subject<string>();
  private accelerometerSubject = new Subject<{x: number, y: number, z: number}>();
  private compassSubject = new Subject<number>();

  constructor(private container: HTMLElement) {
    this.initializeAFrame();
    this.initializeTouchControls();
    this.initializeDisplay();
    this.initializeAccelerometer();
    this.initializeCompass();
  }

  private initializeAFrame() {
    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.innerHTML = `
      <a-assets>
        <a-asset-item id="microbit-model" src="assets/microbit.glb"></a-asset-item>
      </a-assets>
      <a-entity gltf-model="#microbit-model" position="0 0 0" scale="10 10 10" rotation="0 0 0"></a-entity>
      <a-camera></a-camera>
    `;

    this.container.appendChild(scene);
  }

    private initializeTouchControls() {
    const buttonA = this.createButton('A', '10%', '90%');
    const buttonB = this.createButton('B', '90%', '90%');

    this.container.appendChild(buttonA);
    this.container.appendChild(buttonB);

    this.setupButtonEvents(buttonA, this.buttonASubject);
    this.setupButtonEvents(buttonB, this.buttonBSubject);

    // Setup AB button logic
    let aPressed = false;
    let bPressed = false;

    this.buttonASubject.subscribe(pressed => {
      aPressed = pressed;
      this.buttonABSubject.next(aPressed && bPressed);
    });

    this.buttonBSubject.subscribe(pressed => {
      bPressed = pressed;
      this.buttonABSubject.next(aPressed && bPressed);
    });
  }

  private createButton(label: string, left: string, top: string): HTMLElement {
    const button = document.createElement('div');
    button.textContent = label;
    button.style.position = 'absolute';
    button.style.left = left;
    button.style.top = top;
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.borderRadius = '25px';
    button.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.userSelect = 'none';
    return button;
  }

  private setupButtonEvents(button: HTMLElement, subject: Subject<boolean>) {
    const pressButton = () => subject.next(true);
    const releaseButton = () => subject.next(false);

    button.addEventListener('touchstart', pressButton);
    button.addEventListener('touchend', releaseButton);
    button.addEventListener('mousedown', pressButton);
    button.addEventListener('mouseup', releaseButton);
  }

  private initializeDisplay() {
    const display = document.createElement('div');
    display.style.position = 'absolute';
    display.style.top = '20%';
    display.style.left = '50%';
    display.style.transform = 'translate(-50%, -50%)';
    display.style.display = 'grid';
    display.style.gridTemplateColumns = 'repeat(5, 1fr)';
    display.style.gap = '10px';

    for (let i = 0; i < 25; i++) {
      const led = document.createElement('div');
      led.style.width = '10px';
      led.style.height = '20px';
      led.style.backgroundColor = 'darkred';
      display.appendChild(led);
    }

    this.container.appendChild(display);
  }

  private initializeAccelerometer() {
    // Implement accelerometer logic using device orientation API if available
  }

  private initializeCompass() {
    // Implement compass logic using device orientation API if available
  }

  // Public methods to interact with the virtual Micro:bit

  public setDisplay(pattern: string) {
    // Implement logic to update the LED display based on the input pattern
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
