const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");
const { compress: jsCompress, decompress: jsDecompress } = require("./huffman");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));

const upload = multer({ dest: "uploads/" });

// Check if Java is available and Huffman.class is compiled
let useJava = false;
exec("java -version", (err) => {
  if (!err) {
    exec("javac Huffman.java", { cwd: __dirname }, (compileErr) => {
      if (!compileErr) {
        useJava = true;
        console.log("Java Huffman compiled successfully — using Java backend.");
      } else {
        console.log("Java compile failed — falling back to JS Huffman.");
      }
    });
  } else {
    console.log("Java not found — using JS Huffman fallback.");
  }
});

// --- Helper: compress/decompress via Java child process
function javaAction(action, inputPath, outputPath, callback) {
  exec(
    `java Huffman ${action} "${inputPath}" "${outputPath}"`,
    { cwd: __dirname },
    callback
  );
}

// --- Helper: compress/decompress via JS (synchronous)
function jsAction(action, inputPath, outputPath) {
  const data = fs.readFileSync(inputPath);
  const result = action === "compress" ? jsCompress(data) : jsDecompress(data);
  fs.writeFileSync(outputPath, result);
}

// --- Generic handler used by both /compress and /decompress
function handleAction(action, req, res) {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const inputPath = req.file.path;
  let outputName = req.file.originalname;

  if (action === "compress") {
    outputName = `${outputName}.huff`;
  } else if (outputName.endsWith(".huff")) {
    outputName = outputName.slice(0, -5);
  }

  const outputPath = path.join(__dirname, outputName);

  function sendResult(err) {
    if (err) {
      console.error(err);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(500).send(`Error during ${action}.`);
    }
    res.download(outputPath, outputName, () => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  }

  if (useJava) {
    javaAction(action, inputPath, outputPath, sendResult);
  } else {
    try {
      jsAction(action, inputPath, outputPath);
      sendResult(null);
    } catch (e) {
      sendResult(e);
    }
  }
}

app.post("/compress", upload.single("file"), (req, res) => handleAction("compress", req, res));
app.post("/decompress", upload.single("file"), (req, res) => handleAction("decompress", req, res));

app.listen(5001, () => console.log("Server running on port 5001"));