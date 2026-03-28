import java.io.*;
import java.util.PriorityQueue;
import java.util.HashMap;
import java.util.Map;

class HuffmanNode implements Comparable<HuffmanNode> {
    int freq;
    int c; // Use int to handle 0-255 byte values, -1 for internal node
    HuffmanNode left;
    HuffmanNode right;

    public HuffmanNode(int c, int freq) {
        this.c = c;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }

    @Override
    public int compareTo(HuffmanNode node) {
        return this.freq - node.freq;
    }
}

public class Huffman {

    public static void main(String[] args) {
        if (args.length < 3) {
            System.err.println("Usage: java Huffman <compress|decompress> <inputFile> <outputFile>");
            System.exit(1);
        }

        String action = args[0];
        String inputFile = args[1];
        String outputFile = args[2];

        try {
            if ("compress".equals(action)) {
                compress(inputFile, outputFile);
            } else if ("decompress".equals(action)) {
                decompress(inputFile, outputFile);
            } else {
                System.err.println("Invalid action. Use 'compress' or 'decompress'.");
                System.exit(1);
            }
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void compress(String inputFile, String outputFile) throws IOException {
        File file = new File(inputFile);
        byte[] data = new byte[(int) file.length()];
        try (FileInputStream fis = new FileInputStream(file)) {
            fis.read(data);
        }
        
        if (data.length == 0) {
            new FileOutputStream(outputFile).close();
            return;
        }

        int[] freqs = new int[256];
        for (byte b : data) {
            freqs[b & 0xFF]++;
        }

        HuffmanNode root = buildTree(freqs);
        String[] codes = new String[256];
        buildCodes(root, "", codes);

        int totalBits = 0;
        for (int i = 0; i < 256; i++) {
            if (codes[i] != null) {
                totalBits += freqs[i] * codes[i].length();
            }
        }

        int padding = (8 - (totalBits % 8)) % 8;

        try (DataOutputStream dos = new DataOutputStream(new FileOutputStream(outputFile))) {
            // Write header
            for (int i = 0; i < 256; i++) {
                dos.writeInt(freqs[i]);
            }
            dos.writeByte(padding);

            // Write packed bits
            int currentByte = 0;
            int numBits = 0;
            for (byte b : data) {
                String code = codes[b & 0xFF];
                for (int i = 0; i < code.length(); i++) {
                    currentByte = (currentByte << 1) | (code.charAt(i) - '0');
                    numBits++;
                    if (numBits == 8) {
                        dos.write(currentByte);
                        currentByte = 0;
                        numBits = 0;
                    }
                }
            }
            
            // Write remaining bits with padding
            if (numBits > 0) {
                currentByte = currentByte << (8 - numBits);
                dos.write(currentByte);
            }
        }
    }

    private static void decompress(String inputFile, String outputFile) throws IOException {
        File file = new File(inputFile);
        if (file.length() == 0) {
            new FileOutputStream(outputFile).close();
            return;
        }

        try (DataInputStream dis = new DataInputStream(new FileInputStream(file));
             FileOutputStream fos = new FileOutputStream(outputFile)) {

            int[] freqs = new int[256];
            long totalOriginalBytes = 0;
            for (int i = 0; i < 256; i++) {
                freqs[i] = dis.readInt();
                totalOriginalBytes += freqs[i];
            }
            int padding = dis.readByte();

            HuffmanNode root = buildTree(freqs);
            if (root == null) return;

            // Handle edge case of single repeating character
            if (root.left == null && root.right == null) {
                for (long i = 0; i < totalOriginalBytes; i++) {
                    fos.write(root.c);
                }
                return;
            }

            long outPos = 0;
            HuffmanNode curr = root;

            byte[] buffer = new byte[8192];
            int read;
            while ((read = dis.read(buffer)) != -1) {
                for (int b = 0; b < read; b++) {
                    int currentByte = buffer[b] & 0xFF;
                    int bitsToProcess = 8;
                    
                    // On the very last byte, account for padding
                    if (dis.available() == 0 && b == read - 1) {
                        bitsToProcess = 8 - padding;
                    }

                    for (int i = 0; i < bitsToProcess && outPos < totalOriginalBytes; i++) {
                        int bit = (currentByte >> (7 - i)) & 1;
                        curr = (bit == 0) ? curr.left : curr.right;

                        if (curr.left == null && curr.right == null) {
                            fos.write(curr.c);
                            outPos++;
                            curr = root;
                        }
                    }
                }
            }
        }
    }

    private static HuffmanNode buildTree(int[] charFreq) {
        PriorityQueue<HuffmanNode> pq = new PriorityQueue<>();
        for (int i = 0; i < 256; i++) {
            if (charFreq[i] > 0) {
                pq.add(new HuffmanNode(i, charFreq[i]));
            }
        }

        if (pq.isEmpty()) return null;
        if (pq.size() == 1) {
            HuffmanNode leaf = pq.poll();
            HuffmanNode root = new HuffmanNode(-1, leaf.freq);
            root.left = leaf; // Forces at least one bit per character
            return root;
        }

        while (pq.size() > 1) {
            HuffmanNode left = pq.poll();
            HuffmanNode right = pq.poll();
            HuffmanNode parent = new HuffmanNode(-1, left.freq + right.freq);
            parent.left = left;
            parent.right = right;
            pq.add(parent);
        }

        return pq.poll();
    }

    private static void buildCodes(HuffmanNode root, String prefix, String[] codes) {
        if (root == null) return;
        if (root.left == null && root.right == null && root.c != -1) {
            codes[root.c] = prefix.isEmpty() ? "0" : prefix;
            return;
        }
        buildCodes(root.left, prefix + "0", codes);
        buildCodes(root.right, prefix + "1", codes);
    }
}
