import React, { useState } from "react";

const ALLOWED_KEYS = "abcdefghijklmnopqrstuvwxyz0123456789".split("");

const KeyMapping = ({ soundMap, updateSoundMap }) => {
  const [newKeyMap, setNewKeyMap] = useState({ ...soundMap });
  const [error, setError] = useState("");

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

export default KeyMapping;
