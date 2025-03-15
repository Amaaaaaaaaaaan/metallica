import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carousel.css';

const Carousel = () => {
  const navigate = useNavigate(); 
  const trackRef = useRef(null);
  const [mouseDownAt, setMouseDownAt] = useState(0);
  const [prevPercentage, setPrevPercentage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleOnDown = (e) => {
    setMouseDownAt(e.clientX);
    setIsDragging(false);
  };

  const handleOnUp = () => {
    setMouseDownAt(0);
    setPrevPercentage(trackRef.current.dataset.percentage);
    // Delay resetting isDragging so we don't mistakenly navigate on quick drags
    setTimeout(() => setIsDragging(false), 0);
  };

  const handleOnMove = (e) => {
    if (mouseDownAt === 0) return;
    const mouseDelta = mouseDownAt - e.clientX;

    // If user moves more than 5px, consider it a drag (not a click)
    if (Math.abs(mouseDelta) > 5) {
      setIsDragging(true);
    }

    const maxDelta = window.innerWidth / 2;
    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(prevPercentage) + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    trackRef.current.dataset.percentage = nextPercentage;

    trackRef.current.animate(
      { transform: `translate(${nextPercentage}%, -50%)` },
      { duration: 1200, fill: 'forwards' }
    );

    for (const image of trackRef.current.getElementsByClassName('image')) {
      image.animate(
        { objectPosition: `${100 + nextPercentage}% center` },
        { duration: 1200, fill: 'forwards' }
      );
    }
  };

  // Only navigate if we didn't drag
  const handleClick = (route) => {
    if (!isDragging) {
      navigate(route);
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
      <img
        className="image"
        src="https://c0.wallpaperflare.com/preview/665/327/582/brown-and-black-electric-guitar.jpg"
        draggable="false"
        alt="Drums"
        onClick={() => handleClick('/drums')}
      />
      <img
        className="image"
        src="https://c0.wallpaperflare.com/preview/218/233/171/piano-oldschool-vintage-music.jpg"
        draggable="false"
        alt="Piano"
        onClick={() => handleClick('/piano')}
      />
      <img
        className="image"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwpmUYLno82MT7C1Szd_fATyfN4jiaQmLcSw&s"
        draggable="false"
        alt="Sequencer"
        onClick={() => handleClick('/sequencer')}
      />
      <img
        className="image"
        src="https://c0.wallpaperflare.com/preview/665/327/582/brown-and-black-electric-guitar.jpg"
        draggable="false"
        alt="Test"
        onClick={() => handleClick('/test')}
      />
      <img
        className="image"
        src="https://c0.wallpaperflare.com/preview/218/233/171/piano-oldschool-vintage-music.jpg"
        draggable="false"
        alt="Virtual Drums"
        onClick={() => handleClick('/virtualdrums')}
      />
      <img
        className="image"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwpmUYLno82MT7C1Szd_fATyfN4jiaQmLcSw&s"
        draggable="false"
        alt="Test"
        onClick={() => handleClick('/saved')}
      />
    </div>
  );
};

export default Carousel;
