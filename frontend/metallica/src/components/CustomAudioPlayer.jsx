import React, { useState, useRef, useEffect } from "react";
import styles from "./CustomAudioPlayer.module.css";

const CustomAudioPlayer = ({ src }) => {
  const audioRef = useRef(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update duration and progress as the audio loads and plays.
  useEffect(() => {
    const audio = audioRef.current;
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  // If the src changes, update the audio element.
  useEffect(() => {
    audioRef.current.src = src;
    setIsPlaying(false);
    setProgress(0);
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={styles.audioPlayerContainer}>
      <button onClick={togglePlay} className={styles.playButton}>
        {isPlaying ? "❚❚" : "►"}
      </button>
      <div className={styles.progressBar} onClick={handleProgressClick}>
        <div
          className={styles.progressFill}
          style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
        ></div>
      </div>
      <div className={styles.timeDisplay}>
        {formatTime(progress)} / {formatTime(duration)}
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
