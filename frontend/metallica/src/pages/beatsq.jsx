import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/beatsq.module.css";

// Instrument images (8 total)
import crashImg from "../assets/beatsq_images/drum1.png";
import hiHatImg from "../assets/beatsq_images/drum2.png";
import snareImg from "../assets/beatsq_images/drumclap.png";
import clapImg from "../assets/beatsq_images/drum4.png";
import rightTomImg from "../assets/beatsq_images/drum5.png";
import leftTomImg from "../assets/beatsq_images/drum6.png";
import floorTomImg from "../assets/beatsq_images/drum7.png";
import kickImg from "../assets/beatsq_images/drum8.png";
import Sidenav from "../components/sidenav";

const instrumentImages = [
  crashImg,
  hiHatImg,
  snareImg,
  clapImg,
  rightTomImg,
  leftTomImg,
  floorTomImg,
  kickImg,
];

// 8 sounds matching the 8 images above:
const sounds = [
  "/audios/cl_hi_hat.wav",
  "/audios/claves.wav",
  "/audios/cowbell.wav",
  "/audios/hand_clap.wav",
  "/audios/hat+bass.mp3",
  "/audios/hi_tom.wav",
  "/audios/maracas.wav",
  "/audios/mid_tom.wav",
];

// 8 color pairs (one per row)
const instrumentColors = [
  { on: "#9c27b0", off: "#4e165a" },
  { on: "#ffc107", off: "#7f6105" },
  { on: "#ffc107", off: "#7f6105" },
  { on: "#00bcd4", off: "#005f6a" },
  { on: "#00bcd4", off: "#005f6a" },
  { on: "#009688", off: "#004d43" },
  { on: "#009688", off: "#004d43" },
  { on: "#9c27b0", off: "#4e165a" },
];

// For 16-step sequencer
const TICKS = 16;

// For encoding/decoding the grid in the URL
const MAX_BITS = 4;
const MAX_HEX = 1;
function binToHex(bin) {
  let hex = "";
  for (let i = 0; i < bin.length; i += MAX_BITS) {
    let chunk = bin.substr(i, MAX_BITS);
    let tmp = parseInt(chunk, 2).toString(16);
    while (tmp.length < MAX_HEX) {
      tmp = "0" + tmp;
    }
    hex += tmp;
  }
  return hex;
}
function hexToBin(hex) {
  let bin = "";
  for (let i = 0; i < hex.length; i += MAX_HEX) {
    let chunk = hex.substr(i, MAX_HEX);
    let tmp = parseInt(chunk, 16).toString(2);
    while (tmp.length < MAX_BITS) {
      tmp = "0" + tmp;
    }
    bin += tmp;
  }
  return bin;
}

