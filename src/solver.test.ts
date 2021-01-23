import { solve } from './solver'
import { originalSolve } from './test/original-solver'

const cases = [
  {
    matrix: [
      ['e', '1', '1', '1', 'b', 'e', '5'],
      ['f', '1', 'b', '5', '1', 'e', '7'],
      ['1', '5', '7', '1', 'b', 'b', 'f'],
      ['7', '7', '7', '5', 'f', '1', 'b'],
      ['1', '7', '7', '5', 'f', '5', '1'],
      ['1', '1', '7', 'b', '1', 'b', '5'],
      ['b', 'f', '7', '5', 'b', 'b', '7'],
    ],
    targets: [
      ['f', '7', '1'],
      ['5', '5', '1', 'b'],
      ['b', '1', '1', 'e'],
    ],
  },
  {
    matrix: [
      ['1', '5', 'f', 'b', 'e'],
      ['b', '1', 'e', 'f', 'e'],
      ['5', 'b', 'f', '1', '1'],
      ['e', 'b', '1', '5', '5'],
      ['5', 'e', 'b', '5', 'f'],
    ],
    targets: [
      ['e', '5'],
      ['5', 'b', 'e'],
      ['f', '1', 'b', 'e'],
      ['5', '1', 'f', '5'],
    ],
  },
]

test('Solver', () => {
  const lengths = [4, 5, 6, 7, 8]
  cases.forEach(({ matrix, targets }) => {
    const originalResults = lengths.map(i =>
      originalSolve(matrix, targets, i)
        .map(res => ({
          ...res,
          seq: res.seq.map(([row, col]) => `${row}${col}`).join(''),
        }))
        .sort(({ seq: seqA }, { seq: seqB }) => seqA.localeCompare(seqB))
    )
    const results = lengths.map(i =>
      solve(matrix, targets, i).sort(({ seq: seqA }, { seq: seqB }) =>
        seqA.localeCompare(seqB)
      )
    )
    expect(results).toEqual(originalResults)
  })
})
