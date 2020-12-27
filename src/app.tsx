import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Camera } from "./camera";
import { Logger, OCR } from "./ocr";
import { Result } from "./result";
import { solve } from "./solver";
import { processResult } from "./utils";

const defaultStat = { progress: 0, status: '' };

const pool = [
  ["1c", "55", "ff", "bd", "e9"],
  ["bd", "1c", "e9", "ff", "e9"],
  ["55", "bd", "ff", "1c", "1c"],
  ["e9", "bd", "1c", "55", "55"],
  ["55", "e9", "bd", "55", "ff"]
];

const targets = [
  ["e9", "55"],
  ["55", "bd", "e9"],
  ["ff", "1c", "bd", "e9"],
  ["55", "1c", "ff", "55"]
];

export function App() {
  const OCRref = useRef<OCR>();
  const [result, setResult] = useState<string>()
  const [stat, setStat] = useState(defaultStat);
  const [showCamera, setShowCamera] = useState(false);

  const logger: Logger = useCallback(({ workerID, status, progress = 0 }) => {
    // Only log the left since it is more complicated
    (workerID === 0) && setStat({ status, progress })
  }, [])

  console.log(stat)

  useEffect(() => {
    OCRref.current = new OCR(logger);
    return () => {
      OCRref.current?.terminate();
    }
  }, [])

  // const answers = useMemo(() => {
  //   const pool = processResult(result.leftText);
  //   const targets = processResult(result.rightText);
  //   return pool.length && targets.length ? solve(pool, targets) : [];
  // }, [result])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: "relative" }}>
      {showCamera && <Camera
        onCapture={async (canvas) => {
          setShowCamera(false);
          const result = await OCRref.current!.recognize(canvas, canvas.width, canvas.height);
          setResult(result)
        }}
      />}
      {!showCamera && <>
        {stat.status === 'recognizing text' && <div
          style={{
            position: 'relative',
            margin: 16,
            border: '1px solid #ff606060',
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <progress value={stat.progress} />
        </div>}
        <Result pool={pool} targets={targets}>
          <button
            style={{
              margin: "16px auto 32px auto"
            }}
            onClick={() => {
              setStat(defaultStat);
              setResult(undefined);
              setShowCamera(true);
            }}
          >
            START OVER
        </button>
      </>

      }
        {/* <div>Status 0: {status[0]}</div>
      <div>Status 1: {status[1]}</div> */}
        {/* <canvas ref={leftCanvasRef} style={{ display: 'inline', width: 320, height: 270 }} />
			<canvas ref={rightCanvasRef} style={{ display: 'inline', width: 160, height: 270 }} /> */}
        {/* <canvas ref={rightCanvasRef} /> */}
        {/* <div>{result.leftText.split('\n').map(v => <div>{v}</div>)}</div>
      <div>{result.rightText.split('\n').map(v => <div>{v}</div>)}</div>
      <div>Left:{processResult(result.leftText).map(v => <div style={{ fontFamily: 'monospace' }}>{v.join(' ')}</div>)}</div>
      <div>Right:{processResult(result.rightText).map(v => <div style={{ fontFamily: 'monospace' }}>{v.join(' ')}</div>)}</div>
      <div>Answers: {answers.map((a, i) => <div key={i}>{a}</div>)}</div> */}
      </div>
  )
}