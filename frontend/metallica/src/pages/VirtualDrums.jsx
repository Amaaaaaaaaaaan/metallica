import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Howl } from 'howler';
import style from '../styles/HandDrum.module.css';

// Use your provided audio paths and static drum names.
const PRESET_MAPPINGS = {
  Default: {
    BassDrum: '/audios/bass_drum.mp3',
    LeftHat: '/audios/bottom_left_hat.mp3',
    LeftDrum: '/audios/center_left_Drum.mp3',
    RightDrum: '/audios/center_right_drum.mp3',
    HatBass: '/audios/hat+bass.mp3',
    LeftBottom: '/audios/left_bottom.mp3',
    RightBottom: '/audios/right_bottom_Drum.mp3',
    RightCymbal: '/audios/right_Cymbal.mp3'
  }
};

// Define drum zones as percentages relative to a 640x480 canvas.
// These positions are defined for a mirrored view.
// For example, a zone defined with x: 0.08 in a mirrored view will actually be on the left side.
const drumZones = [
  {
    name: 'BassDrum',
    x: 0.08,
    y: 0.65,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.BassDrum
  },
  {
    name: 'LeftHat',
    x: 0.28,
    y: 0.65,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.LeftHat
  },
  {
    name: 'LeftDrum',
    x: 0.48,
    y: 0.65,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.LeftDrum
  },
  {
    name: 'RightDrum',
    x: 0.68,
    y: 0.65,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.RightDrum
  },
  {
    name: 'HatBass',
    x: 0.08,
    y: 0.35,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.HatBass
  },
  {
    name: 'LeftBottom',
    x: 0.28,
    y: 0.35,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.LeftBottom
  },
  {
    name: 'RightBottom',
    x: 0.48,
    y: 0.35,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.RightBottom
  },
  {
    name: 'RightCymbal',
    x: 0.68,
    y: 0.35,
    width: 0.18,
    height: 0.25,
    sound: PRESET_MAPPINGS.Default.RightCymbal
  }
];

// Debounce storage so the same zone isn’t retriggered too frequently.
const lastPlayTime = {};

const HandDrum = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update canvas size on window resize.
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to play drum sound for a given zone (debounced).
  const playDrumSound = (zone) => {
    const now = Date.now();
    if (lastPlayTime[zone.name] && now - lastPlayTime[zone.name] < 300) return;
    lastPlayTime[zone.name] = now;
    const sound = new Howl({
      src: [zone.sound],
      volume: 1.0
    });
    sound.play();
  };

  // MediaPipe Hands results callback.
  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mirror the video image: set up transformation.
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw drum zones (flip their X coordinate for mirror view).
    drumZones.forEach(zone => {
      // For mirrored view, compute mirrored x:
      // mirrored_x = canvas.width - (zone.x*canvas.width) - (zone.width*canvas.width)
      const x = canvas.width - (zone.x * canvas.width) - (zone.width * canvas.width);
      const y = zone.y * canvas.height;
      const w = zone.width * canvas.width;
      const h = zone.height * canvas.height;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,255,0,0.1)';
      ctx.fill();
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(zone.name, x + 10, y + 30);
    });

    // Process detected hand landmarks.
    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((landmarks) => {
        // Draw landmarks for debugging: mirror the x coordinate.
        landmarks.forEach(pt => {
          const x = canvas.width - (pt.x * canvas.width);
          const y = pt.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        });
        // Use the index finger tip (landmark 8).
        const indexTip = landmarks[8];
        if (indexTip) {
          const x = canvas.width - (indexTip.x * canvas.width);
          const y = indexTip.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = 'blue';
          ctx.fill();

          // Check collision: iterate over drum zones.
          drumZones.forEach(zone => {
            const zoneX = canvas.width - (zone.x * canvas.width) - (zone.width * canvas.width);
            const zoneY = zone.y * canvas.height;
            const zoneW = zone.width * canvas.width;
            const zoneH = zone.height * canvas.height;
            if (x >= zoneX && x <= zoneX + zoneW && y >= zoneY && y <= zoneY + zoneH) {
              playDrumSound(zone);
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: canvasSize.width,
      height: canvasSize.height,
    });
    camera.start();

    return () => {
      camera.stop();
    };
  }, [canvasSize]);

  // Resume AudioContext on user gesture (click)
  const handleUserGesture = () => {
    if (window.AudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    }
  };

  return (
    <div className={style["hand-drum-container"]} onClick={handleUserGesture}>
      <video 
        ref={videoRef} 
        className={style["hand-drum-video"]} 
        autoPlay 
        muted 
        playsInline 
        style={{ display: 'none' }} 
      />
      <canvas 
        ref={canvasRef} 
        width={canvasSize.width} 
        height={canvasSize.height} 
        className={style["hand-drum-canvas"]} 
      />
      <div className={style["drum-instructions"]}>
        <p>Wave your hand over the drum zones to play the drums!</p>
      </div>
    </div>
  );
};

export default HandDrum;
