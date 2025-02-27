import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import styles from './DrumStyle.module.css';

function DrumsModel({ playAnimation }) {
  const { scene, animations } = useGLTF('../../public/Drums.gltf'); // ✅ Keep your model path
  const { actions } = useAnimations(animations, scene);

  React.useEffect(() => {
    if (actions && animations.length > 0) {
      const action = actions[animations[0].name]; // ✅ Get the first animation
      if (playAnimation) {
        action?.reset().play();
      } else {
        action?.stop();
      }
    }
  }, [playAnimation, actions, animations]);

  return <primitive object={scene} scale={5} position={[0, -1, 0]} />;
}

function DrumComp() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <div className={styles.canvasContainer}>
        <Canvas style={{ width: "800px", height: "100vh" }} className={styles.canvas} camera={{ position: [0, 2, 5], fov: 50 }} >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <DrumsModel playAnimation={isPlaying} />
            <OrbitControls />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
      <button className={styles.button} onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "Stop Animation" : "Play Animation"}
      </button>
    </>
  );
}

export default DrumComp;
