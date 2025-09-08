import Ajv from "ajv";

export type Lane = 0 | 1 | 2 | 3 | 4 | 5;

export interface BeatNote {
  /**
   * Time in seconds from the start of the track.
   */
  time: number;
  /**
   * Which lane the note should appear in (0 = leftmost).
   */
  lane: Lane;
}

export interface BeatMap {
  /**
   * Schema version of the beat map. Allows future upgrades.
   */
  version: number;
  /**
   * Optional calibration offset in seconds to align notes with the audio.
   */
  offset?: number;
  /**
   * All notes in the map sorted by time.
   */
  notes: BeatNote[];
}

export const beatMapSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "BeatMap",
  type: "object",
  required: ["version", "notes"],
  properties: {
    version: { type: "number", minimum: 1 },
    offset: { type: "number" },
    notes: {
      type: "array",
      items: {
        type: "object",
        required: ["time", "lane"],
        properties: {
          time: { type: "number", minimum: 0 },
          lane: { type: "integer", minimum: 0, maximum: 5 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;

const ajv = new Ajv({ allErrors: true });

export const validateBeatMap = ajv.compile(beatMapSchema);
