type Orientation = "col" | "row";

const getSequences = ({
  bufferSize,
  orientation,
  index,
  used,
  matrixSize,
}: {
  bufferSize: number;
  matrixSize: number;
  orientation: Orientation;
  index: number;
  used: Set<string>;
}): number[][][] =>
  bufferSize === 0
    ? [[]]
    : Array(matrixSize)
      .fill(null)
      // [row, col]
      .map((_v, i) => (orientation === "row" ? [index, i] : [i, index]))
      .filter((pos) => !used.has(pos.join(",")))
      .map(([nr, nc]) =>
        getSequences({
          bufferSize: bufferSize - 1,
          orientation: orientation === "row" ? "col" : "row",
          index: orientation === "row" ? nc : nr,
          used: new Set(used).add(`${nr},${nc}`),
          matrixSize
        }).map((seq) => [[nr, nc], ...seq])
      )
      .flat();

const evaluate = (
  seqs: number[][][],
  matrix: string[][],
  targets: string[][],
) => {
  const strings = seqs.map((seq) =>
    String.fromCharCode(
      ...seq.map(([row, col]) => parseInt(matrix[row][col], 16))
    )
  );
  const targetStrings = targets.map((target) =>
    String.fromCharCode(...target.map((v) => parseInt(v, 16)))
  );
  let maxScore = 0;
  const evaluated = strings.map((s, stringIndex) => {
    let score = 0;
    let seqLength = 0;
    const matchedIndices: number[] = [];
    targetStrings.forEach((ts, i) => {
      const startLocation = s.indexOf(ts);
      if (startLocation > -1) {
        score += 1 + 0.1 * i;
        const endLocation = startLocation + ts.length;
        seqLength = Math.max(seqLength, endLocation);
        matchedIndices.push(i)
      }
    });
    maxScore = Math.max(score, maxScore);
    return { score, stringIndex, seqLength, matchedIndices };
  });
  const withMaxScores = evaluated.filter(({ score }) => score === maxScore);
  const minSeqLength = Math.min(
    ...withMaxScores.map(({ seqLength }) => seqLength)
  );
  const finals = withMaxScores.filter(
    ({ seqLength }) => seqLength === minSeqLength
  );
  const chosen = finals.map(({ stringIndex, matchedIndices }) =>
    ({ seq: seqs[stringIndex].slice(0, minSeqLength), matchedIndices })
  );
  return chosen;
};

export function solve(
  matrix: string[][],
  targets: string[][],
  totalBufferSize: number,
) {
  // console.time("getSequences");
  const sequences = getSequences({
    bufferSize: totalBufferSize,
    orientation: "row",
    index: 0,
    used: new Set(),
    matrixSize: matrix.length
  });
  // console.timeEnd("getSequences");

  // const preview = (seqs: number[][][]) =>
  //   seqs.map((seq) => seq.map(([row, col]) => matrix[row][col]).join(" -> "));

  return evaluate(sequences, matrix, targets);
}