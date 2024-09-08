import { VirtualMicrobit } from './VirtualMicrobit';
import { MicrobitEventLogger } from './MicrobitEventLogger';


document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('microbit-container');
    if (container) {
      const microbit = new VirtualMicrobit(container);
      // add any initialization or event subscriptions here

      // Initialize the event logger
      const eventLogger = new MicrobitEventLogger(microbit);
      console.log('MicrobitEventLogger initialized');

      // Test display change
      microbit.setDisplay('10101:01010:00100:01010:10101');
  
    } else {
      console.error('Container element not found');
    }

    
  });