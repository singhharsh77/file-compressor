import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "https://special-goldfish-q7vx6qpw596cx45x-5000.app.github.dev/",
      formData,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed.txt";
    a.click();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Smart File Compressor</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={uploadFile}>Compress File</button>
    </div>
  );
}

export default App;