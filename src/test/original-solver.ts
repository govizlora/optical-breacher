/**
 * This is the old solver, which doesn't have any optimization.
 * It is only used by tests.
 */

import { uniqBy, range } from 'lodash'

const getSequences = ({
  bufferSize,
  orientation,
  index,
  used,
  matrixSize,
}: {
  bufferSize: number
  matrixSize: number
  orientation: 'col' | 'row'
  index: number
  used: Set<string>
}): number[][][] => {
  const nexts = range(matrixSize)
    // [row, col]
    .map((_v, i) => (orientation === 'row' ? [index, i] : [i, index]))
    .filter(pos => !used.has(pos.join(',')))

  return bufferSize === 1
    ? nexts.map(n => [n])
    : nexts
        .map(([nr, nc]) =>
          getSequences({
            bufferSize: bufferSize - 1,
            orientation: orientation === 'row' ? 'col' : 'row',
            index: orientation === 'row' ? nc : nr,
            used: new Set(used).add(`${nr},${nc}`),
            matrixSize,
          }).map(seq => [[nr, nc], ...seq])
        )
        // Not using flat to support older browsers
        // since I don't want to add polyfills
        .reduce((acc, val) => acc.concat(val), [])
}

const evaluate = (
  seqs: number[][][],
  matrix: string[][],
  targets: string[][]
) => {
  const strings = seqs.map(seq =>
    seq.map(([row, col]) => matrix[row][col]).join('')
  )
  const targetStrings = targets.map(target => target.join(''))
  let maxScore = 0
  const evaluated = strings.map((s, stringIndex) => {
    let score = 0
    let seqLength = 0
    const matchedIndices: number[] = []
    targetStrings.forEach((ts, i) => {
      const startLocation = s.indexOf(ts)
      if (startLocation > -1) {
        score += 1 + 0.1 * i
        const endLocation = startLocation + ts.length
        seqLength = Math.max(seqLength, endLocation)
        matchedIndices.push(i)
      }
    })
    maxScore = Math.max(score, maxScore)
    return { score, stringIndex, seqLength, matchedIndices }
  })
  const withMaxScores = evaluated.filter(({ score }) => score === maxScore)
  const minSeqLength = Math.min(
    ...withMaxScores.map(({ seqLength }) => seqLength)
  )
  const finals = withMaxScores.filter(
    ({ seqLength }) => seqLength === minSeqLength
  )
  const preChosen = finals.map(({ stringIndex, matchedIndices }) => ({
    seq: seqs[stringIndex].slice(0, minSeqLength),
    matchedIndices,
  }))
  return uniqBy(preChosen, ({ seq }) =>
    seq.map(([row, col]) => row + col).join('')
  )
}

export function originalSolve(
  matrix: string[][],
  targets: string[][],
  totalBufferSize: number
) {
  const sequences = getSequences({
    bufferSize: totalBufferSize,
    orientation: 'row',
    index: 0,
    used: new Set(),
    matrixSize: matrix.length,
  })
  return evaluate(sequences, matrix, targets)
}
