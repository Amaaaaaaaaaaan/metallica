import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import styles from './DrumStyle.module.css';

// ✅ Map keys to corresponding sound files
const SOUND_MAP = {
  w: '../../public/audios/bass_drum.mp3',
  a: '../../public/audios/bottom_left_hat.mp3',
  s: '../../public/audios/center_left_Drum.mp3',
  d: '../../public/audios/center_right_drum.mp3',
  q: '../../public/audios/hat+bass.mp3',
  e: '../../public/audios/left_bottom.mp3',
  r: '../../public/audios/right_bottom_Drum.mp3',
  t: '../../public/audios/right_Cymbal.mp3'
};

function DrumsModel({ isPlaying }) {
  const { scene, animations } = useGLTF('../../public/Drums.gltf');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && animations.length > 0) {
      const action = actions[animations[0].name];

      if (isPlaying) {
        if (action && !action.isPlaying) {
          action.play(); // ✅ Keep animation playing
        }
      } else {
        action?.stop(); // ✅ Stop animation when inactive
      }
    }
  }, [isPlaying, actions, animations]);

  return <primitive object={scene} scale={50} position={[0, -1, 0]} />;
}

function DrumComp() {
  const [isAnimating, setIsAnimating] = useState(false);
  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (SOUND_MAP[key]) {
        activeKeys.current.add(key);
        setIsAnimating(true); // ✅ Start animation when a key is pressed

        // ✅ Play multiple sounds simultaneously
        const audio = new Audio(SOUND_MAP[key]);
        audio.play();

        // ✅ Reset inactivity timer
        clearTimeout(inactivityTimer.current);
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      activeKeys.current.delete(key);

      // ✅ If no keys are pressed, stop animation after delay
      if (activeKeys.current.size === 0) {
        inactivityTimer.current = setTimeout(() => {
          setIsAnimating(false);
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <>
      <div className={styles.canvasContainer}>
        <Canvas style={{ width: "800px", height: "100vh" }} className={styles.canvas} camera={{ position: [0, 2, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <DrumsModel isPlaying={isAnimating} />
            <OrbitControls />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

export default DrumComp;
