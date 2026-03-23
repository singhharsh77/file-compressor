const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

// Simple RLE Compression
function compressRLE(data) {
  let result = "";
  let count = 1;

  for (let i = 1; i <= data.length; i++) {
    if (data[i] === data[i - 1]) {
      count++;
    } else {
      result += data[i - 1] + count;
      count = 1;
    }
  }
  return result;
}

app.post("/compress", upload.single("file"), (req, res) => {
  const filePath = req.file.path;

  const data = fs.readFileSync(filePath, "utf-8");
  const compressed = compressRLE(data);

  const outputPath = "compressed.txt";
  fs.writeFileSync(outputPath, compressed);

  res.download(outputPath);
});

app.listen(5000, () => console.log("Server running on port 5000"));