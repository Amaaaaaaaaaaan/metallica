import React, { useState, useRef, useEffect } from "react";
import styles from "./BottomPlayer.module.css";

const BottomPlayer = ({ track, onClose }) => {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5); // default volume at 50%
  const [isDragging, setIsDragging] = useState(false);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Setup audio event listeners once
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

  // Update audio src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!track?.dataUrl) {
      audio.src = "";
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      return;
    }
    audio.src = track.dataUrl;
    audio.preload = "metadata";
    audio.load();

    // Force-check duration after short delay in case browser is slow
    setTimeout(() => {
      if (isNaN(audio.duration) || !isFinite(audio.duration)) {
        audio.load();
      }
    }, 500);
  }, [track]);

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

  // Progress dragging handlers
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
    const progressBar = e.currentTarget.closest(`.${styles.progressContainer}`) || document.querySelector(`.${styles.progressContainer}`);
    if (progressBar) {
      const rect = progressBar.getBoundingClientRect();
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

  // Volume slider change
  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  // Download handler: creates a temporary anchor element to download the audio file
  const handleDownload = () => {
    if (!track?.dataUrl) return;
    const link = document.createElement("a");
    link.href = track.dataUrl;
    // Suggest a filename based on track title (or default if missing)
    link.download = `${track.title || "recording"}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.bottomPlayer}>
      <div className={styles.trackInfo}>
        <div className={styles.title}>{track?.title || "No Track Selected"}</div>
      </div>

      <div className={styles.controls}>
        <button onClick={togglePlay} className={styles.playButton}>
          {isPlaying ? "❚❚" : "►"}
        </button>

        <div className={styles.progressVolumeContainer}>
          <div
            className={styles.progressContainer}
            onMouseDown={handleMouseDown}
          >
            <div
              className={styles.progressBar}
              style={{
                width: duration ? `${(progress / duration) * 100}%` : "0%",
              }}
            ></div>
          </div>
          <div className={styles.volumeContainer}>
            <span className={styles.volumeIcon}>
              {/* Volume Low SVG */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
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
              {/* Volume High SVG */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </span>
          </div>
        </div>

        <div className={styles.timeDisplay}>
          {formatTime(progress)} / {formatTime(duration)}
        </div>
      </div>

      <div className={styles.extraButtons}>
        <button onClick={onClose} className={styles.closeButton}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default BottomPlayer;
