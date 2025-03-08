import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./SaveRecordingDialog.module.css";

const SaveRecordingDialog = ({ recordingUrl, onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Display a toast when the recording is started
    toast.info("Recording started");
  }, []);

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
      {/* Toast Container for notifications */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>,
    document.body
  );
};

export default SaveRecordingDialog;
