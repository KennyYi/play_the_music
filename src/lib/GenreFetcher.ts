export interface TrackInfo {
  id: string;
  name: string;
}

export interface GenreEntry {
  genre: string;
  songs: TrackInfo[];
}

export function extractJsonFromScript(js: string): string {
  const parseIdx = js.indexOf("JSON.parse");
  if (parseIdx === -1) {
    throw new Error("JSON.parse call not found");
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
    const res = await fetch(
      "https://groove.suno.com/_next/static/chunks/app/page-5343a953b3364d6e.js"
    );
    const text = await res.text();
    const json = extractJsonFromScript(text);
    const raw = JSON.parse(json) as Record<
      string,
      { id: string; title?: string; name?: string }[]
    >;

    return Object.entries(raw).map(([genre, tracks]) => {
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
      const songs: TrackInfo[] = Object.values(grouped).map((variants) => {
        const choice = variants[Math.floor(Math.random() * variants.length)];
        return { id: choice.id, name: choice.title || choice.name || "" };
      });
      return { genre, songs };
    });
  }
}
