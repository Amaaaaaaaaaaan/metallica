import React, { useRef, useState } from 'react';
import './Carousel.css'; // Assuming you save the CSS in a separate file

const Carousel = () => {
  const trackRef = useRef(null);
  const [mouseDownAt, setMouseDownAt] = useState(0);
  const [prevPercentage, setPrevPercentage] = useState(0);

  const handleOnDown = (e) => setMouseDownAt(e.clientX);

  const handleOnUp = () => {
    setMouseDownAt(0);
    setPrevPercentage(trackRef.current.dataset.percentage);
  };

  const handleOnMove = (e) => {
    if (mouseDownAt === 0) return;

    const mouseDelta = mouseDownAt - e.clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(prevPercentage) + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    trackRef.current.dataset.percentage = nextPercentage;

    trackRef.current.animate({
      transform: `translate(${nextPercentage}%, -50%)`,
    }, { duration: 1200, fill: 'forwards' });

    for (const image of trackRef.current.getElementsByClassName('image')) {
      image.animate({
        objectPosition: `${100 + nextPercentage}% center`,
      }, { duration: 1200, fill: 'forwards' });
    }
  };

  return (
    <div
      id="image-track"
      ref={trackRef}
      data-mouse-down-at="0"
      data-prev-percentage="0"
      onMouseDown={handleOnDown}
      onMouseUp={handleOnUp}
      onMouseMove={handleOnMove}
      onTouchStart={(e) => handleOnDown(e.touches[0])}
      onTouchEnd={(e) => handleOnUp(e.touches[0])}
      onTouchMove={(e) => handleOnMove(e.touches[0])}
    >
      <img className="image" src="https://c0.wallpaperflare.com/preview/665/327/582/brown-and-black-electric-guitar.jpg" draggable="false" />
      <img className="image" src="https://c0.wallpaperflare.com/preview/218/233/171/piano-oldschool-vintage-music.jpg" draggable="false" />
      <img className="image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwpmUYLno82MT7C1Szd_fATyfN4jiaQmLcSw&s" draggable="false" />
      <img className="image" src="https://c0.wallpaperflare.com/preview/665/327/582/brown-and-black-electric-guitar.jpg" draggable="false" />
      <img className="image" src="https://c0.wallpaperflare.com/preview/218/233/171/piano-oldschool-vintage-music.jpg" draggable="false" />
      <img className="image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwpmUYLno82MT7C1Szd_fATyfN4jiaQmLcSw&s" draggable="false" />
    </div>
  );
};

export default Carousel;