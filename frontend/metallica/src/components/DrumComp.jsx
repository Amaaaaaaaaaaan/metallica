import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, useAnimations, useProgress, Html } from "@react-three/drei";
import { TextureLoader } from "three";
import styles from "./DrumStyle.module.css";
import KeyMapping from "./KeyMapping";

function Loader() {
  const { progress } = useProgress();
  const messages = [
    "Tuning the drums... 🎵",
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

  return (
    <primitive
      object={scene}
      scale={50}
      position={[0, -1, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Updates the scene background with a texture.
function CanvasBackground({ bgImage }) {
  const { scene } = useThree();

  useEffect(() => {
    if (bgImage) {
      new TextureLoader().load(bgImage, (texture) => {
        scene.background = texture;
      });
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
  // recordings now holds objects: { url, blob }
  const [recordings, setRecordings] = useState([]);
  const [bgImage, setBgImage] = useState(null);

  const activeKeys = useRef(new Set());
  const inactivityTimer = useRef(null);

  // Setup AudioContext and MediaRecorder once.
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
      setRecordings((prev) => [...prev, { url, blob }]);
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
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const discardRecording = (index) => {
    setRecordings((prev) =>
      prev.filter((_, idx) => idx !== index)
    );
  };

  // Save the recording to your backend using the full URL.
  const saveRecording = async (index) => {
    try {
      const recording = recordings[index];
      const formData = new FormData();
      // Replace "dummy-user-id" with your actual user ID from auth or context.
      formData.append("userId", "dummy-user-id");
      formData.append("audio", recording.blob, `recording-${Date.now()}.webm`);

      const response = await fetch("http://localhost:8080/audio/upload-audio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Saved recording:", data);
    } catch (error) {
      console.error("Error saving recording:", error);
    }
  };

  // Update background image from file input.
  const handleBgChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBgImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <Canvas
          className={styles.canvas}
          camera={{
            position: [-3.0235463847913526, 2.4680071247329516, -5.762152603378366],
            fov: 50,
            rotation: [-2.7369188843831083, -0.44942295148649, -2.957617815288093]
          }}
        >
          <Suspense fallback={<Loader />}>
            <CanvasBackground bgImage={bgImage} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <DrumsModel isPlaying={isAnimating} />
            <OrbitControls enableZoom={false} enablePan={false} />
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
        <div className={styles.bgChanger}>
          <label htmlFor="bg-input">Change Background:</label>
          <input
            id="bg-input"
            type="file"
            accept="image/*"
            onChange={handleBgChange}
          />
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
          <button 
            onClick={startRecording} 
            disabled={isRecording} 
            className={styles.triangleButton}
            title="Start Recording"
          >
            <span className="visually-hidden">Start Recording</span>
          </button>
          <button 
            onClick={stopRecording} 
            disabled={!isRecording} 
            className={styles.redCircleButton}
            title="Stop Recording"
          >
            <span className="visually-hidden">Stop Recording</span>
          </button>
        </div>
        <div className={styles.recordingsScrollable}>
          {recordings.length === 0 ? (
            <div className={styles.emptyMessage}>
              Why does it sound so empty? Record something!
            </div>
          ) : (
            recordings.map((recording, idx) => (
              <div key={idx} className={styles.recordingItem}>
                <audio controls src={recording.url} />
                <button 
                  onClick={() => discardRecording(idx)} 
                  className={styles.discardButton}
                  title="Discard Recording"
                >
                  Discard
                </button>
                <button 
                  onClick={() => saveRecording(idx)}
                  className={styles.saveButton}
                  title="Save Recording"
                >
                  Save Recording
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DrumComp;
