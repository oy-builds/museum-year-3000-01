// Museum of the Year 3000 — entry writer.
// Reads the museum label from entry.txt beside this script, validates it
// against the kit's gate (UTF-8 text of 1 to 200 characters, not only
// white space, a single line), and writes it to the competition output
// location: $MAKEFUN_OUTPUT_DIR/entry.txt, defaulting to /output/entry.txt.
// The write is verified byte-exactly so a silent short or altered write
// can never reach the judge.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 200;

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.txt");
const rawBytes = readFileSync(sourcePath);
const raw = rawBytes.toString("utf8");
// entry.txt holds the one line plus a single trailing newline; the judged
// text is the line itself.
const line = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

const charCount = [...line].length;
if (charCount < 1 || line.trim().length === 0) {
  throw new Error("entry.txt is empty or only white space");
}
if (charCount > MAX_CHARS) {
  throw new Error(`entry is ${charCount} characters, over the ${MAX_CHARS}-character limit`);
}
if (line.includes("\n") || line.includes("\r")) {
  throw new Error("entry must be a single line with no line breaks");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
const expected = Buffer.from(line, "utf8");
writeFileSync(outPath, expected);

// Byte-exact round-trip: re-read the output and compare bytes, not just
// decoded text, so encoding drift or truncation fails loudly here.
const written = readFileSync(outPath);
if (!written.equals(expected)) {
  throw new Error(`verification failed: ${outPath} differs byte-for-byte from the entry`);
}
console.log(`wrote ${charCount} characters (${expected.length} bytes) to ${outPath}`);
