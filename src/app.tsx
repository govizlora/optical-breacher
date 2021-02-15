import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera } from './camera'
import { Logger, OCR } from './ocr'
import { Result } from './result'
import { processMatrix, processTargets, threshold } from './utils'
import { UAParser } from 'ua-parser-js'
import { Upload } from './upload'
import appBorder from '../assets/app-border.svg'

const defaultOcrProgress = { matrixProgress: 0, targetsProgress: 0, status: '' }
const defaultOcrResult: {
  matrix: string[][]
  targets: string[][]
  finished: boolean
} = { matrix: [], targets: [], finished: false }
const parser = new UAParser()
const deviceType = parser.getDevice()?.type

export default function App() {
  const OCRref = useRef<OCR>()
  const [ocrResult, setOcrResult] = useState(defaultOcrResult)
  const [ocrProgress, setOcrProgress] = useState(defaultOcrProgress)
  const [showInputPage, setShowInputPage] = useState(true)
  // const canvasRef = useRef<HTMLCanvasElement>(null)
  // const [outputs, setOutputs] = useState<string[]>([])

  const [isMobile, setIsMobile] = useState(
    deviceType === 'mobile' || deviceType === 'tablet'
  )

  const logger: Logger = useCallback(({ name, status, progress = 0 }) => {
    if (status === 'recognizing text') {
      setOcrProgress(prev => ({
        status,
        matrixProgress: name === 'matrix' ? progress : prev.matrixProgress,
        targetsProgress: name === 'targets' ? progress : prev.targetsProgress,
      }))
    }
  }, [])

  useEffect(() => {
    OCRref.current = new OCR(logger)
    return () => {
      OCRref.current?.terminate()
    }
  }, [])

  // Run the OCR and data cleaning.
  const onCapture = useCallback(async canvas => {
    setShowInputPage(false)
    setOcrProgress(defaultOcrProgress)
    setOcrResult(defaultOcrResult)
    const result = await OCRref.current!.recognize(
      canvas,
      canvas.width,
      canvas.height
    )
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
    //   canvasRef.current.width = canvas.width
    //   canvasRef.current.height = canvas.height
    //   canvasRef.current.getContext('2d')?.drawImage(canvas, 0, 0)
    // }
  }, [])

  // For screenshots.
  // Convert the file to OCR ready image
  const handleFile = useCallback(
    async (file: File) => {
      const image = await createImageBitmap(file)
      // const canvas = canvasRef.current!
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = Math.min(image.width, 1280)
      canvas.height = (canvas.width / image.width) * image.height
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        canvas.width,
        canvas.height
      )
      threshold(ctx, true)
      onCapture(canvas)
    },
    [onCapture]
  )

  // Support Ctrl + V anywhere
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isMobile) {
        return
      }
      e.preventDefault()
      const item = e.clipboardData?.items?.[0]
      const file = item?.kind === 'file' ? item.getAsFile() : null
      file && handleFile(file)
    }
    document.addEventListener('paste', onPaste)
    return () => {
      document.removeEventListener('paste', onPaste)
    }
  }, [handleFile, isMobile])

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 2,
          height: 'calc(100% - 14px)',
          borderImageSource: `url(${appBorder})`,
          borderImageSlice: 69,
          borderImageWidth: 'auto',
          boxSizing: 'border-box',
        }}
        className="border"
      >
        {showInputPage ? (
          isMobile ? (
            <Camera onCapture={onCapture} />
          ) : (
            <Upload
              handleFile={handleFile}
              toCameraMode={() => {
                setIsMobile(true)
              }}
            />
          )
        ) : ocrResult.finished ? (
          <Result
            matrix={ocrResult.matrix}
            targets={ocrResult.targets}
            onStartOver={() => {
              setShowInputPage(true)
            }}
          />
        ) : (
          <progress
            style={{ margin: 'auto' }}
            value={
              ocrProgress.status === 'recognizing text'
                ? (ocrProgress.matrixProgress + ocrProgress.targetsProgress) / 2
                : 0
            }
          />
        )}
        {/* <div>
          <canvas ref={canvasRef} />
        </div> */}
        {/* outputs.map(o => <div>{o}</div>) */}
      </div>

      <div
        style={{
          height: 12,
          fontSize: '0.6em',
          display: 'flex',
          padding: '0 1px',
          color: '#ff6060a0',
        }}
      >
        <span style={{ marginRight: 4 }}>OPTICAL BREACHER MK.1 Rev 1.8</span>
        <a
          style={{ marginLeft: 'auto', color: 'inherit' }}
          href="https://github.com/govizlora/optical-breacher"
          rel="noopener"
          target="_blank"
        >
          GITHUB
        </a>
        <a
          style={{ marginLeft: 4, color: 'inherit' }}
          href="#"
          onClick={() => {
            setIsMobile(!isMobile)
            setShowInputPage(true)
          }}
        >
          {isMobile ? 'SCREENSHOT MODE' : 'CAMERA MODE'}
        </a>
      </div>
    </>
  )
}
