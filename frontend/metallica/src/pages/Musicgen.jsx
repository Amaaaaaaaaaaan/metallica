import React, { useState } from "react";

function MusicGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

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
      <button onClick={generateMusic} style={styles.button}>
        {loading ? "Generating..." : "Generate Music"}
      </button>

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
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    margin: "auto",
    marginTop: "50px",
  },
  title: {
    fontSize: "2.5em",
    color: "#333",
  },
  subtitle: {
    fontSize: "1.2em",
    color: "#666",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    width: "300px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  loading: {
    marginTop: "10px",
    color: "red",
  },
  audioContainer: {
    marginTop: "20px",
  },
  audio: {
    width: "100%",
  },
};

export default MusicGenerator;
