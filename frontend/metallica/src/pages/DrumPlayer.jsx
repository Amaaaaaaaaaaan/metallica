import React from 'react';
import DrumComp from '../components/DrumComp';
import Sidenav from '../components/sidenav';
import KeyMapping from '../components/KeyMapping'; // ✅ Import KeyMapping component
import styles from '../components/DrumStyle.module.css'; // ✅ Import styles

export const DrumPlayer = () => {
  return (
    <div className={styles.container}>
      {/* ✅ Side Navigation (15%) */}
      <div className={styles.sidenav}>
        <Sidenav />
      </div>

      {/* ✅ Drum Component (45%) */}
      <div className={styles.drumSection}>
        <DrumComp />
      </div>

      {/* ✅ Extra Functionalities (40%) */}
      <div className={styles.extraOptions}>
        <KeyMapping />
        {/* Future functionalities can be added here */}
      </div>
    </div>
  );
};
