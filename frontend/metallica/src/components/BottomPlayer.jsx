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

  // Update audio src when track changes using track.src (streaming URL)
  useEffect(() => {
    const audio = audioRef.current;
    if (!track?.src) {
      audio.src = "";
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      return;
    }
    audio.src = track.src;
    audio.preload = "metadata";
    audio.load();

    // Force-check duration after a short delay in case browser is slow
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
    const progressBar =
      e.currentTarget.closest(`.${styles.progressContainer}`) ||
      document.querySelector(`.${styles.progressContainer}`);
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
  const handleDownload = async () => {
    if (!track?.src) return;
    try {
      const response = await fetch(track.src);
      if (!response.ok) throw new Error("Failed to fetch audio file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Suggest a filename; adjust extension as needed
      link.download = `${track.title || "recording"}.flac`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };
  

  return (
    <div className={styles.bottomPlayer}>
      <div className={styles.trackInfo}>
        <div className={styles.title}>
          {track?.title ||
            (track?.filename
              ? track.filename.replace(/\.[^/.]+$/, "")
              : "No Track Selected")}
        </div>
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

        <div className={styles.timeDownloadContainer}>
          <div className={styles.timeDisplay}>
            {formatTime(progress)} / {formatTime(duration)}
          </div>
          
       
          
        </div>
        <div><div
            onClick={handleDownload}
            style={{ cursor: "pointer" }} 
            className={styles.downloadButton}
            title="Download"
          >
           <svg fill="#1DB954" width="24" height="24" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 537.794 537.795" xml:space="preserve" stroke="#1DB954"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M463.091,466.114H74.854c-11.857,0-21.497,9.716-21.497,21.497v28.688c0,11.857,9.716,21.496,21.497,21.496h388.084 c11.857,0,21.496-9.716,21.496-21.496v-28.688C484.665,475.677,474.949,466.114,463.091,466.114z"></path> <path d="M253.94,427.635c4.208,4.208,9.716,6.35,15.147,6.35c5.508,0,11.016-2.142,15.147-6.35l147.033-147.033 c8.339-8.338,8.339-21.955,0-30.447l-20.349-20.349c-8.339-8.339-21.956-8.339-30.447,0l-75.582,75.659V21.497 C304.889,9.639,295.173,0,283.393,0h-28.688c-11.857,0-21.497,9.562-21.497,21.497v284.044l-75.658-75.659 c-8.339-8.338-22.032-8.338-30.447,0l-20.349,20.349c-8.338,8.338-8.338,22.032,0,30.447L253.94,427.635z"></path> </g> </g> </g></svg>
          </div></div>
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
