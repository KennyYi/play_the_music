import type { BeatMap } from "./beatMapSchema";
import type { AnalysisResult } from "../analysis/analysisMessage.js";
import type { BeatMapVariations } from "./beatMapGenerator";
// @ts-ignore - TypeScript resolves this import during build
import { validateBeatMap } from "./beatMapSchema.js";

const DB_NAME = "play_the_music";
const BEAT_STORE = "beatMaps";
const ANALYSIS_STORE = "analysisResults";
const DB_VERSION = 2;

// In-memory cache to allow preloading beat maps ahead of time.
const beatMapCache = new Map<string, BeatMap>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BEAT_STORE)) {
        db.createObjectStore(BEAT_STORE);
      }
      if (!db.objectStoreNames.contains(ANALYSIS_STORE)) {
        db.createObjectStore(ANALYSIS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBeatMap(id: string, map: BeatMap): Promise<void> {
  if (!validateBeatMap(map)) {
    const message = validateBeatMap.errors?.[0]?.message ?? "invalid beat map";
    throw new Error(`Invalid beat map: ${message}`);
  }
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(BEAT_STORE, "readwrite");
    const req = tx.objectStore(BEAT_STORE).put(map, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  beatMapCache.set(id, map);
}

export async function loadBeatMap(id: string): Promise<BeatMap | undefined> {
  if (beatMapCache.has(id)) {
    return beatMapCache.get(id);
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BEAT_STORE, "readonly");
    const req = tx.objectStore(BEAT_STORE).get(id);
    req.onsuccess = () => {
      const result = req.result as BeatMap | undefined;
      if (result) beatMapCache.set(id, result);
      resolve(result);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Preload a beat map into the in-memory cache.
 */
export async function preloadBeatMap(id: string): Promise<BeatMap | undefined> {
  return loadBeatMap(id);
}

/**
 * Retrieve a preloaded beat map without hitting IndexedDB.
 */
export function getPreloadedBeatMap(id: string): BeatMap | undefined {
  return beatMapCache.get(id);
}

/**
 * Clear the in-memory beat map cache.
 * Primarily useful for tests.
 */
export function clearBeatMapCache(): void {
  beatMapCache.clear();
}

export async function saveAnalysisResult(
  id: string,
  result: AnalysisResult & { beatMaps: BeatMapVariations }
): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ANALYSIS_STORE, "readwrite");
    const req = tx.objectStore(ANALYSIS_STORE).put(result, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadAnalysisResult(
  id: string
): Promise<(AnalysisResult & { beatMaps: BeatMapVariations }) | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ANALYSIS_STORE, "readonly");
    const req = tx.objectStore(ANALYSIS_STORE).get(id);
    req.onsuccess = () => {
      let result = req.result as
        | (AnalysisResult & { beatMaps: BeatMapVariations })
        | undefined
        | { beatMap: BeatMap };
      if (result && !("beatMaps" in result) && "beatMap" in result) {
        const map = (result as any).beatMap as BeatMap;
        result = {
          ...(result as any),
          beatMaps: { easy: map, normal: map, hard: map },
        };
        void saveAnalysisResult(id, result as any);
      }
      resolve(result as any);
    };
    req.onerror = () => reject(req.error);
  });
}
