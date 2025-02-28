import React, { useState } from "react";

const KeyMapping = ({ soundMap, updateSoundMap }) => {
  const [newKeyMap, setNewKeyMap] = useState({ ...soundMap });
  const [error, setError] = useState("");

  const handleChange = (e, oldKey) => {
    const updatedKey = e.target.value.toLowerCase();
    
    if (!updatedKey.match(/^[a-z0-9]$/)) {
      setError("Only letters and numbers are allowed.");
      return;
    }

    // Prevent duplicate key assignments
    if (Object.keys(newKeyMap).includes(updatedKey)) {
      setError(`Key "${updatedKey}" is already assigned.`);
      return;
    }

    setError(""); // Clear errors

    setNewKeyMap((prev) => {
      const updatedMap = { ...prev };
      const soundFile = prev[oldKey];

      delete updatedMap[oldKey]; // Remove old key binding
      updatedMap[updatedKey] = soundFile; // Assign new key binding

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
            <input
              type="text"
              maxLength={1}
              defaultValue={key}
              onChange={(e) => handleChange(e, key)}
            />
          </label>
        </div>
      ))}
      <button onClick={applyChanges} style={{ marginTop: "10px" }}>✅ Apply Changes</button>
    </div>
  );
};

export default KeyMapping;
