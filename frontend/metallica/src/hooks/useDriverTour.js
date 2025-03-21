// useDriverTour.js
import Driver from "driver.js";
import 'driver.js/dist/driver.min.css';

export default function useDriverTour(steps) {
  const startTour = () => {
    const driver = new Driver({
      animate: true,
      opacity: 0.75,
    });
    driver.defineSteps(steps);
    driver.start();
  };
  return startTour;
}
