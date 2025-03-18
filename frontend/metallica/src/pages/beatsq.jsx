import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/beatsq.module.css";


// Import instrument images from your assets folder:
import crashImg from "../assets/beatsq_images/drum1.png";
import hiHatImg from "../assets/beatsq_images/drum2.png";
import snareImg from "../assets/beatsq_images/drumclap.png";
import clapImg from "../assets/beatsq_images/drum4.png";
import rightTomImg from "../assets/beatsq_images/drum5.png";
import leftTomImg from "../assets/beatsq_images/drum6.png";
import floorTomImg from "../assets/beatsq_images/drum7.png";
import kickImg from "../assets/beatsq_images/drum8.png";

// Store imported images in an array (order matters)
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

const TICKS = 16;
const MAX_BITS = 4;
const MAX_HEX = 1;

/** Convert binary string to hex string */
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

/** Convert hex string back to binary string */
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

/** Sound file paths corresponding to the drums */
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

/**
 * Color pairs for each drum row.
 * These colors match your reference:
 * 1. Purple, 2. Golden Yellow, 3. Golden Yellow, 4. Teal/Cyan,
 * 5. Cyan, 6. Turquoise, 7. Purple again.
 */
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

const Beatboxer = () => {
  // AudioContext and Buffers
  const audioCtx = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const [buffers, setBuffers] = useState([]);

  // Grid state: each row corresponds to a drum (7 rows), each column is a step
  const [grid, setGrid] = useState(
    Array.from({ length: sounds.length }, () => Array(TICKS).fill(false))
  );

  // Sequencer Controls
  const [isRunning, setIsRunning] = useState(false);
  const [curTick, setCurTick] = useState(0);
  // BPM Control: Adjustable speed (minimum 100 BPM)
  const [bpm, setBpm] = useState(120);

  // Recording Controls
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Dark/Light Mode
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "light" ? false : true
  );

  // Load Sounds on mount
  useEffect(() => {
    const loadSounds = async () => {
      const buffersArray = await Promise.all(
        sounds.map(async (sound) => {
          const response = await fetch(sound);
          const arrayBuffer = await response.arrayBuffer();
          return audioCtx.current.decodeAudioData(arrayBuffer);
        })
      );
      setBuffers(buffersArray);
    };
    loadSounds();
  }, []);

  // Sequencer Interval: Recalculate based on current BPM.
  useEffect(() => {
    if (!isRunning) return;
    const interval = (60 * 1000) / (bpm * 4);
    const intervalId = setInterval(() => {
      setCurTick((prevTick) => (prevTick + 1) % TICKS);
    }, interval);
    return () => clearInterval(intervalId);
  }, [isRunning, bpm]);

  // Play Sounds on current tick
  useEffect(() => {
    if (buffers.length === 0) return;
    playSounds(curTick);
  }, [curTick]);

  // Dark Mode Effect: Update body class and localStorage.
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // URL Hash: Restore state on mount and on hash changes.
  useEffect(() => {
    restoreState();
    const handleHashChange = () => {
      restoreState();
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Toggle a beat in the grid.
  const toggleBeat = (row, col) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r, rIndex) =>
        rIndex === row ? r.map((c, cIndex) => (cIndex === col ? !c : c)) : r
      );
      updateStateHash(newGrid);
      return newGrid;
    });
  };

  // Play all sounds for the current tick.
  const playSounds = (tick) => {
    if (!isRunning) return;
    grid.forEach((row, rowIndex) => {
      if (row[tick] && buffers[rowIndex]) {
        const source = audioCtx.current.createBufferSource();
        source.buffer = buffers[rowIndex];
        source.connect(audioCtx.current.destination);
        source.start();
      }
    });
  };

  // Start recording audio.
  const startRecording = () => {
    setIsRecording(true);
    audioChunks.current = [];
    const dest = audioCtx.current.createMediaStreamDestination();
    mediaRecorder.current = new MediaRecorder(dest.stream);
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };
    mediaRecorder.current.start();
  };

  // Stop recording audio.
  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      const audioURL = URL.createObjectURL(audioBlob);
      const link = document.createElement("a");
      link.href = audioURL;
      link.download = "recording.wav";
      link.click();
    };
  };

  // Update the URL hash with the current grid state.
  const updateStateHash = (newGrid) => {
    let binaryString = "";
    newGrid.forEach((row) => {
      row.forEach((beatOn) => {
        binaryString += beatOn ? "1" : "0";
      });
    });
    const hex = binToHex(binaryString);
    window.location.hash = hex;
  };

  // Restore grid state from URL hash.
  const restoreState = () => {
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
  };

  // Restart Sequencer: Clears grid, resets tick, updates URL hash, restarts sequencer.
  const restartSequencer = () => {
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
  };

  return (
    <div className="beatboxer">
      <div className={styles.localMargin}>
        <div className={styles.controls}>
          <button className= {styles.SQbutton} onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "Stop Sequencer" : "Start Sequencer"}
          </button>
          <button className= {styles.SQbutton} onClick={restartSequencer}>Restart</button>
          <button className= {styles.SQbutton} onClick={startRecording} disabled={isRecording}>
            Start Recording
          </button>
          <button className= {styles.SQbutton} onClick={stopRecording} disabled={!isRecording}>
            Stop Recording
          </button>
          <button className= {styles.SQbutton} id="modeToggle" onClick={() => setIsDarkMode(!isDarkMode)}>
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
            <button className= {styles.SQbutton} onClick={() => setBpm((prev) => (prev > 100 ? prev - 5 : 100))}>
              -
            </button>
            <span>{bpm} BPM</span>
            <button className= {styles.SQbutton} onClick={() => setBpm((prev) => prev + 5)}>+</button>
          </div>
        </div>

        <div className={styles.grid}>
          {grid.map((row, rowIndex) => {
            // Retrieve the on/off colors for this row
            const { on: onColor, off: offColor } =
              instrumentColors[rowIndex] || { on: "#444", off: "#222" };

            return (
              <div key={rowIndex} className={styles.row}>
                {/* Insert the instrument image at the beginning of each row.
                    For the first 7 rows, use the imported images */}
                {rowIndex < instrumentImages.length && (
                  <img
                    src={instrumentImages[rowIndex]}
                    alt={`Instrument ${rowIndex + 1}`}
                    className={styles.instrumentImage}
                  />
                )}
                {row.map((isOn, colIndex) => {
                  const backgroundColor = isOn ? onColor : offColor;
                  // Highlight the current tick by reducing opacity
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
