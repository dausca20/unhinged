/**
 * Small deterministic helpers. Used anywhere we need a stable pseudo-value from
 * mock data WITHOUT Math.random (scoring/matching must be reproducible —
 * DoR §5.2, §10.8).
 */

/** Stable 32-bit string hash (FNV-1a). Same input → same output, every run. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Deterministic float in [0, 1) from a seed string. */
export function seededUnit(seed: string): number {
  return hashString(seed) / 0xffffffff;
}

/** Deterministic integer in [min, max] from a seed string. */
export function seededInt(seed: string, min: number, max: number): number {
  const span = max - min + 1;
  return min + (hashString(seed) % span);
}

/** Deterministic value in [min, max] (inclusive-ish) from a seed string. */
export function seededRange(seed: string, min: number, max: number): number {
  return min + seededUnit(seed) * (max - min);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
