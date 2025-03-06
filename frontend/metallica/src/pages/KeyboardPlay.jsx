import React, { useState } from "react";
import DrumComp from "../components/Keyboardcomp";
import Sidenav from "../components/sidenav";
import styles from "../components/DrumStyle.module.css";
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
  },
  Alternative: {
    w: "../../public/audios/alternative_bass.mp3",
    a: "../../public/audios/alternative_hat.mp3",
    s: "../../public/audios/alternative_snare.mp3",
    d: "../../public/audios/alternative_tom.mp3",
    q: "../../public/audios/alternative_crash.mp3",
    e: "../../public/audios/alternative_ride.mp3",
    r: "../../public/audios/alternative_floor_tom.mp3",
    t: "../../public/audios/alternative_splash.mp3",
  },
};
// ✅ Move KeyMapping Component OUTSIDE JSX
const KeyMapping = ({ soundMap, updateSoundMap }) => {
  const [newKeyMap, setNewKeyMap] = useState({ ...soundMap });
  const [error, setError] = useState("");
  const ALLOWED_KEYS = "abcdefghijklmnopqrstuvwxyz0123456789".split("");

  const handleChange = (e, oldKey) => {
    const updatedKey = e.target.value.toLowerCase();

    // Prevent duplicate key assignments
    if (Object.keys(newKeyMap).includes(updatedKey)) {
      setError(`Key "${updatedKey}" is already assigned.`);
      return;
    }

    setError(""); // Clear errors

    setNewKeyMap((prev) => {
      const updatedMap = { ...prev };
      const soundFile = prev[oldKey];

      delete updatedMap[oldKey];
      updatedMap[updatedKey] = soundFile;

      return updatedMap;
    });
  };

  const applyChanges = () => {
    updateSoundMap(newKeyMap);
    alert("Key mapping updated successfully! 🎵");
  };

  return (
    <div style={{ padding: "10px", border: "1px solid gray", marginBottom: "10px" }}>
      <h3>🎮 Customize Key Mapping</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {Object.keys(newKeyMap).map((key) => (
        <div key={key} style={{ marginBottom: "5px" }}>
          <label>
            {newKeyMap[key].split("/").pop()} - Press Key:{" "}
            <select value={key} onChange={(e) => handleChange(e, key)}>
              {ALLOWED_KEYS.map((allowedKey) => (
                <option key={allowedKey} value={allowedKey}>
                  {allowedKey.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
      ))}
      <button onClick={applyChanges} style={{ marginTop: "10px" }}>✅ Apply Changes</button>
    </div>
  );
};

export const KeyboardPlayer = () => {
  const [soundMap, setSoundMap] = useState(PRESET_MAPPINGS.Default);

  return (
    <div className={styles.container}>
      <div className={styles.sidenav}>
        <Sidenav />
      </div>

      <div className={styles.drumSection}>
        <DrumComp soundMap={soundMap} />
      </div>

      {/* <div className={styles.extraOptions}>
        <KeyMapping soundMap={soundMap} updateSoundMap={setSoundMap} />
      </div> */}
    </div>
  );
};
