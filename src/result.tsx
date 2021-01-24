import { chunk } from 'lodash'
import { useMemo, useState } from 'react'
import { solve } from './solver'

const byteMap: Record<string, string> = {
  1: '1C',
  7: '7A',
  5: '55',
  B: 'BD',
  E: 'E9',
  F: 'FF',
}

export function Result({
  matrix,
  targets,
  onStartOver,
}: {
  matrix: string[][]
  targets: string[][]
  onStartOver(): void
}) {
  const bufferSizeLocal = window.localStorage.getItem('buffer_size') || '8'
  const [bufferSize, setBufferSize] = useState(parseInt(bufferSizeLocal, 10))
  const [hiddenTargets, setHiddenTargets] = useState<Set<string>>(new Set())
  const inputIsValid =
    matrix.length > 2 && targets.length && matrix[0].length > 2
  const final = useMemo(() => {
    const targetsToUse = targets.filter(
      target => !hiddenTargets.has(target.join('-'))
    )
    if (inputIsValid && targetsToUse.length && bufferSize) {
      const chosens = solve(matrix, targetsToUse, bufferSize)
      const chosenSeq = chosens[0] || { seq: [], matchedIndices: [] }
      const chosenBytes: Record<string, number> = {}
      chunk(chosenSeq.seq, 2).forEach(([row, col], i) => {
        chosenBytes[`${row},${col}`] = i
      })
      return { chosenBytes, matched: new Set(chosenSeq.matchedIndices) }
    }
    return { chosenBytes: {} as Record<string, number>, matched: new Set() }
  }, [matrix, targets, bufferSize, hiddenTargets, inputIsValid])

  if (!inputIsValid) {
    throw Error('OCR result unacceptable')
  }

  return (
    <>
      <div
        style={{
          margin: 8,
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
        {matrix.map((line, row) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
            key={`${line.join('-')}-${row}`}
          >
            {line.map((byte, col) => {
              const index = final.chosenBytes[`${row},${col}`]
              return (
                <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    color: index !== undefined ? '#ccee70' : '#ccee7060',
                    fontSize: '1.2em',
                    textTransform: 'uppercase',
                    width: 40,
                    height: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  key={`${byte}-${col}`}
                >
                  {byteMap[byte]}
                  {index !== undefined && (
                    <span
                      style={{
                        position: 'absolute',
                        fontSize: '0.6em',
                        top: 0,
                        right: 0,
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      <div
        style={{
          margin: 8,
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
        {targets
          .filter(target => !hiddenTargets.has(target.join('-')))
          .map((target, i) => (
            <div style={{ paddingLeft: 16 }} key={target.join('-')}>
              {target.map((byte, j) => (
                <div
                  style={{
                    display: 'inline-flex',
                    color: final.matched.has(i) ? '#cfed57' : '#FFFFFF40',
                    fontSize: '1.1em',
                    textTransform: 'uppercase',
                    width: 32,
                    height: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  key={`${byte}-${j}`}
                >
                  {byteMap[byte]}
                </div>
              ))}
              <a
                style={{
                  display: 'float',
                  float: 'right',
                  marginRight: 16,
                  color: '#cfed57',
                }}
                onClick={() => {
                  setHiddenTargets(new Set(hiddenTargets).add(target.join('-')))
                }}
                href="#"
              >
                Remove
              </a>
            </div>
          ))}
      </div>

      <div style={{ marginLeft: 8, color: '#cfed57' }}>
        <label>BUFFER SIZE:</label>
        <input
          type="number"
          min={2}
          max={9}
          name="buffer-size"
          style={{
            marginLeft: 8,
          }}
          value={bufferSize}
          onChange={e => {
            const bufferSize = Math.min(
              Math.max(parseInt(e.target.value, 10), 4),
              9
            )
            setBufferSize(bufferSize)
            window.localStorage.setItem('buffer_size', `${bufferSize}`)
          }}
        />
      </div>

      <button
        style={{
          margin: 'auto',
          marginBottom: 16,
        }}
        onClick={onStartOver}
        className="main"
      >
        START OVER
      </button>
    </>
  )
}
