import { getMostCommonLength } from "./utils"

describe('getMostCommonLength()', () => {
  test('should work', () => {
    const a = [
      [1, 1],
      [1, 1, 1],
      [1, 1],
      [1, 1, 1, 1]
    ]
    expect(getMostCommonLength(a)).toBe(2)
  })
  test('return 0 for empty input', () => {
    expect(getMostCommonLength([])).toBe(0)
  })
})
