export function reservoirSample(stream, k) {
  if (k <= 0) return [];
  if (stream.length <= k) return [...stream];
  const reservoir = stream.slice(0, k);
  for (let i = k; i < stream.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < k) {
      reservoir[j] = stream[i];
    }
  }
  return reservoir;
}
