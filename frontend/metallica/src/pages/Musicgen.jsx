import React, { useState, useEffect } from "react";
import Button from "../components/Button"; // Import the custom Button component

function MusicGenerator({ selectedStyles }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    setPrompt(selectedStyles);
  }, [selectedStyles]);

  const generateMusic = async () => {
    if (!prompt) {
      alert("Please enter a music description.");
      return;
    }

    setLoading(true);
    setAudioUrl(null); // Clear previous audio

    try {
      const response = await fetch("https://api-inference.huggingface.co/models/facebook/musicgen-small", {
        method: "POST",
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate music");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error generating music:", error);
      alert("Failed to generate music. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>METALLICA AI MUSIC GENERATOR</h1>
      <h3 style={styles.subtitle}>No musical experience? No problem! We've got everything you need to create amazing tunes!</h3>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter music description"
        style={styles.input}
      />
      <div style={styles.buttonContainer}>
        <Button onClick={generateMusic} label="Generate" className={styles.generateButton}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {loading && <div style={styles.loading}>Generating music, please wait...</div>}

      {audioUrl && (
        <div style={styles.audioContainer}>
          <audio controls autoPlay style={styles.audio}>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#121212", // Black background
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(255, 77, 148, 0.6)", // Pinkish-purple glow
    maxWidth: "600px",
    margin: "auto",
    marginTop: "50px",
  },
  title: {
    fontSize: "2.5em",
    color: "#FF4D94", // Pinkish-purple
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1.2em",
    color: "#FF4D94", // Pinkish-purple
    marginBottom: "20px",
  },
  input: {
    padding: "12px",
    width: "90%",
    borderRadius: "8px",
    border: "2px solid #FF4D94", // Pinkish-purple border
    backgroundColor: "#222",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    marginBottom: "10px",
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
  },
  generateButton: {
    width: "100%",
    maxWidth: "300px",
  },
  button: {
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#FF4D94",
    color: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "0.3s",
  },
  buttonHover: {
    backgroundColor: "#E60073", // Slightly darker shade on hover
  },
  loading: {
    marginTop: "10px",
    color: "#FF4D94", // Pinkish-purple for loading text
    fontWeight: "bold",
  },
  audioContainer: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#222",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(255, 77, 148, 0.3)", // Subtle glow
  },
  audio: {
    width: "100%",
    borderRadius: "5px",
  },
};

export default MusicGenerator;
