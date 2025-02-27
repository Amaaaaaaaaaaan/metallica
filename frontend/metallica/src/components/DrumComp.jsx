import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import styles from './DrumStyle.module.css';

// ✅ Corrected sound file paths
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

function DrumsModel({ playAnimation }) {
  const { scene, animations } = useGLTF('../../public/Drums.gltf');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && animations.length > 0) {
      const action = actions[animations[0].name];

      if (playAnimation) {
        if (action && !action.isPlaying) { // ✅ Ensuring animation does not restart
          action.play();
        }
      } else {
        action?.stop(); // ✅ Stop animation when playAnimation is false
      }
    }
  }, [playAnimation, actions, animations]);

  return <primitive object={scene} scale={50} position={[0, -1, 0]} />;
}

function DrumComp() {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();
      if (SOUND_MAP[key]) {
        setIsAnimating(true);

        // ✅ Play sound without stopping others
        const audio = new Audio(SOUND_MAP[key]);
        audio.play();

        // ✅ Keep animation running for a short duration
        setTimeout(() => setIsAnimating(false), 3000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <div className={styles.canvasContainer}>
        <Canvas style={{ width: "800px", height: "100vh" }} className={styles.canvas} camera={{ position: [0, 2, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <DrumsModel playAnimation={isAnimating} />
            <OrbitControls />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

export default DrumComp;
