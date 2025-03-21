import React, { useState } from "react";
import styles from "./BackgroundPicker.module.css";

// Exactly 36 colors, arranged to match your 3x12 layout
const colorGrid = [
  // Row 1 (12 colors)
  "#000000","#202020","#404040","#606060","#808080","#A0A0A0","#C0C0C0","#FFFFFF","#FF0000","#FF6600","#FFFF00","#00FF00",
  // Row 2 (12 colors)
  "#00FFFF","#0000FF","#800080","#FF00FF","#FF1493","#8B4513","#B22222","#FF6347","#008080","#FFD700","#DC143C","#7FFF00",
  // Row 3 (12 colors)
  "#8A2BE2","#9370DB","#ADFF2F","#98FB98","#87CEFA","#1E90FF","#FF7F7F","#D2691E","#FF8C00","#006400","#A0522D","#F4A460"
];

// Helper to convert a hex color to [R, G, B]
const hexToRGB = (hex) => {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
};

const BackgroundPicker = ({ setBg }) => {
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [customColor, setCustomColor] = useState("#FFFFFF");

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setCustomColor(color);
    setBg({ type: "color", value: color });
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
    setBg({ type: "color", value: color });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setBg({ type: "image", value: evt.target.result });
      reader.readAsDataURL(file);
    }
  };

  const [r, g, b] = hexToRGB(selectedColor);

  return (
    <div className={styles.backgroundPicker}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Background</span>
        <div className={styles.controls}>
          {/* Color Input */}
          <label className={styles.colorInput}>
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
            />
          </label>
          {/* Image Upload */}
          <label className={styles.fileInput}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>

      {/* 3x12 Grid of Colors */}
      <div className={styles.colorGrid}>
        {colorGrid.map((color, index) => (
          <div
            key={index}
            className={styles.colorBox}
            style={{
              backgroundColor: color,
              outline: selectedColor === color ? "2px solid #fff" : "none"
            }}
            onClick={() => handleColorClick(color)}
          />
        ))}
      </div>

      {/* HEX & RGB Display */}
      <div className={styles.colorInfo}>
        <span className={styles.hex}>#{selectedColor.replace("#", "")}</span>
        <span className={styles.rgb}>R {r} G {g} B {b}</span>
      </div>
    </div>
  );
};

export default BackgroundPicker;