import { uniqBy, flatMap, chunk } from 'lodash'

const matrix = [
  ['e', '1', '1', '1', 'b', 'e', '5'],
  ['f', '1', 'b', '5', '1', 'e', '7'],
  ['1', '5', '7', '1', 'b', 'b', 'f'],
  ['7', '7', '7', '5', 'f', '1', 'b'],
  ['1', '7', '7', '5', 'f', '5', '1'],
  ['1', '1', '7', 'b', '1', 'b', '5'],
  ['b', 'f', '7', '5', 'b', 'b', '7'],
]

const targets = [
  ['f', '7', '1'],
  ['5', '5', '1', 'b'],
  ['b', '1', '1', 'e'],
]

type Orientation = 'col' | 'row'

let count = 1

const sequencesToString = (seqs: string[], matrix: string[][]) =>
  seqs.map(seq => {
    let res = ''
    for (let i = 0; i < seq.length; i += 2) {
      res += matrix[parseInt(seq[i], 10)][parseInt(seq[i + 1], 10)]
    }
    return res
  })

const getSequences = ({
  bufferSize,
  orientation,
  index,
  used,
  matrixSize,
  matrix,
  targets,
}: {
  bufferSize: number
  matrixSize: number
  orientation: Orientation
  index: string
  used: Set<string>
  // Below Only used for pruning
  matrix: string[][]
  targets: string[][]
}): string[] => {
  count += 1
  if (bufferSize === 0) {
    return ['']
  }

  const nexts = Array(matrixSize)
    .fill(null)
    // `${row}${col}`
    .map((_v, i) => (orientation === 'row' ? index + i : i + index))
    .filter(pos => !used.has(pos))

  // Bruteforce when buffer size <= 6
  if (bufferSize <= 6) {
    return flatMap(nexts, rc => {
      const seqs = getSequences({
        bufferSize: bufferSize - 1,
        orientation: orientation === 'row' ? 'col' : 'row',
        index: orientation === 'row' ? rc[1] : rc[0],
        used: new Set(used).add(rc),
        matrixSize,
        matrix,
        targets,
      }).map(seq => rc + seq)
      return seqs
    })
  }

  // Add some pruning when buffer size > 6.
  // It is based on the premise that the longest target has length of 4,
  // and we might "waste" the first 2 steps for finding a good entry point.
  // So we can discard all the sequences that doesn't match any target
  // when the sequence length is 6.
  const length6seqs = flatMap(nexts, rc =>
    getSequences({
      bufferSize: 5,
      orientation: 'col',
      index: rc[1],
      used: new Set([rc]),
      matrixSize,
      matrix,
      targets,
    }).map(seq => rc + seq)
  )

  // Filter out the length 6 seqs that doesn't match any target
  const length6strings = sequencesToString(length6seqs, matrix)
  const targetStrings = targets.map(target => target.join(''))
  const filteredSeqs = length6seqs.filter((_s, i) => {
    let matched = false
    targetStrings.forEach(targetString => {
      if (!matched && length6strings[i].includes(targetString)) {
        matched = true
      }
    })
    return matched
  })

  return flatMap(filteredSeqs, length6seq => {
    const seqs = getSequences({
      bufferSize: bufferSize - 6,
      orientation: 'row',
      // The 11th element
      index: length6seq[10],
      used: new Set(length6seq.match(/.{1,2}/g)),
      matrixSize,
      matrix,
      targets,
    }).map(seq => length6seq + seq)
    return seqs
  })
}

const evaluate = (seqs: string[], matrix: string[][], targets: string[][]) => {
  const strings = sequencesToString(seqs, matrix)
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
  console.log('minLength', minSeqLength)
  const finals = withMaxScores.filter(
    ({ seqLength }) => seqLength === minSeqLength
  )
  const preChosen = finals.map(({ stringIndex, matchedIndices }) => ({
    seq: seqs[stringIndex].slice(0, minSeqLength * 2),
    matchedIndices,
  }))
  const chosen = uniqBy(preChosen, ({ seq }) => seq)
  return chosen
}

export function solve(
  matrix: string[][],
  targets: string[][],
  totalBufferSize: number
) {
  console.time('getSequences')
  const sequences = getSequences({
    bufferSize: totalBufferSize,
    orientation: 'row',
    index: '0',
    used: new Set(),
    matrixSize: matrix.length,
    matrix,
    targets,
  })
  console.timeEnd('getSequences')
  console.log(sequences.length)
  console.time('evaluate')

  const res = evaluate(sequences, matrix, targets)
  console.timeEnd('evaluate')
  const preview = res.map(({ seq }) =>
    chunk(seq, 2)
      .map(([row, col]) => row + col)
      .join(' -> ')
  )
  console.log(preview)
  console.log('count', count)
}

solve(matrix, targets, 10)
