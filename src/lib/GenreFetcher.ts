import { getGenreJsPath, detectGenreJsHash } from "./utils";

export interface TrackInfo {
  id: string;
  name: string;
}

export interface GenreEntry {
  genre: string;
  songs: TrackInfo[];
}

export function extractJsonFromScript(js: string): string {
  // Find the SECOND JSON.parse call, which contains the actual track data
  // First JSON.parse contains UI layout data (angle, radius, etc.)
  // Second JSON.parse contains music data (id, title, etc.)
  
  let parseIdx = js.indexOf("JSON.parse");
  if (parseIdx === -1) {
    throw new Error("JSON.parse call not found");
  }
  
  // Find the SECOND occurrence
  parseIdx = js.indexOf("JSON.parse", parseIdx + 1);
  if (parseIdx === -1) {
    throw new Error("Second JSON.parse call not found");
  }

  const parenIdx = js.indexOf("(", parseIdx);
  if (parenIdx === -1) {
    throw new Error("JSON.parse call not found");
  }

  let i = parenIdx + 1;
  // Skip whitespace before the argument
  while (i < js.length && /\s/.test(js[i])) i++;

  const quote = js[i];
  if (quote !== '"' && quote !== "'") {
    throw new Error("JSON.parse argument must be a string literal");
  }
  i++;

  let result = "";
  let escaped = false;
  for (; i < js.length; i++) {
    const ch = js[i];
    if (escaped) {
      switch (ch) {
        case "n":
          result += "\n";
          break;
        case "r":
          result += "\r";
          break;
        case "t":
          result += "\t";
          break;
        case "b":
          result += "\b";
          break;
        case "f":
          result += "\f";
          break;
        case "\\":
        case '"':
        case "'":
          result += ch;
          break;
        case "u": {
          const hex = js.slice(i + 1, i + 5);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            result += String.fromCharCode(parseInt(hex, 16));
            i += 4;
          } else {
            throw new Error("Invalid unicode escape in JSON.parse argument");
          }
          break;
        }
        default:
          result += ch;
      }
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === quote) break;
    result += ch;
  }

  if (i >= js.length) {
    throw new Error("Unterminated string in JSON.parse call");
  }

  return result;
}

export class GenreScriptFetcher {
  constructor() {}

  async fetch(): Promise<GenreEntry[]> {
    // Automatically detect the current JS file hash
    const hash = await detectGenreJsHash();

    
    const res = await fetch(getGenreJsPath(hash));
    if (!res.ok) {
      throw new Error(`Failed to fetch genre JS: ${res.status}`);
    }
    
    const text = await res.text();
    const json = extractJsonFromScript(text);
    
    const raw = JSON.parse(json);
    
    // Check if raw is valid
    if (!raw || typeof raw !== 'object') {
      throw new Error(`Unexpected data structure. Expected object or array, got: ${typeof raw}`);
    }

    // Handle array format (new Suno API structure)
    if (Array.isArray(raw)) {

      
      // Group tracks by genre/metadata field
      const genreMap: Record<string, any[]> = {};
      
      for (const track of raw) {
        // Ensure track is an object
        if (!track || typeof track !== 'object') {
          console.warn("Skipping invalid track:", track);
          continue;
        }
        
        // Try to extract genre from various possible fields
        let genre = "All Tracks"; // Default genre if none found
        
        if (track.genre && typeof track.genre === 'string') {
          genre = track.genre;
        } else if (track.metadata && typeof track.metadata === 'string') {
          genre = track.metadata;
        } else if (track.tags) {
          // Handle tags as array or string
          if (Array.isArray(track.tags) && track.tags.length > 0) {
            genre = track.tags[0];
          } else if (typeof track.tags === 'string') {
            genre = track.tags;
          }
        }
        
        if (!genreMap[genre]) {
          genreMap[genre] = [];
        }
        genreMap[genre].push(track);
      }
      

      
      return Object.entries(genreMap).map(([genre, tracks]) => {
        // Group by title (without optional version suffix like " v1")
        const grouped: Record<
          string,
          { id: string; title?: string; name?: string }[]
        > = {};
        for (const t of tracks) {
          const title = (t.title || t.name || "Untitled").replace(/ v[12]$/i, "");
          if (!grouped[title]) grouped[title] = [];
          grouped[title].push(t);
        }
        // Pick a random variant for each title
        const songs: TrackInfo[] = Object.values(grouped)
          .map((variants) => {
            const choice = variants[Math.floor(Math.random() * variants.length)];
            
            // Try to extract ID from various possible fields
            const trackId = choice.id || 
                           (choice as any).clip_id || 
                           (choice as any).audio_id || 
                           (choice as any).track_id || 
                           (choice as any).song_id ||
                           (choice as any).uid ||
                           "";
            
            const trackName = choice.title || choice.name || "Untitled";
            
            // Skip tracks without a valid ID
            if (!trackId) {
              console.warn(`Skipping track without ID: ${trackName}`);
              return null;
            }
            
            return { id: trackId, name: trackName };
          })
          .filter((song): song is TrackInfo => song !== null); // Remove null entries
        
        return { genre, songs };
      });
    }

    // Handle object format (old Suno API structure)

    return Object.entries(raw as Record<string, { id: string; title?: string; name?: string }[]>).map(([genre, tracks]) => {
      // Group by title (without optional version suffix like " v1")
      const grouped: Record<
        string,
        { id: string; title?: string; name?: string }[]
      > = {};
      for (const t of tracks) {
        const title = (t.title || t.name || "").replace(/ v[12]$/i, "");
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push(t);
      }
      // Pick a random variant for each title
      const songs: TrackInfo[] = Object.values(grouped)
        .map((variants) => {
          const choice = variants[Math.floor(Math.random() * variants.length)];
          
          // Try to extract ID from various possible fields
          const trackId = choice.id || 
                         (choice as any).clip_id || 
                         (choice as any).audio_id || 
                         (choice as any).track_id || 
                         (choice as any).song_id ||
                         (choice as any).uid ||
                         "";
          
          const trackName = choice.title || choice.name || "Untitled";
          
          // Skip tracks without a valid ID
          if (!trackId) {
            console.warn(`Skipping track without ID: ${trackName}`);
            return null;
          }
          
          return { id: trackId, name: trackName };
        })
        .filter((song): song is TrackInfo => song !== null); // Remove null entries
      return { genre, songs };
    });
  }
}
