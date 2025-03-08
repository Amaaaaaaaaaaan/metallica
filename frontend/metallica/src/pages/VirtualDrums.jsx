import React, { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Howl } from 'howler';
import styles from '../styles/HandDrum.module.css';

const drumSounds = {
  snare: new Howl({ src: ['snare.mp3'] }),
  kick: new Howl({ src: ['kick.mp3'] }),
  hiHat: new Howl({ src: ['hihat.mp3'] }),
  // add more drum sounds as needed
};

const HandDrum = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // This function will be called by MediaPipe on every frame
  const onResults = (results) => {
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw video frame for visual feedback (optional)
    canvasCtx.drawImage(
      results.image, 0, 0, canvasRef.current.width, canvasRef.current.height
    );

    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((landmarks) => {
        // For each hand, check the tip of the index finger (landmark 8)
        const indexTip = landmarks[8];

        // Convert normalized coordinates (0-1) to canvas coordinates:
        const x = indexTip.x * canvasRef.current.width;
        const y = indexTip.y * canvasRef.current.height;

        // Draw a circle at the index fingertip (for debugging)
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 10, 0, 2 * Math.PI);
        canvasCtx.fillStyle = 'red';
        canvasCtx.fill();

        // Define virtual drum zones (example coordinates)
        // For example, if the index tip is within a rectangle, play a sound.
        if (x > 50 && x < 150 && y > 300 && y < 400) {
          // Trigger snare (debounce so sound doesn't trigger every frame)
          drumSounds.snare.play();
        } else if (x > 200 && x < 300 && y > 300 && y < 400) {
          drumSounds.kick.play();
        } else if (x > 350 && x < 450 && y > 300 && y < 400) {
          drumSounds.hiHat.play();
        }
      });
    }
    canvasCtx.restore();
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
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
      width: 640,
      height: 480,
    });
    camera.start();
    
    // Cleanup on unmount
    return () => {
      camera.stop();
    };
  }, []);

  return (
    <div className="hand-drum-container">
      <video ref={videoRef} style={{ display: 'none' }}></video>
      <canvas ref={canvasRef} width="640" height="480" className="hand-drum-canvas"></canvas>
      <div className="drum-instructions">
        <p>Wave your hand over the virtual drums!</p>
      </div>
    </div>
  );
};

export default HandDrum;
