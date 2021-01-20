import { solve } from './solver'

const matrix = [
  ['e9', '1c', '1c', '1c', 'bd', 'e9', '55'],
  ['ff', '1c', 'bd', '55', '1c', 'e9', '7a'],
  ['1c', '55', '7a', '1c', 'bd', 'bd', 'ff'],
  ['7a', '7a', '7a', '55', 'ff', '1c', 'bd'],
  ['1c', '7a', '7a', '55', 'ff', '55', '1c'],
  ['1c', '1c', '7a', 'bd', '1c', 'bd', '55'],
  ['bd', 'ff', '7a', '55', 'bd', 'bd', '7a'],
]

const targets = [
  ['ff', '7a', '1c'],
  ['55', '55', '1c', 'bd'],
  ['bd', '1c', '1c', 'e9'],
]

test('solve 7x7 with buffer 8', () => {
  const result = solve(matrix, targets, 8)
  result.forEach(({ seq, matchedIndices }) => {
    expect(matchedIndices).toEqual([1, 2])
  })
  expect(result.length).toBe(18)
})
