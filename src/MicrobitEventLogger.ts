import { VirtualMicrobit } from './VirtualMicrobit';

export class MicrobitEventLogger {
  constructor(private microbit: VirtualMicrobit) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.microbit.onButtonA().subscribe(pressed => {
      console.log(`Button A ${pressed ? 'pressed' : 'released'}`);
    });

    this.microbit.onButtonB().subscribe(pressed => {
      console.log(`Button B ${pressed ? 'pressed' : 'released'}`);
    });

    this.microbit.onButtonAB().subscribe(pressed => {
      console.log(`Buttons A+B ${pressed ? 'pressed' : 'released'}`);
    });

    this.microbit.onDisplayChange().subscribe(pattern => {
      console.log(`Display changed: ${pattern}`);
    });

    this.microbit.onAccelerometerChange().subscribe(data => {
      console.log(`Accelerometer changed: x=${data.x}, y=${data.y}, z=${data.z}`);
    });

    this.microbit.onCompassChange().subscribe(direction => {
      console.log(`Compass direction changed: ${direction}°`);
    });
  }
}