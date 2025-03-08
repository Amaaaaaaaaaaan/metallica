import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import SaveRecordingDialog from "./SaveRecordingDialog";
import styles from "./UnsavedPreviewBottomPlayer.module.css";

const UnsavedPreviewBottomPlayer = ({
  recordingUrl,
  onSave,      // changed prop name from onFinalSave to onSave
  onDiscard,
  onClose,
}) => {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Update audio element's volume when volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const updateDuration = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const updateProgress = () => {
      if (!isDragging) {
        setProgress(audio.currentTime);
      }
    };

    const resetPlayer = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", resetPlayer);

    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", resetPlayer);
    };
  }, [isDragging]);

  // Update audio source when recordingUrl changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!recordingUrl) {
      audio.src = "";
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      return;
    }
    audio.src = recordingUrl;
    audio.preload = "metadata";
    audio.load();

    setTimeout(() => {
      if (isNaN(audio.duration) || !isFinite(audio.duration)) {
        audio.load();
      }
    }, 500);
  }, [recordingUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio.src) return;
    if (!isPlaying) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Draggable progress bar handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleProgressUpdate(e);
    document.addEventListener("mousemove", handleProgressUpdate);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
    handleProgressUpdate(e);
    document.removeEventListener("mousemove", handleProgressUpdate);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleProgressUpdate = (e) => {
    const progressContainer = document.querySelector(`.${styles.progressContainer}`);
    if (progressContainer) {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      setProgress(newTime);
      if (audioRef.current && isDragging) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const formatTime = (t) => {
    if (!t || isNaN(t) || !isFinite(t)) return "0:00";
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleDialogSave = (newTrackData) => {
    onSave(newTrackData);
    setShowSaveDialog(false);
  };

  return ReactDOM.createPortal(
    <>
      {recordingUrl && (
        <div className={styles.playerContainer}>
          {/* Left Section: Cover and Track Info */}
          <div className={styles.leftSection}>
            <img
              src={"../public/Metallica_logo.png"}
              alt="cover"
              className={styles.coverImage}
            />
            <div className={styles.trackInfo}>
              <span className={styles.trackTitle}>Unsaved Recording</span>
              <span className={styles.trackArtist}>Unknown Artist</span>
            </div>
          </div>
          {/* Center Section: Controls and Progress */} 
          <div className={styles.centerSection}>
            <div className={styles.controlButtons}>
              <button className={styles.iconButton}>🔀</button>
              <button className={styles.iconButton}>⏮</button>
              <button onClick={togglePlay} className={styles.playPauseButton}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button className={styles.iconButton}>⏭</button>
              <button className={styles.iconButton}>🔁</button>
            </div>
            <div className={styles.progressRow}>
              <span className={styles.timeText}>{formatTime(progress)}</span>
              <div className={styles.progressContainer} onMouseDown={handleMouseDown}>
                <div
                  className={styles.progressBar}
                  style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
                ></div>
              </div>
              <span className={styles.timeText}>{formatTime(duration)}</span>
            </div>
          </div>
          {/* Right Section: Volume and Save/Discard */} 
          <div className={styles.rightSection}>
            <div className={styles.volumeContainer}>
              <span className={styles.volumeIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" />
                </svg>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />
              <span className={styles.volumeIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </span>
            </div>
            <button onClick={() => setShowSaveDialog(true)} className={styles.saveButton}>
              Save
            </button>
            <button onClick={onDiscard} className={styles.discardButton}>
              Discard
            </button>
          </div>
          {onClose && (
            <button onClick={onClose} className={styles.closeButton}>✖</button>
          )}
        </div>
      )}
      {showSaveDialog && recordingUrl && (
        <SaveRecordingDialog
          recordingUrl={recordingUrl}
          onSave={handleDialogSave}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </>,
    document.body
  );
};

export default UnsavedPreviewBottomPlayer;
