import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, useAnimations, useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import styles from "./DrumStyle.module.css";
import KeyMapping from "./KeyMapping";
import BackgroundPicker from "./BackgroundPicker";

function Loader() {
  const { progress } = useProgress();
  const messages = [
    "Tuning the keyborad... 🎵",
    "Setting up the stage... 🎤",
    "Warming up the sticks... 🥁",
    "Loading beats... 🎶",
    "Almost there... 🔥"
  ];

  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Html center>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "white",
        fontSize: "16px",
        fontWeight: "bold",
        textAlign: "center"
      }}>
        <p>{message}</p>
        <div style={{
          width: "200px",
          height: "10px",
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "5px",
          position: "relative",
          overflow: "hidden",
          marginBottom: "10px"
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: "white",
            transition: "width 0.3s"
          }}></div>
        </div>
        <p>{Math.round(progress)}% Loaded</p>
      </div>
    </Html>
  );
}

const PRESET_MAPPINGS = {
  Default: {
    w: '/audios/piano/21.mp3',
    a: '/audios/piano/33.mp3',
    s: '/audios/piano/45.mp3',
    d: '/audios/piano/57.mp3',
    q: '/audios/piano/69.mp3',
    e: '/audios/piano/81.mp3',
    r: '/audios/piano/93.mp3',
    t: '/audios/piano/105.mp3'
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
  const { scene, animations } = useGLTF("/keyboard.gltf");
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

  return (
    <primitive
      object={scene}
      scale={5}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Updated CanvasBackground to handle both color and image backgrounds.
function CanvasBackground({ bgImage }) {
  const { scene } = useThree();

  useEffect(() => {
    if (bgImage) {
      if (bgImage.type === "color") {
        scene.background = new THREE.Color(bgImage.value);
      } else if (bgImage.type === "image") {
        new THREE.TextureLoader().load(bgImage.value, (texture) => {
          texture.encoding = THREE.sRGBEncoding;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.anisotropy = 16;
          scene.background = texture;
        });
      }
    } else {
      scene.background = null;
    }
  }, [bgImage, scene]);

  return null;
}

function Keyboardcomp() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [keyMapping, setKeyMapping] = useState("Default");
  const [keyMappings, setKeyMappings] = useState(PRESET_MAPPINGS["Default"]);
  const [volume, setVolume] = useState(1.0);
  const [isKeyMappingOpen, setIsKeyMappingOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  // bgImage will be an object, for example: { type: "color", value: "#ff0000" } or { type: "image", value: "data:image/..." }
  const [bgImage, setBgImage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);

  const audioContextRef = useRef(null);
  const destRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    destRef.current = audioContextRef.current.createMediaStreamDestination();
    try {
      mediaRecorderRef.current = new MediaRecorder(destRef.current.stream);
    } catch (err) {
      console.error("MediaRecorder error:", err);
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setRecordings((prev) => [...prev, url]);
      recordedChunksRef.current = [];
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (keyMappings[key]) {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
        activeKeys.current.add(key);
        setIsAnimating(true);

        const audio = new Audio(keyMappings[key]);
        audio.volume = volume;

        const sourceNode = audioContextRef.current.createMediaElementSource(audio);
        sourceNode.connect(audioContextRef.current.destination);
        sourceNode.connect(destRef.current);

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

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsRecordingActive(true); // Show Pause Button
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      } else if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      }
      setIsRecordingActive(mediaRecorderRef.current.state === "recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsRecordingActive(false); // Reset to Start Button
    }
  };

  const discardRecording = (index) => {
    setRecordings((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <Canvas
          className={styles.canvas}
          camera={{
            position: [0, 2, 10],
            fov: 50
          }}
          gl={{
            outputEncoding: THREE.sRGBEncoding,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.8
          }}
        >
          <Suspense fallback={<Loader />}>
            <CanvasBackground bgImage={bgImage} />
            <ambientLight intensity={0.6} />
            <hemisphereLight skyColor={"#aaaaaa"} groundColor={"#222222"} intensity={0.3} position={[0, 50, 0]} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <DrumsModel isPlaying={isAnimating} activeKeys={activeKeys} />
            <OrbitControls enableZoom={true} enablePan={true} />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
      <div className={styles.controls}>
      <div className={styles.settingsContainer}>
  <div className={styles.presetCard}>
    <h4>Keyboard Preset</h4>
    <label>Presets:</label>
    <select onChange={handlePresetChange} value={keyMapping}>
      {Object.keys(PRESET_MAPPINGS).map((preset) => (
        <option key={preset} value={preset}>
          {preset}
        </option>
      ))}
    </select>
  </div>

  <div className={styles.backgroundCard}>
    <h4>Background</h4>
    <BackgroundPicker setBg={setBgImage} />
  </div>
</div>


        <button className={styles.keyMappingButton} onClick={() => setIsKeyMappingOpen(true)}>
          🎹 Configure Keys
        </button>

        <div className={`${styles.popupKeyMapping} ${isKeyMappingOpen ? styles.show : ""}`}>
          <button className={styles.closeButton} onClick={() => setIsKeyMappingOpen(false)}>
            ✖
          </button>
          <h3>Key Mapping</h3>
          <KeyMapping soundMap={keyMappings} updateSoundMap={setKeyMappings} />
        </div>

        <div className={styles.volumeControls}>
          <label>Volume: {Math.round(volume * 100)}%</label>
          <button onClick={() => adjustVolume(-0.1)}>🔉 Decrease</button>
          <button onClick={() => adjustVolume(0.1)}>🔊 Increase</button>
        </div>
        <div className={styles.recordingControls}>
          {isRecording ? (
            <button 
              onClick={pauseRecording} 
              className={isPaused ? styles.triangleButton : styles.pauseButton}
              title={isPaused ? "Resume Recording" : "Pause Recording"}
            >
            </button>
          ) : (
            <button 
              onClick={startRecording} 
              className={styles.triangleButton}
              title="Start Recording"
            >
            </button>
          )}

          <button 
            onClick={stopRecording} 
            disabled={!isRecording} 
            className={styles.redCircleButton}
            title="Stop Recording"
          >
          </button>
        </div>

        <div className={styles.recordingsScrollable}>
  {recordings.length === 0 ? (
    <div className={styles.emptyMessage}>
      Why does it sound so empty? Record something!
    </div>
  ) : (
    recordings.map((url, idx) => (
      <div key={idx} className={styles.recordingItem}>
        <audio controls>
          {/* Explicitly define the MIME type for better browser support */}
          <source src={url} type="audio/webm; codecs=opus" />
          Your browser does not support the audio element.
        </audio>
        <button
          onClick={() => discardRecording(idx)}
          className={styles.discardButton}
          title="Discard Recording"
        >
          Discard
        </button>
      </div>
    ))
  )}
</div>
</div>
    </div>
  );
}

export default Keyboardcomp;
