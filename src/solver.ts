import { uniqBy, flatMap, range } from 'lodash'

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
  matrix,
  targets,
}: {
  bufferSize: number
  orientation: 'col' | 'row'
  index: string
  used: Set<string>
  matrix: string[][]
  targets: string[][]
}): string[] => {
  // Get the list of the possible next moves.
  // Each element is represented as `${row}${col}`
  // (Using string instead of [row, col] to increase performance)
  const nexts = range(matrix.length)
    .map(i => (orientation === 'row' ? index + i : i + index))
    .filter(rowCol => !used.has(rowCol))

  if (bufferSize === 1) {
    return nexts
  }

  // Compute the first 6 steps
  const initialSeqs = flatMap(nexts, rowCol =>
    getSequences({
      bufferSize: Math.min(bufferSize, 6) - 1,
      orientation: orientation === 'row' ? 'col' : 'row',
      index: orientation === 'row' ? rowCol[1] : rowCol[0],
      used: new Set(used).add(rowCol),
      matrix,
      targets,
    }).map(newSeq => rowCol + newSeq)
  )

  // Add some pruning when buffer size > 6.
  // It is based on the premise that the longest target length is 4,
  // and we might "waste" the first 2 steps for finding a good entry point.
  // So we can discard all the sequences that doesn't match any target
  // when the sequence length is 6.
  if (bufferSize > 6) {
    const strings = sequencesToString(initialSeqs, matrix)
    const targetStrings = targets.map(target => target.join(''))
    const filteredSeqs = initialSeqs.filter((_s, i) =>
      targetStrings.some(targetString => strings[i].includes(targetString))
    )

    return flatMap(filteredSeqs, seq =>
      getSequences({
        bufferSize: bufferSize - 6,
        orientation: 'row',
        // The length of the seq is 6.
        // We take the the row index of the 6th element.
        index: seq[10],
        used: new Set(seq.match(/.{1,2}/g)),
        matrix,
        targets,
      }).map(newSeq => seq + newSeq)
    )
  }

  return initialSeqs
}

const evaluate = (seqs: string[], matrix: string[][], targets: string[][]) => {
  const strings = sequencesToString(seqs, matrix)
  const targetStrings = targets.map(target => target.join(''))
  let maxScore = 0
  const evaluated = strings.map((s, stringIndex) => {
    let score = 0
    let seqLength = 0
    const matchedIndices: number[] = []
    targetStrings.forEach((targetString, i) => {
      const startLocation = s.indexOf(targetString)
      if (startLocation > -1) {
        // Give higher priority to lower targets
        score += 1 + 0.1 * i
        const endLocation = startLocation + targetString.length
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
  const withMinlengths = withMaxScores.filter(
    ({ seqLength }) => seqLength === minSeqLength
  )
  const preChosen = withMinlengths.map(({ stringIndex, matchedIndices }) => ({
    seq: seqs[stringIndex].slice(0, minSeqLength * 2),
    matchedIndices,
  }))
  return uniqBy(preChosen, ({ seq }) => seq)
}

export const solve = (
  matrix: string[][],
  targets: string[][],
  totalBufferSize: number
) =>
  evaluate(
    getSequences({
      bufferSize: totalBufferSize,
      orientation: 'row',
      index: '0',
      used: new Set(),
      matrix,
      targets,
    }),
    matrix,
    targets
  )
