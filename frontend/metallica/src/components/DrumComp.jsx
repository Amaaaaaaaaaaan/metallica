import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, useAnimations, useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./DrumStyle.module.css";
import KeyMapping from "./KeyMapping";
import BackgroundPicker from "./BackgroundPicker";
import SaveRecordingDialog from "./SaveRecordingDialog";
import UnsavedPreviewBottomPlayer from "./UnsavedPreviewBottomPlayer";
import { useSettings } from "./SettingContext.jsx";

// Loader Component for Suspense fallback
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
  }, [messages]);

  return (
    <Html center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "white", fontSize: "16px", fontWeight: "bold", textAlign: "center" }}>
        <p>{message}</p>
        <div style={{ width: "200px", height: "10px", background: "rgba(255,255,255,0.2)", borderRadius: "5px", position: "relative", overflow: "hidden", marginBottom: "10px" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "white", transition: "width 0.3s" }}></div>
        </div>
        <p>{Math.round(progress)}% Loaded</p>
      </div>
    </Html>
  );
}

// Preset audio mappings for keys
const PRESET_MAPPINGS = {
  Default: {
    w: "/audios/bass_drum.mp3",
    a: "/audios/bottom_left_hat.mp3",
    s: "/audios/center_left_Drum.mp3",
    d: "/audios/center_right_drum.mp3",
    q: "/audios/hat+bass.mp3",
    e: "/audios/left_bottom.mp3",
    r: "/audios/right_bottom_Drum.mp3",
    t: "/audios/right_Cymbal.mp3"
  },
  Alternative: {
    w: "/audios/alternative_bass.mp3",
    a: "/audios/alternative_hat.mp3",
    s: "/audios/alternative_snare.mp3",
    d: "/audios/alternative_tom.mp3",
    q: "/audios/alternative_crash.mp3",
    e: "/audios/alternative_ride.mp3",
    r: "/audios/alternative_floor_tom.mp3",
    t: "/audios/alternative_splash.mp3"
  }
};

// DrumsModel loads and plays the GLTF model and logs its transform values.
function DrumsModel({ isPlaying }) {
  const { scene, animations } = useGLTF("/drums.gltf");
  const { actions } = useAnimations(animations, scene);
  const modelRef = useRef();

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

  // Log the current scale and rotation (x, y, z) each frame
  useFrame(() => {
    if (modelRef.current) {
      const scaleValues = modelRef.current.scale.toArray();
      const rotationValues = [
        modelRef.current.rotation.x,
        modelRef.current.rotation.y,
        modelRef.current.rotation.z
      ];
      console.log("Scale:", scaleValues, "Rotation:", rotationValues);
    }
  });

  // Fixed transformation values (use your provided numbers)
  const fixedPosition = [-0.2, -1.7, 0.3];
  const fixedRotation = [0, -0.1, 0];

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={50}
      position={fixedPosition}
      rotation={fixedRotation}
    />
  );
}

// CanvasBackground updates the scene's background.
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
  // Local UI state for DrumComp
  const [isAnimating, setIsAnimating] = useState(false);
  const [keyMapping, setKeyMapping] = useState("Default");
  const [keyMappings, setKeyMappings] = useState(PRESET_MAPPINGS["Default"]);

  // Use shared settings from context
  const { volume, setVolume, bgImage, setBgImage, audioContext } = useSettings();

  const [isKeyMappingOpen, setIsKeyMappingOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [unsavedRecording, setUnsavedRecording] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);
  const destRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const toastIdRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("recordings");
    if (stored) {
      setRecordings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Only run when audioContext is defined
    if (!audioContext) return;
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    destRef.current = audioContext.createMediaStreamDestination();
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
        console.log("Unsaved recording Data URL:", base64data);
        setUnsavedRecording(base64data);
      };
      reader.readAsDataURL(blob);
      recordedChunksRef.current = [];
    };
  }, [audioContext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showSaveDialog) return;
      const key = event.key.toLowerCase();
      if (keyMappings[key]) {
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
        activeKeys.current.add(key);
        setIsAnimating(true);
        const audio = new Audio(keyMappings[key]);
        audio.volume = volume;
        const sourceNode = audioContext.createMediaElementSource(audio);
        sourceNode.connect(audioContext.destination);
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
  }, [keyMappings, volume, showSaveDialog, audioContext]);

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

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prevTime) => {
        const newTime = prevTime + 1;
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, { render: `Recording started - Timer: ${newTime}s` });
        }
        return newTime;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsRecordingActive(true);
      setUnsavedRecording(null);
      setRecordingTime(0);
      toastIdRef.current = toast.info(`Recording started - Timer: 0s`, {
        autoClose: false,
        theme: "colored",
        position: "top-center"
      });
      startTimer();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, { render: `Recording paused - Timer: ${recordingTime}s` });
        }
      } else if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, { render: `Recording resumed - Timer: ${recordingTime}s` });
        }
        startTimer();
      }
      setIsRecordingActive(mediaRecorderRef.current.state === "recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsRecordingActive(false);
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      toast.error(`Recording stopped - Timer: ${recordingTime}s`, {
        autoClose: 3000,
        position: "top-center",
        style: { backgroundColor: "#ff4d4d", color: "#fff" }
      });
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

  const handleSaveUnsaved = (newRecording) => {
    const updatedRecordings = [...recordings, newRecording];
    setRecordings(updatedRecordings);
    localStorage.setItem("recordings", JSON.stringify(updatedRecordings));
    setUnsavedRecording(null);
    setShowSaveDialog(false);
    console.log("Recording saved in localStorage:", newRecording);
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
      {/* Fixed SVG overlay */}
      <div className={styles.svgOverlay}>
        <img src="/metallica-svg.svg" alt="Overlay SVG" />
      </div>
      <div className={styles.canvasContainer}>
        <Canvas
          className={styles.canvas}
          camera={{
            position: [-3.0235, 2.4680, -5.7622],
            fov: 50,
            rotation: [-2.7369, -0.4494, -2.9576]
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
            {/* BackgroundPicker will update the shared bgImage */}
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
      </div>
      {unsavedRecording && (
        <UnsavedPreviewBottomPlayer
          recordingUrl={unsavedRecording}
          onSave={() => setShowSaveDialog(true)}
          onDiscard={discardUnsaved}
          onClose={() => {}}
        />
      )}
      {showSaveDialog && unsavedRecording && (
        <SaveRecordingDialog recordingUrl={unsavedRecording} onSave={handleSaveUnsaved} onCancel={() => setShowSaveDialog(false)} />
      )}
      <ToastContainer />
    </div>
  );
}

export default DrumComp;
