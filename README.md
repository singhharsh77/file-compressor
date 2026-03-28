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

## 🗂 Project Structure

```
file-compressor/
├── backend/
│   ├── Huffman.java     ← Core DSA logic (compress & decompress)
│   ├── server.js        ← Express API server (calls the Java binary)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js       ← React UI (upload, compress/decompress, download)
    │   └── App.css      ← Glassmorphism / animated design
    └── package.json
```

---

## 🚀 Running Locally

### Prerequisites
- **Node.js** (v16+)
- **Java** (JDK 11+)

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
```
The server runs at `http://localhost:5000` and auto-compiles `Huffman.java` on startup.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm start
```
Visit `http://localhost:3000` in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/compress` | Upload any file → returns `.huff` compressed file |
| `POST` | `/decompress` | Upload a `.huff` file → returns the original file |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Compression Algorithm | **Java** (Huffman Coding, Priority Queue, Binary Tree) |
| Backend | **Node.js + Express** |
| Frontend | **React** |
| File Handling | **Multer** |