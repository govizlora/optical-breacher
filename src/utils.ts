const byteMap: Record<string, string> = {
  1: '1C',
  7: '7A',
  5: '55',
  B: 'BD',
  E: 'E9',
  F: 'FF'
}

function parseLine(line: string) {
  const bytes = line.split(' ').map(b => byteMap[b]);

  // Remove lines such as `EE 1 5` which is usually not a valid line
  if (bytes.some(byte => !byte)) {
    return []
  }

  return bytes
}

export function getMostCommonLength<T>(lines: T[][]) {
  const lengths: Record<number, number> = {}
  lines.forEach(line => {
    lengths[line.length] = lengths[line.length] || 0;
    lengths[line.length]++;
  })
  return parseInt(Object.entries(lengths).sort((a, b) => b[1] - a[1])[0]?.[0] || '0', 10);
}

export function processMatrix(res: string) {
  const lines = res.split('\n').map(parseLine).filter(bytes => bytes.length);
  const mostCommonLength = getMostCommonLength(lines);
  const validLines = lines.filter(line => line.length === mostCommonLength);
  const chars = new Set<string>();
  validLines.forEach(bytes => { bytes.forEach(byte => { chars.add(byte) }) })

  return { lines: validLines, chars }
}

/**
 * TODO: Add more filter methods
 * @param matrixBytes The bytes appeared in the matrix
 */
export const processTargets = (res: string, matrixBytes: Set<string>) => res
  .split('\n')
  .map(parseLine)
  .filter(
    bytes => bytes.length >= 2
      && bytes.length <= 4
      && bytes.every(byte => matrixBytes.has(byte))
  );