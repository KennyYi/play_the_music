import type { BeatMap, BeatNote } from "../beatmap/beatMapSchema";

/**
 * Utility to emit beat-map notes slightly ahead of their scheduled time.
 */
export class NoteSpawner {
  private readonly notes: BeatNote[];
  private index = 0;
  constructor(beatMap: BeatMap, private leadTime = 1.7) {
    this.notes = beatMap.notes;
  }

  /**
   * Update the lead time used to spawn notes.
   * @param leadTime New lead time in seconds
   */
  setLeadTime(leadTime: number) {
    this.leadTime = leadTime;
  }

  /**
   * Advance the spawner and return any notes that should appear.
   * @param currentTime Current playback time in seconds
   */
  update(currentTime: number): BeatNote[] {
    const spawned: BeatNote[] = [];
    while (
      this.index < this.notes.length &&
      this.notes[this.index].time - currentTime <= this.leadTime
    ) {
      spawned.push(this.notes[this.index]);
      this.index++;
    }
    return spawned;
  }

  /**
   * Reset spawner to start over.
   */
  reset() {
    this.index = 0;
  }
}
