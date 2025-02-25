
import React, { useState } from "react";
import styles from "../styles/test.module.css"; // Import the CSS module
import MusicGenerator from "./Musicgen"; // Import the MusicGenerator component
import Button from "../components/Button"; // Import the custom Button component

const musicStyles = ["Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Reggae"];

function PromptSelector() {
  const [selected, setSelected] = useState([]);
  const [activeCorner, setActiveCorner] = useState("");

  const toggleSelection = (style) => {
    setSelected((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    if (x < width / 2 && y < height / 2) {
      setActiveCorner(styles.topLeft);
    } else if (x >= width / 2 && y < height / 2) {
      setActiveCorner(styles.topRight);
    } else if (x < width / 2 && y >= height / 2) {
      setActiveCorner(styles.bottomLeft);
    } else {
      setActiveCorner(styles.bottomRight);
    }
  };

  const handleMouseLeave = () => {
    setActiveCorner("");
  };

  return (
    <div className={styles.gridContainer}>
      <h1 className={styles.title}>Choose Your Style</h1>

      <div
        className={`${styles.bigBorder} ${activeCorner}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.grid}>
          {musicStyles.map((style, index) => (
            <div
              key={index}
              className={`${styles.item} ${
                selected.includes(style) ? styles.selected : ""
              }`}
              onClick={() => toggleSelection(style)}
            >
              {style}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.prompt}>
        <strong>Your Prompt:</strong> {selected.join(", ") || "None"}
      </div>

      {/* Add the MusicGenerator component and pass the selected styles as a prop */}
      <MusicGenerator selectedStyles={selected.join(", ")} />

      {/* Add a custom button with reduced text size */}
    </div>
  );
}

export default PromptSelector;