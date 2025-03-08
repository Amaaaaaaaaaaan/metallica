import React, { useEffect, useState } from "react";
import styles from "../styles/Dashboard.module.css";
import BottomPlayer from "../components/BottomPlayer";
import Sidenav from "../components/sidenav";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function Dashboard() {
  const [recordings, setRecordings] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [sortOption, setSortOption] = useState("dateDesc"); // default sort

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

  // Create a sorted version of the recordings array based on sortOption
  const sortedRecordings = [...recordings].sort((a, b) => {
    if (sortOption === "alphabetical") {
      const titleA = (a.title || "Recording").toLowerCase();
      const titleB = (b.title || "Recording").toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    } else if (sortOption === "dateAsc") {
      // oldest first
      return new Date(a.dateAdded) - new Date(b.dateAdded);
    } else {
      // dateDesc: newest first
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
  });

  return (
    <>
      <Sidenav />
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
          {/* MUI Sort Options with custom styling */}
          <div className={styles.sortContainer}>
          <FormControl
  variant="outlined"
  size="small"
  sx={{
    backgroundColor: "#fff",
    borderRadius: 1,
    minWidth: 150,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  }}
>
  <InputLabel id="sort-select-label" sx={{ color: "#fff",top : -12 ,fontSize:21}}>
    Sort by
  </InputLabel>
  <Select
    labelId="sort-select-label"
    id="sort-select"
    value={sortOption}
    label="Sort by"
    onChange={(e) => setSortOption(e.target.value)}
    sx={{ color: "#000", backgroundColor: "#fff" }}
  >
    <MenuItem value="dateDesc">Date (Newest First)</MenuItem>
    <MenuItem value="dateAsc">Date (Oldest First)</MenuItem>
    <MenuItem value="alphabetical">Alphabetical</MenuItem>
  </Select>
</FormControl>

          </div>
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
            {sortedRecordings.map((track, idx) => (
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
    </>
  );
}

export default Dashboard;
