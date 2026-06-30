import fs from "fs";
import path from "path";

interface MemoryEntry {
  key: string;
  content: string;
  timestamp: string;
  type: "fact" | "preference" | "context";
}

const MEMORY_FILE = path.join(process.cwd(), "server/data/memories.json");

function ensureDir() {
  const dir = path.dirname(MEMORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readMemories(): MemoryEntry[] {
  ensureDir();
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
    }
  } catch {
    console.warn("Memories file corrupted, resetting.");
  }
  return [];
}

function writeMemories(memories: MemoryEntry[]) {
  ensureDir();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2), "utf-8");
}

export const aiMemoryService = {
  async remember(key: string, content: string, type: MemoryEntry["type"]): Promise<void> {
    const memories = readMemories();
    const existingIndex = memories.findIndex(m => m.key === key);
    const entry: MemoryEntry = { key, content, timestamp: new Date().toISOString(), type };
    if (existingIndex >= 0) {
      memories[existingIndex] = entry;
    } else {
      memories.push(entry);
    }
    writeMemories(memories);
  },

  async recall(key: string): Promise<MemoryEntry | null> {
    const memories = readMemories();
    return memories.find(m => m.key === key) || null;
  },

  async getRecentMemories(limit: number = 10): Promise<MemoryEntry[]> {
    const memories = readMemories();
    return memories.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  },

  async getContextString(): Promise<string> {
    const memories = await this.getRecentMemories(20);
    if (memories.length === 0) return "";
    return memories.map(m => `[${m.type.toUpperCase()}] ${m.key}: ${m.content}`).join("\n");
  },
};
