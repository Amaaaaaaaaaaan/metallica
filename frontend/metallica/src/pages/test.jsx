import React, { useState } from "react";
import styles from "../styles/test.module.css"; // Updated CSS file
import MusicGenerator from "./Musicgen";
import UnsavedPreviewBottomPlayer from "../components/UnsavedPreviewBottomPlayer";
import SaveRecordingDialog from "../components/SaveRecordingDialog";
import Sidenav from "../components/sidenav";

// Example list of music styles
const musicStyles = ["Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Reggae"];

function Test() {
  // State to track which styles are selected
  const [selected, setSelected] = useState([]);
  // State to track which corner is active for the border effect
  const [activeCorner, setActiveCorner] = useState("");
  // State to hold the unsaved recording URL (or Blob URL)
  const [unsavedRecording, setUnsavedRecording] = useState("");
  // State to control the display of the Save Recording dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Toggle a music style in the selected array
  const toggleSelection = (style) => {
    setSelected((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  // Tracks the mouse position to set which corner highlight is active
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

  // Reset the corner effect when the mouse leaves the element
  const handleMouseLeave = () => {
    setActiveCorner("");
  };

  // When the user clicks the Save button in the custom player, show the SaveRecordingDialog
  const handleSave = () => {
    setShowSaveDialog(true);
  };

  // Discard the unsaved recording
  const discardUnsaved = () => {
    console.log("Discarding unsaved recording...");
    setUnsavedRecording("");
  };

  // Handler when the user confirms saving the recording
  const handleSaveUnsaved = () => {
    console.log("Saving unsaved recording:", unsavedRecording);
    // Add your own saving logic here (e.g., uploading to a server)
    setShowSaveDialog(false);
    setUnsavedRecording("");
  };

  return (
    <>
      <Sidenav />
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

        {/* Music Generator */}
        <MusicGenerator
          selectedStyles={selected.join(", ")}
          onAudioGenerated={setUnsavedRecording}
        />

        {/* Unsaved Preview Player */}
        {unsavedRecording && (
          <UnsavedPreviewBottomPlayer
            recordingUrl={unsavedRecording}
            onSave={handleSave}
            onDiscard={discardUnsaved}
            onClose={() => console.log("Player closed")}
          />
        )}

        {/* Save Recording Dialog */}
        {showSaveDialog && unsavedRecording && (
          <SaveRecordingDialog
            recordingUrl={unsavedRecording}
            onSave={handleSaveUnsaved}
            onCancel={() => setShowSaveDialog(false)}
          />
        )}
      </div>
    </>
  );
}

export default Test;
