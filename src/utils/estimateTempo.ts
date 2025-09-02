export function estimateTempo(
  samples: Float32Array,
  sampleRate: number
): number {
  // very naive peak-detection tempo estimation
  const threshold = 0.3;
  const peaks: number[] = [];
  let prevAbove = false;
  for (let i = 0; i < samples.length; i++) {
    const val = Math.abs(samples[i]);
    const above = val > threshold;
    if (above && !prevAbove) peaks.push(i);
    prevAbove = above;
  }
  if (peaks.length < 2) return 0;
  let intervalSum = 0;
  for (let i = 1; i < peaks.length; i++) {
    intervalSum += peaks[i] - peaks[i - 1];
  }
  const avgInterval = intervalSum / (peaks.length - 1);
  const tempo = (sampleRate * 60) / avgInterval;
  // Discard tempos outside a musically plausible range
  const MIN_BPM = 40;
  const MAX_BPM = 400;
  return tempo < MIN_BPM || tempo > MAX_BPM ? 0 : tempo;
}
