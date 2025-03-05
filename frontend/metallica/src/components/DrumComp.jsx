import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import styles from "./DrumStyle.module.css";
import KeyMapping from "./KeyMapping";

const PRESET_MAPPINGS = {
  Default: {
    w: "../../public/audios/bass_drum.mp3",
    a: "../../public/audios/bottom_left_hat.mp3",
    s: "../../public/audios/center_left_Drum.mp3",
    d: "../../public/audios/center_right_drum.mp3",
    q: "../../public/audios/hat+bass.mp3",
    e: "../../public/audios/left_bottom.mp3",
    r: "../../public/audios/right_bottom_Drum.mp3",
    t: "../../public/audios/right_Cymbal.mp3",
  }
};

function DrumsModel({ isPlaying }) {
  const { scene, animations } = useGLTF("../../public/Drums.gltf");
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
  const [keyMapping, setKeyMapping] = useState("Default");
  const [keyMappings, setKeyMappings] = useState(PRESET_MAPPINGS["Default"]);
  const [volume, setVolume] = useState(1.0);
  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (keyMappings[key]) {
        activeKeys.current.add(key);
        setIsAnimating(true);
        const audio = new Audio(keyMappings[key]);
        audio.volume = volume;
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyMappings, volume]);

  const handlePresetChange = (e) => {
    const selectedPreset = e.target.value;
    setKeyMapping(selectedPreset);
    setKeyMappings(PRESET_MAPPINGS[selectedPreset]);
  };

  const adjustVolume = (change) => {
    setVolume((prev) => {
      let newVolume = prev + change;
      return newVolume < 0 ? 0 : newVolume > 1 ? 1 : newVolume;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <Canvas className={styles.canvas} camera={{ position: [0, 2, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <DrumsModel isPlaying={isAnimating} />
            <OrbitControls />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
      <div className={styles.controls}>
        <div className={styles.presetSelector}>
          <label>Drum Presets:</label>
          <select onChange={handlePresetChange} value={keyMapping}>
            {Object.keys(PRESET_MAPPINGS).map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>
        <KeyMapping soundMap={keyMappings} updateSoundMap={setKeyMappings} />
        <div className={styles.volumeControls}>
          <label>Volume: {Math.round(volume * 100)}%</label>
          <button onClick={() => adjustVolume(-0.1)}>🔉 Decrease</button>
          <button onClick={() => adjustVolume(0.1)}>🔊 Increase</button>
        </div>
      </div>
    </div>
  );
}

export default DrumComp;
