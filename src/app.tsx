import { useCallback, useEffect, useRef, useState } from "react"
import { Camera } from "./camera";
import { Logger, OCR } from "./ocr";
import { Result } from "./result";
import { processResult } from "./utils";

const defaultStat = { progress: 0, status: '' };
const defaultOcrResult: { pool: string[][], targets: string[][] } = { pool: [], targets: [] }

// const pool = [
//   ["1c", "55", "ff", "bd", "e9"],
//   ["bd", "1c", "e9", "ff", "e9"],
//   ["55", "bd", "ff", "1c", "1c"],
//   ["e9", "bd", "1c", "55", "55"],
//   ["55", "e9", "bd", "55", "ff"]
// ];

// const targets = [
//   ["e9", "55"],
//   ["55", "bd", "e9"],
//   ["ff", "1c", "bd", "e9"],
//   ["55", "1c", "ff", "55"]
// ];

export function App() {
  const OCRref = useRef<OCR>();
  const [OcrResult, setOcrResult] = useState(defaultOcrResult)
  const [stat, setStat] = useState(defaultStat);
  const [showCamera, setShowCamera] = useState(true);

  const logger: Logger = useCallback(({ workerID, status, progress = 0 }) => {
    // Only log the progress of the "pool" since it is more complicated
    (workerID === 0) && setStat({ status, progress })
  }, [])

  useEffect(() => {
    OCRref.current = new OCR(logger);
    return () => { OCRref.current?.terminate(); }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: "relative" }}>
      {showCamera && <Camera
        onCapture={async (canvas) => {
          setShowCamera(false);
          const result = await OCRref.current!.recognize(canvas, canvas.width, canvas.height);
          const pool = processResult(result.leftText);
          const targets = processResult(result.rightText);
          setOcrResult({ pool, targets })
        }}
      />}
      {!showCamera && <>
        {stat.status === 'recognizing text' && !OcrResult.pool.length && <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <progress value={stat.progress} />
        </div>}
        {!!OcrResult.pool.length && <Result
          pool={OcrResult.pool}
          targets={OcrResult.targets}
          // {<Result
          //   pool={pool}
          //   targets={targets}
          onStartOver={() => {
            setStat(defaultStat);
            setOcrResult(defaultOcrResult);
            setShowCamera(true);
          }}
        />}
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