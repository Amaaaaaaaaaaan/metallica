import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import styles from './DrumStyle.module.css';
import { useThree } from '@react-three/fiber';

function CameraLogger() {
  const { camera } = useThree();

  useEffect(() => {
    console.log("Camera Position:", camera.position);
    console.log("Camera Rotation:", camera.rotation);
  }, [camera]);

  return null; // This component is just for logging
}

const PRESET_MAPPINGS = {
  Default: {
    w: '../../public/audios/bass_drum.mp3',
  a: '../../public/audios/bottom_left_hat.mp3',
  s: '../../public/audios/center_left_Drum.mp3',
  d: '../../public/audios/center_right_drum.mp3',
  q: '../../public/audios/hat+bass.mp3',
  e: '../../public/audios/left_bottom.mp3',
  r: '../../public/audios/right_bottom_Drum.mp3',
  t: '../../public/audios/right_Cymbal.mp3'
  },
  Alternative: {
    w: '/audios/alternative_bass.mp3',
    a: '/audios/alternative_hat.mp3',
    s: '/audios/alternative_snare.mp3',
    d: '/audios/alternative_tom.mp3',
    q: '/audios/alternative_crash.mp3',
    e: '/audios/alternative_ride.mp3',
    r: '/audios/alternative_floor_tom.mp3',
    t: '/audios/alternative_splash.mp3'
  }
};

function DrumsModel({ isPlaying }) {
  const { scene, animations } = useGLTF('../../public/Drums.gltf');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && animations.length > 0) {
      const action = actions[animations[0].name];

      if (isPlaying) {
        if (action && !action.isPlaying) {
          action.play();
        }
      } else {
        action?.stop();
      }
    }
  }, [isPlaying, actions, animations]);

  return <primitive object={scene} scale={50} position={[0, -1, 0]} />;
}

function DrumComp() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [keyMapping, setKeyMapping] = useState('Default');
  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (PRESET_MAPPINGS[keyMapping][key]) {
        activeKeys.current.add(key);
        setIsAnimating(true);
        
        const audio = new Audio(PRESET_MAPPINGS[keyMapping][key]);
        audio.play();
        
        clearTimeout(inactivityTimer.current);
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      activeKeys.current.delete(key);

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
  }, [keyMapping]);

  return (
    <>
      <div className={styles.canvasContainer}>
        <select onChange={(e) => setKeyMapping(e.target.value)}>
          {Object.keys(PRESET_MAPPINGS).map((preset) => (
            <option key={preset} value={preset}>{preset}</option>
          ))}
        </select>
        <Canvas style={{ width: "800px", height: "100vh" }} className={styles.canvas} camera={{ position: [0, 2, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <CameraLogger />
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
