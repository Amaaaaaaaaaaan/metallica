import React from "react";
import DrumComp from "../components/DrumComp";
import Sidenav from "../components/sidenav";
import styles from "../components/DrumStyle.module.css";

export const DrumPlayer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.sidenav}>
        <Sidenav />
      </div>
      <div className={styles.drumSection}>
        {/* DrumComp now uses shared settings from the context */}
        <DrumComp />
      </div>
    </div>
  );
};
