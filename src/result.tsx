import { useMemo, useState } from "react";
import { solve } from "./solver";

export function Result({ matrix, targets, onStartOver }: {
  matrix: string[][];
  targets: string[][];
  onStartOver(): void;
}) {
  const bufferSizeLocal = window.localStorage.getItem('buffer_size') || '4';
  const [bufferSize, setBufferSize] = useState(parseInt(bufferSizeLocal, 10));
  // const chosen: Record<string, number> = {}
  const chosen = useMemo(() => {
    const chosens = matrix.length && targets.length ? solve(matrix, targets) : [];
    const chosenSeq = chosens[0] || [];
    const c: Record<string, number> = {};
    chosenSeq.forEach(([row, col], i) => {
      c[`${row},${col}`] = i;
    })
    return c;
  }, [matrix, targets])

  return <>
    <div style={{ margin: 16 }}>
      <label>BUFFER SIZE:</label>
      <input
        type="number"
        min={2}
        max={10}
        name="buffer-size"
        style={{
          marginLeft: 8,
        }}
        value={bufferSize}
        onChange={e => {
          const bufferSize = Math.min(Math.max(parseInt(e.target.value, 10), 2), 10)
          setBufferSize(bufferSize);
          window.localStorage.setItem('buffer_size', `${bufferSize}`)
        }}
      />
    </div>
    <div
      style={{
        margin: 16,
        marginTop: 0,
        border: '1px solid #cfed5780',
        backgroundColor: '#120f18',
        paddingBottom: 8,
      }}
    >
      <div
        style={{
          backgroundColor: '#cfed57',
          color: 'black',
          padding: '4px 16px',
          marginBottom: 8,
        }}
      >
        BEST ROUTE
      </div>
      {matrix.map((line, row) =>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {line.map((byte, col) => {
            const index = chosen[`${row},${col}`];
            return <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                color: index !== undefined ? '#ccee70' : '#ccee7060',
                fontSize: '1.2em',
                textTransform: 'uppercase',
                width: 40,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {byte}
              {index !== undefined &&
                <span
                  style={{
                    position: "absolute",
                    fontSize: '0.6em',
                    top: 0,
                    right: 0,
                  }}
                >
                  {index + 1}
                </span>}
            </span>
          })}
        </div>)}
    </div>

    <div
      style={{
        margin: 16,
        marginTop: 0,
        border: '1px solid #cfed5780',
        backgroundColor: '#120f18',
        paddingBottom: 8,
      }}
    >
      <div
        style={{
          color: '#cfed57',
          padding: '4px 16px',
          marginBottom: 8,
          borderBottom: '1px solid #cfed5780',
        }}
      >
        TARGET SEQUENCES
      </div>
      {targets.map(target =>
        <div style={{ paddingLeft: 16 }}>
          {target.map(byte =>
            <div
              style={{
                display: 'inline-flex',
                color: 'white',
                fontSize: '1.1em',
                textTransform: 'uppercase',
                width: 32,
                height: 28,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {byte}
            </div>)}
        </div>)}
    </div>
    <button
      style={{
        margin: 'auto',
        marginBottom: 32,
      }}
      onClick={onStartOver}
    >
      START OVER
    </button>
  </>
}