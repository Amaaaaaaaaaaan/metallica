// SettingContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [volume, setVolume] = useState(1.0);
  const [bgImage, setBgImage] = useState({ type: "color", value: "#000000" });
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  return (
    <SettingsContext.Provider value={{ volume, setVolume, bgImage, setBgImage, audioContext }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
