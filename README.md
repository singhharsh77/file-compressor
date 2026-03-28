# 📦 File Compressor — Huffman Coding

A lossless file compressor & decompressor built as a **DSA project** using the **Huffman Coding** algorithm. Supports any file type — images, PDFs, videos, zip files, and more.

---

## 🧠 How It Works (DSA)

Huffman Coding is a **greedy algorithm** that compresses data losslessly using a frequency-based binary tree.

1. **Count frequencies** of every byte in the file
2. **Build a Min-Heap Priority Queue** of all bytes sorted by frequency
3. **Construct the Huffman Tree** by repeatedly merging the two lowest-frequency nodes
4. **Assign binary codes** to each byte (frequent bytes get shorter codes)
5. Re-encode the file using these compressed codes

On decompression, the tree is reconstructed from a stored frequency table in the file header, and the original bytes are decoded bit-by-bit.

---
# Huffman File Compressor (DSA Project)

A high-performance, lossless binary file compressor using Huffman Coding. Features a premium React frontend and a robust Java/Node.js backend.

## ✨ Features
- **Lossless Compression**: Perfect for text and binary data.
- **Dual Backend**: High-speed Java implementation with an automatic JavaScript fallback.
- **Premium UI**: Modern dark-mode interface with glassmorphism and smooth animations.
- **Real-time Stats**: Displays original size, compressed size, and space saved percentage.
- **Edge Case Robustness**: Correctly handles single-character, empty, and large files.

## 🚀 Getting Started

### Backend Setup
1. `cd backend`
2. `npm install`
3. `node server.js`
   - The server will run on `http://localhost:5001`.
   - It will automatically compile `Huffman.java` on startup.

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm start`
   - The React app will run on `http://localhost:3000`.

## 🛠️ Tech Stack
- **Frontend**: React.js, Vanilla CSS (Premium Glassmorphism).
- **Backend**: Node.js, Express.
- **Core Logic**: Java (Huffman Coding), JavaScript (Fallback Support).

## 📄 License
ISC
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/compress` | Upload any file → returns `.huff` compressed file |
| `POST` | `/decompress` | Upload a `.huff` file → returns the original file |

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Compression Algorithm | **Java** (Huffman Coding, Priority Queue, Binary Tree) |
| Backend | **Node.js + Express** |
| Frontend | **React** |
| File Handling | **Multer** |