const Beatboxer = () => {
  // ---------------------------
  // Audio + Recording Refs
  // ---------------------------
  const audioCtx = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const masterGainRef = useRef(null);      // Master gain node
  const destRef = useRef(null);            // MediaStreamDestination
  const mediaRecorderRef = useRef(null);   // MediaRecorder
  const audioChunksRef = useRef([]);

  // Once loaded, we store decoded buffers in state
  const [buffers, setBuffers] = useState([]);

  // ---------------------------
  // Sequencer State
  // ---------------------------
  const [grid, setGrid] = useState(
    Array.from({ length: sounds.length }, () => Array(TICKS).fill(false))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [curTick, setCurTick] = useState(0);
  const [bpm, setBpm] = useState(120);

  // ---------------------------
  // Recording State
  // ---------------------------
  const [isRecording, setIsRecording] = useState(false);

  // ---------------------------
  // Dark/Light Mode
  // ---------------------------
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "light" ? false : true
  );

  // ---------------------------
  // Load sounds on mount
  // ---------------------------
  useEffect(() => {
    const loadSounds = async () => {
      const loadedBuffers = await Promise.all(
        sounds.map(async (soundPath) => {
          const response = await fetch(soundPath);
          const arrayBuffer = await response.arrayBuffer();
          return audioCtx.current.decodeAudioData(arrayBuffer);
        })
      );
      setBuffers(loadedBuffers);
    };
    loadSounds();
  }, []);

  // ---------------------------
  // Setup master gain + recorder
  // ---------------------------
  useEffect(() => {
    // Create a master gain node
    masterGainRef.current = audioCtx.current.createGain();
    masterGainRef.current.connect(audioCtx.current.destination);

    // Create a MediaStreamDestination so we can record the master output
    destRef.current = audioCtx.current.createMediaStreamDestination();
    // Connect the masterGain to the media destination
    masterGainRef.current.connect(destRef.current);

    // Prepare MediaRecorder from that stream
    mediaRecorderRef.current = new MediaRecorder(destRef.current.stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    mediaRecorderRef.current.onstop = () => {
      // Create a Blob from all recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioChunksRef.current = [];

      // Turn it into a downloadable link
      const audioURL = URL.createObjectURL(audioBlob);
      const link = document.createElement("a");
      link.href = audioURL;
      // If you prefer .wav in the name, that’s fine, though the actual format is webm/opus
      link.download = "recording.webm";
      link.click();
    };
  }, []);

  // ---------------------------
  // Sequencer Tick
  // ---------------------------
  useEffect(() => {
    if (!isRunning) return;
    // Make sure audio context is resumed
    resumeAudioContext();
    const interval = (60 * 1000) / (bpm * 4);
    const intervalId = setInterval(() => {
      setCurTick((prev) => (prev + 1) % TICKS);
    }, interval);
    return () => clearInterval(intervalId);
  }, [isRunning, bpm]);

  // Play sounds on the current tick
  useEffect(() => {
    if (!buffers.length) return;
    if (!isRunning) return;
    playSounds(curTick);
  }, [curTick, buffers, isRunning]);

  // ---------------------------
  // Dark Mode effect
  // ---------------------------
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // ---------------------------
  // Restore grid from URL hash
  // ---------------------------
  useEffect(() => {
    restoreState();
    const handleHashChange = () => restoreState();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ---------------------------
  // Helper functions
  // ---------------------------
  function resumeAudioContext() {
    if (audioCtx.current.state !== "running") {
      audioCtx.current.resume();
    }
  }

  function toggleBeat(row, col) {
    resumeAudioContext();
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r, rIndex) =>
        rIndex === row ? r.map((c, cIndex) => (cIndex === col ? !c : c)) : r
      );
      updateStateHash(newGrid);
      return newGrid;
    });
  }

  function playSounds(tick) {
    // For each row (instrument), if that row is "on" at the current tick, play it
    grid.forEach((row, rowIndex) => {
      if (row[tick] && buffers[rowIndex]) {
        const source = audioCtx.current.createBufferSource();
        source.buffer = buffers[rowIndex];
        // Connect to masterGain so we can hear & record it
        source.connect(masterGainRef.current);
        source.start();
      }
    });
  }

  function updateStateHash(newGrid) {
    let binaryString = "";
    newGrid.forEach((row) => {
      row.forEach((beatOn) => {
        binaryString += beatOn ? "1" : "0";
      });
    });
    const hex = binToHex(binaryString);
    window.location.hash = hex;
  }

  function restoreState() {
    let hash = window.location.hash;
    if (!hash) return;
    hash = hash.substring(1);
    const bin = hexToBin(hash);
    const totalBits = sounds.length * TICKS;
    if (bin.length !== totalBits) return;
    const newGrid = [];
    let index = 0;
    for (let i = 0; i < sounds.length; i++) {
      const rowArr = [];
      for (let j = 0; j < TICKS; j++) {
        rowArr.push(bin[index] === "1");
        index++;
      }
      newGrid.push(rowArr);
    }
    setGrid(newGrid);
  }

  function restartSequencer() {
    setIsRunning(false);
    const clearedGrid = Array.from({ length: sounds.length }, () =>
      Array(TICKS).fill(false)
    );
    setGrid(clearedGrid);
    updateStateHash(clearedGrid);
    setCurTick(0);
    setTimeout(() => {
      setIsRunning(true);
    }, 100);
  }

  // ---------------------------
  // Recording functions
  // ---------------------------
  function startRecording() {
    resumeAudioContext();
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === "inactive") {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="beatboxer">
    <Sidenav></Sidenav>

      <div className={styles.localMargin}>
        {/* Top controls */}
        <div className={styles.controls}>
          <button
            className={styles.SQbutton}
            onClick={() => {
              resumeAudioContext();
              setIsRunning(!isRunning);
            }}
          >
            {isRunning ? "Stop Sequencer" : "Start Sequencer"}
          </button>
          <button className={styles.SQbutton} onClick={restartSequencer}>
            Restart
          </button>

          <button
            className={styles.SQbutton}
            onClick={startRecording}
            disabled={isRecording}
          >
            Start Recording
          </button>
          <button
            className={styles.SQbutton}
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop Recording
          </button>

          <button
            className={styles.SQbutton}
            id="modeToggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>

          {/* BPM Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginLeft: "10px",
            }}
          >
            <button
              className={styles.SQbutton}
              onClick={() => setBpm((prev) => (prev > 100 ? prev - 5 : 100))}
            >
              -
            </button>
            <span>{bpm} BPM</span>
            <button
              className={styles.SQbutton}
              onClick={() => setBpm((prev) => prev + 5)}
            >
              +
            </button>
          </div>
        </div>

        {/* Sequencer Grid */}
        <div className={styles.grid}>
          {grid.map((row, rowIndex) => {
            const { on: onColor, off: offColor } =
              instrumentColors[rowIndex] || { on: "#444", off: "#222" };

            return (
              <div key={rowIndex} className={styles.row}>
                {/* Show the drum image on the left */}
                {rowIndex < instrumentImages.length && (
                  <img
                    src={instrumentImages[rowIndex]}
                    alt={`Instrument ${rowIndex + 1}`}
                    className={styles.instrumentImage}
                  />
                )}

                {row.map((isOn, colIndex) => {
                  const backgroundColor = isOn ? onColor : offColor;
                  const isTicked = curTick === colIndex;
                  const opacity = isTicked ? 0.7 : 1.0;
                  return (
                    <button
                      key={colIndex}
                      className={styles.beat}
                      style={{
                        backgroundColor,
                        border: "none",
                        opacity,
                      }}
                      onClick={() => toggleBeat(rowIndex, colIndex)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Beatboxer;
