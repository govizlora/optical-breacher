import { getMostCommonLength } from "./utils"

test('getMostCommonLength', () => {
  const a = [
    [1, 1],
    [1, 1, 1],
    [1, 1],
    [1, 1, 1, 1]
  ]
  expect(getMostCommonLength(a)).toBe(2)
})