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
    // scene.setAttribute('embedded', '');
    
    // Create asset management system
    const assets = document.createElement('a-assets');
    
    // Add the Micro:bit model to assets
    const microbitModelAsset = document.createElement('a-asset-item');
    microbitModelAsset.id = 'microbit-model';
    microbitModelAsset.setAttribute('src', 'assets/microbit.glb');
    assets.appendChild(microbitModelAsset);
    
    // Append assets to the scene
    scene.appendChild(assets);
    
    // Add the Micro:bit model entity
    const microbitModel = html`<a-entity id='microbit' gltf-model='#microbit-model' 
      position='0 -4 -25' rotation='0 0 0' scale='0.8 0.8 0.8'>`
    render(microbitModel, scene);
    
    // Add a fixed camera
    const camera = document.createElement('a-entity');
    camera.setAttribute('camera', '');
    camera.setAttribute('position', '0 0 2'); // Adjust this value to change the distance from the model
    camera.setAttribute('look-at', '#microbit');
    
    // Remove look controls
    camera.setAttribute('look-controls', 'enabled: false');
    
    // Remove WASD controls
    camera.setAttribute('wasd-controls', 'enabled: false');
    
    scene.appendChild(camera);
    
    // Add lights
    const ambientLight = document.createElement('a-light');
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('color', '#BBB');
    scene.appendChild(ambientLight);
    
    const directionalLight = document.createElement('a-light');
    directionalLight.setAttribute('type', 'directional');
    directionalLight.setAttribute('color', '#FFF');
    directionalLight.setAttribute('intensity', '0.4');
    directionalLight.setAttribute('position', '-0.5 1 1');
    scene.appendChild(directionalLight);
    
    this.container.appendChild(scene);
  }


  private initializeTouchControls() {
    const buttonA = this.createButton('A', '10%', '40%');
    const buttonB = this.createButton('B', '90%', '40%');

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
    button.style.width = '100px';
    button.style.height = '100px';
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
    display.style.top = '50%';
    display.style.left = '50%';
    display.style.transform = 'translate(-50%, -50%)';
    display.style.display = 'grid';
    display.style.gridTemplateColumns = 'repeat(5, 1fr)';
    display.style.gap = '30px';

    for (let i = 0; i < 25; i++) {
      const led = document.createElement('div');
      led.style.width = '50px';
      led.style.height = '60px';
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
