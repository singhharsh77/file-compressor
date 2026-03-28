import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("compress");
  const [stats, setStats] = useState(null);

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStats(null); // Reset stats on new file
    }
  };

  const handleAction = async () => {
    if (!file) return;

    setLoading(true);
    setStats(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const endpoint = action === "compress" 
        ? "http://localhost:5001/compress" 
        : "http://localhost:5001/decompress";
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} file`);
      }

      const blob = await response.blob();
      
      // Calculate stats for compression
      if (action === "compress") {
        const originalSize = file.size;
        const compressedSize = blob.size;
        const savings = ((originalSize - compressedSize) / originalSize) * 100;
        setStats({
          originalSize,
          compressedSize,
          savings: savings.toFixed(2)
        });
      }

      // Handle download
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = action === "compress" ? `${file.name}.huff` : "decompressed_file";
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
            filename = filenameMatch[1];
        }
      } else if (action === "decompress" && file.name.endsWith('.huff')) {
        filename = file.name.slice(0, -5);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-panel">
        <h1 className="title">Huffman Compressor</h1>
        <p className="subtitle">High-performance lossless binary compression</p>

        <div className="toggle-container">
          <button 
            className={`toggle-btn ${action === "compress" ? "active" : ""}`}
            onClick={() => setAction("compress")}
          >
            Compress
          </button>
          <button 
            className={`toggle-btn ${action === "decompress" ? "active" : ""}`}
            onClick={() => setAction("decompress")}
          >
            Decompress
          </button>
        </div>

        <div className="upload-box">
          <input 
            type="file" 
            id="fileInput" 
            className="file-input" 
            onChange={handleFileChange} 
          />
          <label htmlFor="fileInput" className="file-label">
            {file ? (
              <div className="file-info">
                <span className="file-name">📄 {file.name}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {formatSize(file.size)}
                </p>
              </div>
            ) : (
              <span>Drag & drop or <span className="highlight">click to browse</span></span>
            )}
          </label>
        </div>

        <button 
          className="action-btn" 
          onClick={handleAction} 
          disabled={!file || loading}
        >
          {loading ? <div className="loader"></div> : (action === "compress" ? "Compress Now" : "Decompress Now")}
        </button>

        {stats && action === "compress" && (
          <div className="stats-container">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Original Size</span>
                <span className="stat-value">{formatSize(stats.originalSize)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Compressed Size</span>
                <span className="stat-value">{formatSize(stats.compressedSize)}</span>
              </div>
            </div>
            <div className="stat-item" style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.1)' }}>
              <span className="stat-label">Space Saved</span>
              <span className="stat-value savings-badge">{stats.savings}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;