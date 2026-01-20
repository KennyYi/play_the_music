import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getGenreJsPath(hash: string): string {
  return `https://suno.com/_next/static/chunks/app/(root)/genre-wheel/page-${hash}.js`;
}

/**
 * Fetches the HTML of the genre-wheel page and extracts the current JS filename hash.
 * The hash changes periodically, so we need to detect it dynamically.
 * @returns The hash portion of the filename (e.g., "b721d3b8177ba9d6")
 */
export async function detectGenreJsHash(): Promise<string> {
  // List of CORS proxies to try (in order of preference)
  const CORS_PROXIES = [
    "https://corsproxy.io/?",
    "https://api.allorigins.win/raw?url=",
  ];
  const TARGET_URL = "https://suno.com/genre-wheel";
  
  // Try each CORS proxy until one works
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(TARGET_URL));
      if (!response.ok) {
        console.warn(`CORS proxy ${proxy} returned status ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      
      // Match the script tag pattern: /_next/static/chunks/app/(root)/genre-wheel/page-[hash].js
      const regex = /_next\/static\/chunks\/app\/\(root\)\/genre-wheel\/page-([0-9a-z]+)\.js/;
      const match = html.match(regex);
      
      if (match && match[1]) {
        console.log(`Successfully detected genre JS hash: ${match[1]}`);
        return match[1];
      }
    } catch (error) {
      console.warn(`Error with CORS proxy ${proxy}:`, error);
      continue;
    }
  }
  
  // If all proxies fail, use the fallback hash
  console.error("All CORS proxies failed. Using fallback hash.");
  const fallbackHash = "b721d3b8177ba9d6";
  return fallbackHash;
}
