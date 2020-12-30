import { useCallback, useEffect, useRef, useState } from "react"
import { Camera } from "./camera";
import { Logger, OCR } from "./ocr";
import { Result } from "./result";
import { processMatrix, processTargets } from "./utils";

const defaultOcrProgress = { matrixProgress: 0, targetsProgress: 0, status: '' };
const defaultOcrResult: { matrix: string[][], targets: string[][], finished: boolean } =
  { matrix: [], targets: [], finished: false }

// const matrix = [
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
  const [ocrResult, setOcrResult] = useState(defaultOcrResult)
  const [ocrProgress, setOcrProgress] = useState(defaultOcrProgress);
  const [showCamera, setShowCamera] = useState(true);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [outputs, setOutputs] = useState<string[]>([]);

  const logger: Logger = useCallback(({ name, status, progress = 0 }) => {
    if (status === 'recognizing text') {
      setOcrProgress(prev => ({
        status,
        matrixProgress: name === 'matrix' ? progress : prev.matrixProgress,
        targetsProgress: name === 'targets' ? progress : prev.targetsProgress
      }))
    }
  }, [])

  useEffect(() => {
    OCRref.current = new OCR(logger);
    return () => { OCRref.current?.terminate(); }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        // position: "relative"
      }}
    >
      {showCamera ?
        <Camera
          onCapture={async (canvas) => {
            setShowCamera(false);
            const result = await OCRref.current!.recognize(canvas, canvas.width, canvas.height);
            const { lines: matrix, chars } = processMatrix(result.matrixData.text)
            const targets = processTargets(result.targetsData.text, chars)
            setOcrResult({ matrix, targets, finished: true })
            // setOutputs([
            //   'Matrix:',
            //   ...result.matrixData.text.split('\n'),
            //   '===result:',
            //   ...matrix.map(l => l.join(' ')),
            //   'Targets',
            //   ...result.targetsData.text.split('\n'),
            //   '===result:',
            //   ...processTargets(result.targetsData.text, chars).map(l => l.join(' '))
            // ]);
            // if (canvasRef.current) {
            //   canvasRef.current.width = canvas.width;
            //   canvasRef.current.height = canvas.height;
            //   canvasRef.current.getContext('2d')?.drawImage(canvas, 0, 0);
            // }
          }}
        /> :
        ocrResult.finished ?
          <Result
            matrix={ocrResult.matrix}
            targets={ocrResult.targets}
            onStartOver={() => {
              setOcrProgress(defaultOcrProgress);
              setOcrResult(defaultOcrResult);
              setShowCamera(true);
            }}
          /> :
          <progress
            style={{ margin: 'auto' }}
            value={ocrProgress.status === 'recognizing text' ?
              (ocrProgress.matrixProgress + ocrProgress.targetsProgress) / 2 : 0}
          />
      }
      {/* <div>
        <canvas ref={canvasRef} />
      </div> */}

      {
        // outputs.map(o => <div>{o}</div>)
      }
    </div>
  )
}