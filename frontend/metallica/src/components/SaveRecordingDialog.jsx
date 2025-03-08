import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./SaveRecordingDialog.module.css";

const SaveRecordingDialog = ({ recordingUrl, onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!recordingUrl) return;
    const newRecording = {
      title: title.trim() || "Untitled Recording",
      description: description.trim(),
      dataUrl: recordingUrl,
      dateAdded: new Date().toLocaleString(),
      album: "N/A",
      cover: ""
    };
    console.log("Saving new recording:", newRecording);
    onSave(newRecording);
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Save Your Recording</h2>
        <audio controls src={recordingUrl} className={styles.audioPreview} />
        <div className={styles.inputGroup}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
          />
        </div>
        <div className={styles.buttonRow}>
          <button onClick={handleSave} className={styles.saveButton}>
            Save Recording
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveRecordingDialog;
