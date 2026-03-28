class Node {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

function buildFreqs(buffer) {
  const freqs = new Array(256).fill(0);
  for (let i = 0; i < buffer.length; i++) freqs[buffer[i]]++;
  return freqs;
}

function buildTree(freqs) {
  const pq = [];
  for (let i = 0; i < 256; i++) {
    if (freqs[i] > 0) pq.push(new Node(i, freqs[i]));
  }
  if (pq.length === 0) return null;
  pq.sort((a, b) => a.freq - b.freq);

  while (pq.length > 1) {
    const left = pq.shift();
    const right = pq.shift();
    const parent = new Node(null, left.freq + right.freq, left, right);
    let inserted = false;
    for (let i = 0; i < pq.length; i++) {
      if (pq[i].freq > parent.freq) { pq.splice(i, 0, parent); inserted = true; break; }
    }
    if (!inserted) pq.push(parent);
  }
  return pq[0];
}

function buildCodes(node, prefix = "", codes = {}) {
  if (!node) return codes;
  if (node.char !== null) { codes[node.char] = prefix || "0"; return codes; }
  buildCodes(node.left, prefix + "0", codes);
  buildCodes(node.right, prefix + "1", codes);
  return codes;
}

function compress(buffer) {
  if (buffer.length === 0) return Buffer.alloc(0);
  const freqs = buildFreqs(buffer);
  const tree = buildTree(freqs);
  const codes = buildCodes(tree);

  let totalBits = 0;
  for (let i = 0; i < 256; i++) totalBits += freqs[i] * (codes[i] ? codes[i].length : 0);
  const padding = (8 - (totalBits % 8)) % 8;
  const numBytes = Math.ceil(totalBits / 8);
  const dataBuffer = Buffer.alloc(numBytes);

  let bitPos = 0;
  for (let i = 0; i < buffer.length; i++) {
    const code = codes[buffer[i]];
    for (let j = 0; j < code.length; j++) {
      if (code[j] === "1") dataBuffer[Math.floor(bitPos / 8)] |= (1 << (7 - (bitPos % 8)));
      bitPos++;
    }
  }

  const header = Buffer.alloc(256 * 4 + 1);
  for (let i = 0; i < 256; i++) header.writeUInt32LE(freqs[i], i * 4);
  header.writeUInt8(padding, 256 * 4);
  return Buffer.concat([header, dataBuffer]);
}

function decompress(buffer) {
  if (buffer.length === 0) return Buffer.alloc(0);
  const headerSize = 256 * 4 + 1;
  const freqs = new Array(256).fill(0);
  let totalOriginalBytes = 0;
  for (let i = 0; i < 256; i++) { freqs[i] = buffer.readUInt32LE(i * 4); totalOriginalBytes += freqs[i]; }
  const padding = buffer.readUInt8(256 * 4);
  const data = buffer.subarray(headerSize);
  const tree = buildTree(freqs);
  if (!tree) return Buffer.alloc(0);

  const outBuffer = Buffer.allocUnsafe(totalOriginalBytes);
  let outPos = 0;
  let curr = tree;

  if (curr.char !== null) {
    for (let i = 0; i < totalOriginalBytes; i++) outBuffer[i] = curr.char;
    return outBuffer;
  }

  const totalBits = data.length * 8 - padding;
  let bitPos = 0;
  while (bitPos < totalBits && outPos < totalOriginalBytes) {
    const bit = (data[Math.floor(bitPos / 8)] >> (7 - (bitPos % 8))) & 1;
    curr = bit === 0 ? curr.left : curr.right;
    if (curr.char !== null) { outBuffer[outPos++] = curr.char; curr = tree; }
    bitPos++;
  }
  return outBuffer;
}

module.exports = { compress, decompress };
