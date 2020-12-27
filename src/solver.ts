type Orientation = "col" | "row";

export function solve(
  pool: string[][],
  targets: string[][]
) {
  const size = pool.length;

  /**
   * Return the max value it can find
   */
  const getSequences = ({
    bufferSize,
    orientation,
    index,
    used
  }: {
    bufferSize: number;
    orientation: Orientation;
    index: number;
    used: Set<string>;
  }): number[][][] =>
    bufferSize === 0
      ? [[]]
      : Array(size)
        .fill(null)
        // [row, col]
        .map((_v, i) => (orientation === "row" ? [index, i] : [i, index]))
        .filter((pos) => !used.has(pos.join(",")))
        .map(([nr, nc]) =>
          getSequences({
            bufferSize: bufferSize - 1,
            orientation: orientation === "row" ? "col" : "row",
            index: orientation === "row" ? nc : nr,
            used: new Set(used).add(`${nr},${nc}`)
          }).map((seq) => [[nr, nc], ...seq])
        )
        .flat();

  console.time("getSequences");
  const res = getSequences({
    bufferSize: 8,
    orientation: "row",
    index: 0,
    used: new Set()
  });
  console.timeEnd("getSequences");

  const evaluate = (seqs: number[][][]) => {
    const strings = seqs.map((seq) =>
      String.fromCharCode(
        ...seq.map(([row, col]) => parseInt(pool[row][col], 16))
      )
    );
    const targetStrings = targets.map((target) =>
      String.fromCharCode(...target.map((v) => parseInt(v, 16)))
    );
    let maxScore = 0;
    const evaluated = strings.map((s, stringIndex) => {
      let score = 0;
      let seqLength = 0;
      targetStrings.forEach((ts, i) => {
        const startLocation = s.indexOf(ts);
        if (startLocation > -1) {
          score += 1 + 0.1 * i;
          const endLocation = startLocation + ts.length;
          seqLength = Math.max(seqLength, endLocation);
        }
      });
      maxScore = Math.max(score, maxScore);
      return { score, stringIndex, seqLength };
    });
    const withMaxScores = evaluated.filter(({ score }) => score === maxScore);
    const minSeqLength = Math.min(
      ...withMaxScores.map(({ seqLength }) => seqLength)
    );
    const finals = withMaxScores.filter(
      ({ seqLength }) => seqLength === minSeqLength
    );
    const chosen = finals.map(({ stringIndex }) =>
      seqs[stringIndex].slice(0, minSeqLength)
    );
    return chosen;
  };

  // const preview = (seqs: number[][][]) =>
  //   seqs.map((seq) => seq.map(([row, col]) => pool[row][col]).join(" -> "));

  return evaluate(res);
}