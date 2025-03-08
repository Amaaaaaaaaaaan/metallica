import React, { useEffect, useState } from "react";
import styles from "../styles/Dashboard.module.css";
import BottomPlayer from "../components/BottomPlayer";

function Dashboard() {
  const [recordings, setRecordings] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("recordings");
    if (stored) {
      setRecordings(JSON.parse(stored));
    }
  }, []);

  const discardRecording = (index) => {
    const updated = recordings.filter((_, i) => i !== index);
    setRecordings(updated);
    localStorage.setItem("recordings", JSON.stringify(updated));
    if (activeTrack && recordings[index]?.dataUrl === activeTrack.dataUrl) {
      setActiveTrack(null);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.headerSection}>
        <div className={styles.headerImage}>
          <img
            src="https://misc.scdn.co/liked-songs/liked-songs-640.png"
            alt="Liked Songs"
          />
        </div>
        <div className={styles.headerText}>
          <span className={styles.playlistLabel}>Playlist</span>
          <h1 className={styles.playlistTitle}>Liked Songs</h1>
          <div className={styles.playlistSubtitle}>
            <span className={styles.username}>You</span>
            <span className={styles.separator}>•</span>
            <span>{recordings.length} songs</span>
          </div>
        </div>
      </header>

      <div className={styles.actionButtons}>
        <button className={styles.playButton}></button>
        <button className={styles.shuffleButton}></button>
        <button className={styles.downloadButton}></button>
      </div>

      <section className={styles.trackList}>
        <div className={`${styles.trackRow} ${styles.headerRow}`}>
          <span className={styles.headerHash}>#</span>
          <span className={styles.headerTitle}>Title & Description</span>
          <span className={styles.headerAlbum}>Album</span>
          <span className={styles.headerDate}>Date</span>
          <span className={styles.headerAudio}>Audio</span>
        </div>
        <div className={styles.trackListBody}>
          {recordings.map((track, idx) => (
            <div
              key={idx}
              className={styles.trackRow}
              onClick={() => setActiveTrack(track)}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.trackHash}>{idx + 1}</span>
              <span className={styles.trackTitle}>
                {track.title || `Recording ${idx + 1}`}
                {track.description && (
                  <span className={styles.trackDescription}>
                    {track.description}
                  </span>
                )}
              </span>
              <span className={styles.trackAlbum}>{track.album || "N/A"}</span>
              <div className={styles.dateDiscardCell}>
                <span className={styles.trackDate}>
                  {track.dateAdded || "Unknown date"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    discardRecording(idx);
                  }}
                  className={styles.discardButton}
                >
                  Discard
                </button>
              </div>
              <div className={styles.audioColumn}>
                <span style={{ color: "#1db954" }}>▶</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeTrack && (
        <BottomPlayer
          track={activeTrack}
          onClose={() => setActiveTrack(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
