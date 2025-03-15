// MusicGenerator.jsx
import React, { useState, useEffect } from "react";
// If you have a custom Button component, import it here:
import Button from "../components/Button"; 

/**
 * Props:
 *  - selectedStyles (string): The music styles or prompt to generate from
 *  - onAudioGenerated (function): Callback to pass the generated audio URL back to the parent
 */
function MusicGenerator({ selectedStyles, onAudioGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Optionally track the audio URL locally if you want to debug or confirm it's generated
  const [audioUrl, setAudioUrl] = useState(null);

  // Whenever selectedStyles changes, update our local prompt
  useEffect(() => {
    setPrompt(selectedStyles);
  }, [selectedStyles]);

  // Trigger the Hugging Face MusicGen API call
  const generateMusic = async () => {
    if (!prompt) {
      alert("Please enter a music description.");
      return;
    }

    setLoading(true);
    setAudioUrl(null); // Clear previous audio URL

    try {
      // 1) Call the Hugging Face MusicGen API
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/musicgen-small",
        {
          method: "POST",
          headers: {
            // Replace with your own token or environment variable
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate music");
      }

      // 2) Convert response to a Blob, then to a local URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // 3) Save the URL locally (optional) AND pass it to the parent
      setAudioUrl(url);
      if (onAudioGenerated) {
        onAudioGenerated(url);
      }
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
      <h3 style={styles.subtitle}>
        No musical experience? No problem! We&apos;ve got everything you need to create amazing tunes!
      </h3>

      {/* Prompt input field */}
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter music description"
        style={styles.input}
      />

      {/* Generate button */}
      <div style={styles.buttonContainer}>
        <Button onClick={generateMusic} style={styles.generateButton}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {/* Loading message */}
      {loading && <div style={styles.loading}>Generating music, please wait...</div>}

      {/* Debug info or confirmation (NO audio player here) */}
      {audioUrl && (
        <p style={{ color: "#FF4D94", marginTop: "10px" }}>
          Audio generated! Your custom player will handle playback.
        </p>
      )}
    </div>
  );
}

export default MusicGenerator;

/** Inline styles (optional). Adjust as you wish or replace with CSS modules. */
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#121212",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(255, 77, 148, 0.6)",
    maxWidth: "600px",
    margin: "auto",
    marginTop: "50px",
  },
  title: {
    fontSize: "2.5em",
    color: "#FF4D94",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1.2em",
    color: "#FF4D94",
    marginBottom: "20px",
  },
  input: {
    padding: "12px",
    width: "90%",
    borderRadius: "8px",
    border: "2px solid #FF4D94",
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
  loading: {
    marginTop: "10px",
    color: "#FF4D94",
    fontWeight: "bold",
  },
};
