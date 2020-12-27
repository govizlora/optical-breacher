import { useMemo } from "react";
import { solve } from "./solver";

export function Result({ pool, targets, onStartOver }: {
  pool: string[][];
  targets: string[][];
  onStartOver(): void;
}) {
  const chosen = useMemo(() => {
    const chosens = pool.length && targets.length ? solve(pool, targets) : [];
    const chosenSeq = chosens[0] || [];
    const c: Record<string, number> = {};
    chosenSeq.forEach(([row, col], i) => {
      c[`${row},${col}`] = i;
    })
    return c;
  }, [pool, targets])

  return <>
    <div
      style={{
        margin: 16,
        border: '1px solid #cfed5780',
        backgroundColor: '#120f18',
        paddingBottom: 16,
      }}
    >
      <div
        style={{
          backgroundColor: '#cfed57',
          color: 'black',
          padding: '4px 16px',
          marginBottom: 16,
        }}
      >
        BEST ROUTE
      </div>
      {pool.map((line, row) =>
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
        paddingBottom: 16,
      }}
    >
      <div
        style={{
          color: '#cfed57',
          padding: '4px 16px',
          marginBottom: 16,
          borderBottom: '1px solid #cfed5780',
        }}
      >
        MATCHED SEQUENCES
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