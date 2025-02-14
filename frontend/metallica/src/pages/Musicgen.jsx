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
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>METALLICA AI MUSIC GENERATOR</h1>
      <h3>No musical experience? No problem! We've got everything you need to create amazing tunes!</h3>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter music description"
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={generateMusic} style={{ padding: "10px 20px" }}>
        {loading ? "Generating..." : "Generate Music"}
      </button>

      {loading && <div style={{ marginTop: "10px", color: "red" }}>Generating music, please wait...</div>}

      {audioUrl && (
        <div style={{ marginTop: "20px" }}>
          <audio controls autoPlay>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default MusicGenerator;
