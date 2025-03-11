import React from "react";
import DrumComp from "../components/keyboardcomp"; // Use the same or a different component if needed
import Sidenav from "../components/sidenav";
import styles from "../components/DrumStyle.module.css";

export const KeyboardPlayer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.sidenav}>
        <Sidenav />
      </div>
      <div className={styles.drumSection}>
        {/* KeyboardPlayer now renders DrumComp which uses the shared settings */}
        <DrumComp />
      </div>
    </div>
  );
};
