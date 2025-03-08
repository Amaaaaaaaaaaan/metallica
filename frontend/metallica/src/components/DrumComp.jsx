import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, useAnimations, useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import styles from "./DrumStyle.module.css";
import KeyMapping from "./KeyMapping";
import BackgroundPicker from "./BackgroundPicker";
import SaveRecordingDialog from "./SaveRecordingDialog";
import UnsavedPreviewBottomPlayer from "./UnsavedPreviewBottomPlayer";

function Loader() {
  const { progress } = useProgress();
  const messages = [
    "Tuning the keyboard... 🎵",
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
    w: "/audios/bass_drum.mp3",
    a: "/audios/bottom_left_hat.mp3",
    s: "/audios/center_left_Drum.mp3",
    d: "/audios/center_right_drum.mp3",
    q: "/audios/hat+bass.mp3",
    e: "/audios/left_bottom.mp3",
    r: "/audios/right_bottom_Drum.mp3",
    t: "/audios/right_Cymbal.mp3",
  },
  Alternative: {
    w: "/audios/alternative_bass.mp3",
    a: "/audios/alternative_hat.mp3",
    s: "/audios/alternative_snare.mp3",
    d: "/audios/alternative_tom.mp3",
    q: "/audios/alternative_crash.mp3",
    e: "/audios/alternative_ride.mp3",
    r: "/audios/alternative_floor_tom.mp3",
    t: "/audios/alternative_splash.mp3",
  },
};

function DrumsModel({ isPlaying }) {
  const { scene, animations } = useGLTF("/drums.gltf");
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

function DrumComp() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [keyMapping, setKeyMapping] = useState("Default");
  const [keyMappings, setKeyMappings] = useState(PRESET_MAPPINGS["Default"]);
  const [volume, setVolume] = useState(1.0);
  const [isKeyMappingOpen, setIsKeyMappingOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  // unsavedRecording holds the Data URL of the new recording (temporary until saved)
  const [unsavedRecording, setUnsavedRecording] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);
  const audioContextRef = useRef(null);
  const destRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Load saved recordings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recordings");
    if (stored) {
      setRecordings(JSON.parse(stored));
    }
  }, []);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setUnsavedRecording(base64data);
      };
      reader.readAsDataURL(blob);
      recordedChunksRef.current = [];
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showSaveDialog) return;
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
        audio.play().catch(console.error);
        clearTimeout(inactivityTimer.current);
      }
    };

    const handleKeyUp = (event) => {
      if (showSaveDialog) return;
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
  }, [keyMappings, volume, showSaveDialog]);

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
      setIsRecordingActive(true);
      setUnsavedRecording(null);
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
      setIsRecordingActive(false);
    }
  };

  const discardUnsaved = () => {
    setUnsavedRecording(null);
  };

  const discardRecording = (index) => {
    const updated = recordings.filter((_, i) => i !== index);
    setRecordings(updated);
    localStorage.setItem("recordings", JSON.stringify(updated));
  };

  // When the SaveRecordingDialog calls onSave, we get the new track object
  const handleSaveUnsaved = (newRecording) => {
    const updatedRecordings = [...recordings, newRecording];
    setRecordings(updatedRecordings);
    localStorage.setItem("recordings", JSON.stringify(updatedRecordings));
    setUnsavedRecording(null);
    setShowSaveDialog(false);
  };

  const handleUserGesture = () => {
    if (window.AudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
    }
  };

  return (
    <div className={styles.container} onClick={handleUserGesture}>
      <div className={styles.canvasContainer}>
        <Canvas
          className={styles.canvas}
          camera={{
            position: [-3.0235463847913526, 2.4680071247329516, -5.762152603378366],
            fov: 50,
            rotation: [-2.7369188843831083, -0.44942295148649, -2.957617815288093]
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
            <DrumsModel isPlaying={isAnimating} />
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
            />
          ) : (
            <button
              onClick={startRecording}
              className={styles.triangleButton}
              title="Start Recording"
            />
          )}
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={styles.redCircleButton}
            title="Stop Recording"
          />
        </div>
        <div className={styles.recordingsScrollable}>
          {recordings.length === 0 ? (
            <div className={styles.emptyMessage}>
              Why does it sound so empty? Record something!
            </div>
          ) : (
            recordings.map((item, idx) => (
              <div key={idx} className={styles.recordingItem}>
                <audio controls src={item.dataUrl} style={{ width: "100%" }} />
                <p style={{ color: "#ccc" }}>{item.title}</p>
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
      {/* Bottom unsaved preview player: render only if unsavedRecording exists */} 
      {unsavedRecording && (
       <UnsavedPreviewBottomPlayer
       recordingUrl={unsavedRecording}
       onSave={(newRecording) => handleSaveUnsaved(newRecording)}
       onDiscard={discardUnsaved}
       onClose={() => {}}
     />
     
      )}
      {/* Save dialog for unsaved recording */} 
      {showSaveDialog && unsavedRecording && (
        <SaveRecordingDialog
          recordingUrl={unsavedRecording}
          onSave={handleSaveUnsaved}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
}

export default DrumComp;
