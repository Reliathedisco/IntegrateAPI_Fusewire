/** L2-normalize a vector in place and return it (for cosine similarity via dot product). */
export function normalizeVector(v: number[]): number[] {
  let sum = 0;
  for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
  const mag = Math.sqrt(sum) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= mag;
  return v;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
