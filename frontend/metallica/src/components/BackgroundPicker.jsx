import React, { useState } from "react";
import styles from "./BackgroundPicker.module.css";

const colors = [
  // Grays
  "#000000", "#202020", "#404040", "#606060", "#808080", "#A0A0A0", "#C0C0C0", "#FFFFFF",
  // Reds
  "#8B0000", "#B22222", "#DC143C", "#FF0000", "#FF6347", "#FF7F7F",
  // Oranges
  "#FF8C00", "#FFA500", "#FFB347", "#FFDAB9",
  // Yellows
  "#FFFF00", "#FFD700", "#FFE135", "#FFFACD",
  // Greens
  "#006400", "#008000", "#00FF00", "#7FFF00", "#ADFF2F", "#98FB98",
  // Blues
  "#00008B", "#0000FF", "#4169E1", "#1E90FF", "#00BFFF", "#87CEFA",
  // Purples
  "#800080", "#8A2BE2", "#9370DB", "#BA55D3", "#EE82EE", "#DA70D6",
  // Pinks
  "#FF1493", "#FF69B4", "#FFC0CB", "#FFAEB9",
  // Browns / Earth Tones
  "#8B4513", "#A0522D", "#D2691E", "#F4A460"
];

const BackgroundPicker = ({ setBg }) => {
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [customColor, setCustomColor] = useState("#FFFFFF");

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setBg({ type: "color", value: color });
  };

  const handleCustomColorChange = (event) => {
    setCustomColor(event.target.value);
    setBg({ type: "color", value: event.target.value });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBg({ type: "image", value: e.target.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.backgroundPicker}>
      <div className={styles.header}>
        <span>🎨 SET Background</span>
        <div className={styles.imageOptions}>
          <label className={styles.colorInput}>
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
            />
          </label>
          <label className={styles.fileInput}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>
      </div>
      <div className={styles.colorGrid}>
        {colors.map((color, index) => (
          <div
            key={index}
            className={styles.colorBox}
            style={{
              backgroundColor: color,
              border: selectedColor === color ? "2px solid white" : "none"
            }}
            onClick={() => handleColorClick(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundPicker;
