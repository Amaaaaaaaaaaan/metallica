// src/hooks/useShepherdTour.js
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const useShepherdTour = () => {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark text-white p-4 rounded-lg',
      scrollTo: true
    }
  });

  tour.addStep({
    title: 'Welcome!',
    text: 'This is the first step of your tour.',
    attachTo: { element: '.step-1', on: 'bottom' },
    buttons: [
      { text: 'Next', action: tour.next }
    ]
  });

  tour.addStep({
    title: 'Second Step',
    text: 'This is step 2. Click Next to continue.',
    attachTo: { element: '.step-2', on: 'right' },
    buttons: [
      { text: 'Back', action: tour.back },
      { text: 'Next', action: tour.next }
    ]
  });

  tour.addStep({
    title: 'Final Step',
    text: 'You have reached the end of the tour!',
    attachTo: { element: '.step-3', on: 'top' },
    buttons: [
      { text: 'Finish', action: tour.complete }
    ]
  });

  return tour;
};

export default useShepherdTour;
