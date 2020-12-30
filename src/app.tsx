import { useCallback, useEffect, useRef, useState } from "react"
import { Camera } from "./camera";
import { Logger, OCR } from "./ocr";
import { Result } from "./result";
import { processMatrix, processTargets } from "./utils";

const defaultStat = { progress: 0, status: '' };
const defaultOcrResult: { matrix: string[][], targets: string[][] } = { matrix: [], targets: [] }

const matrix = [
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
  const [ocrResult, setOcrResult] = useState(defaultOcrResult)
  const [stat, setStat] = useState(defaultStat);
  const [showCamera, setShowCamera] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outputs, setOutputs] = useState<string[]>([]);

  const logger: Logger = useCallback(({ name, status, progress = 0 }) => {
    // Only log the progress of the "matrix" since it is more complicated
    (name === 'matrix') && setStat({ status, progress })
  }, [])

  useEffect(() => {
    OCRref.current = new OCR(logger);
    return () => { OCRref.current?.terminate(); }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: "relative" }}>
      {/* {showCamera && <Camera
        onCapture={async (canvas) => {
          setShowCamera(false);
          const result = await OCRref.current!.recognize(canvas, canvas.width, canvas.height);
          const { lines: matrix, chars } = processMatrix(result.matrixData.text)
          const targets = processTargets(result.targetsData.text, chars)
          setOcrResult({ matrix, targets })
          setOutputs([
            'Matrix:',
            ...result.matrixData.text.split('\n'),
            '===result:',
            ...matrix.map(l => l.join(' ')),
            'Targets',
            ...result.targetsData.text.split('\n'),
            '===result:',
            ...processTargets(result.targetsData.text, chars).map(l => l.join(' '))
          ]);
          // if (canvasRef.current) {
          //   canvasRef.current.width = canvas.width;
          //   canvasRef.current.height = canvas.height;
          //   canvasRef.current.getContext('2d')?.drawImage(canvas, 0, 0);
          // }
        }}
      />} */}
      {!showCamera && <>
        {stat.status === 'recognizing text' && !ocrResult.matrix.length && <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <progress value={stat.progress} />
        </div>}
        {/* {!!ocrResult.matrix.length && <Result */}
        {<Result
          matrix={matrix}
          targets={targets}
          onStartOver={() => {
            setStat(defaultStat);
            setOcrResult(defaultOcrResult);
            setShowCamera(true);
          }}
        />}
      </>}
      {/* <div>
        <canvas ref={canvasRef} />
      </div> */}

      {
        // outputs.map(o => <div>{o}</div>)
      }
    </div>
  )
}