import React from 'react';
import ReactPlayer from 'react-player';

function BackgroundVideo() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      <ReactPlayer
        url="/shortVid.mp4" // Ensure this path is correct relative to your public folder
        playing
        loop
        muted
        width="100%"
        height="100%"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}

export default BackgroundVideo;
