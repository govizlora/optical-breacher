import { useEffect, useState } from 'react'

const byteMap: Record<string, string> = {
  1: '1C',
  7: '7A',
  5: '55',
  B: 'BD',
  E: 'E9',
  F: 'FF',
}

function parseLine(line: string) {
  const bytes = line.split(' ').map(b => byteMap[b])

  // Remove lines such as `EE 1 5` which is usually not a valid line
  if (bytes.some(byte => !byte)) {
    return []
  }

  return bytes
}

export function getMostCommonLength<T>(lines: T[][]) {
  const lengths: Record<number, number> = {}
  lines.forEach(line => {
    lengths[line.length] = lengths[line.length] || 0
    lengths[line.length]++
  })
  return parseInt(
    Object.entries(lengths).sort((a, b) => b[1] - a[1])[0]?.[0] || '0',
    10
  )
}

export function processMatrix(res: string) {
  const lines = res
    .split('\n')
    .map(parseLine)
    .filter(bytes => bytes.length)
  const mostCommonLength = getMostCommonLength(lines)
  const validLines = lines.filter(line => line.length === mostCommonLength)
  const chars = new Set<string>()
  validLines.forEach(bytes => {
    bytes.forEach(byte => {
      chars.add(byte)
    })
  })

  return { lines: validLines, chars }
}

/**
 * TODO: Add more filter methods
 * @param matrixBytes The bytes appeared in the matrix
 */
export const processTargets = (res: string, matrixBytes: Set<string>) =>
  res
    .split('\n')
    .map(parseLine)
    .filter(
      bytes =>
        bytes.length >= 2 &&
        bytes.length <= 4 &&
        bytes.every(byte => matrixBytes.has(byte))
    )

export function useStorage(storageKey: string, initialState?: string) {
  const storedValue = window.localStorage.getItem(storageKey) || initialState
  const [state, setState] = useState(storedValue)
  useEffect(() => {
    typeof state === 'string' && window.localStorage.setItem(storageKey, state)
  }, [state])

  return [state, setState] as const
}

/**
 * Turn the photo into a "black text on white background" image.
 * Not very smart, but at least it is adaptive.
 */
export function threshold(
  context: CanvasRenderingContext2D,
  screenshot: boolean = false
) {
  const { width, height } = context.canvas
  const resolution = width * height
  const imageData = context.getImageData(0, 0, width, height)
  const { data } = imageData
  let cutAt = 128

  if (!screenshot) {
    // 1. Compute the histogram
    const histo = Array(256).fill(0)
    for (let i = 0; i < data.length; i += 4) {
      // Store the sampled color to the R channel
      // The RGB to grayscale threshold conversion doesn't need to be very accurate.
      data[i] = Math.round(
        data[i] * 0.7 + data[i + 1] * 0.2 + data[i + 2] * 0.1
      )
      histo[data[i]]++
    }

    // 2. Cut off the top 1% bright and top 1% dark region
    const capThreshold = 0.01
    let minCap = 0
    let minAccu = 0
    for (let i = 0; i < 256; i++) {
      minAccu += histo[i] || 0
      if (minAccu > resolution * capThreshold) {
        minCap = i
        break
      }
    }

    let maxCap = 0
    let maxAccu = 0
    for (let i = 255; i >= 0; i--) {
      maxAccu += histo[i] || 0
      if (maxAccu > resolution * capThreshold) {
        maxCap = i
        break
      }
    }

    // 3. Among [minCap, maxCap], search between intensity (brightness) 65% to 90%
    // and find the place that has the lowest intensity.
    // This might not work well if the histogram is not "U" shaped,
    // and can be optimized by maybe applying Otsu's method specifically at this area.
    let minHistValue = Infinity
    const range = maxCap - minCap
    const start = minCap + Math.floor(range * 0.65)
    const end = minCap + range * 0.9
    for (let i = start; i <= end; i++) {
      if (histo[i] < minHistValue) {
        minHistValue = histo[i]
        cutAt = i
      }
    }
  }

  // 4. Threshold the image.
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] > cutAt ? 0 : 255
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
  }

  context.putImageData(imageData, 0, 0)
}
