import { useCallback, useEffect, useRef, useState } from 'react'
// @ts-ignore
import exampleImg from '../assets/example.jpg'
import { useStorage } from './utils'

const ratio = 16 / 9

function threshold(context: CanvasRenderingContext2D, t: number) {
  const imageData = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height
  )
  const thres = t * 255
  for (let i = 0; i < imageData.data.length; i += 4) {
    const c = imageData.data[i + 1] < thres ? 255 : 0
    imageData.data[i] = c
    imageData.data[i + 1] = c
    imageData.data[i + 2] = c
  }
  context.putImageData(imageData, 0, 0)
}

export function Camera({
  onCapture,
}: {
  onCapture(canvas: HTMLCanvasElement): void
}) {
  const [dim, setDim] = useState({ width: 240, height: 320 })
  const [ready, setReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [exampleOn, setExampleOn] = useState(false)
  const [cameraSelectOn, setCameraSelectOn] = useState(false)
  const [furthurHelpOn, setFurthurHelpOn] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>()
  const [deviceId, setDeviceId] = useState<string>()
  const [nativeResolutionOn, setNativeResolutionOn] = useStorage(
    'nativeResolutionOn',
    '0'
  )

  const updateDimension = useCallback(() => {
    if (videoRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth
      const height = width / ratio
      videoRef.current.width = width
      videoRef.current.height = height
      setDim({ width, height })
    }
  }, [setDim])

  useEffect(() => {
    window.addEventListener('resize', updateDimension)
    return () => {
      window.removeEventListener('resize', updateDimension)
    }
  }, [updateDimension])

  // Get the video stream from the camera
  useEffect(() => {
    if (videoRef.current) {
      try {
        navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              ...(nativeResolutionOn === '1'
                ? { width: { ideal: 7680 }, height: { ideal: 4320 } }
                : undefined),
              ...(deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: 'environment' }),
            },
          })
          .then((mediaStream) => {
            videoRef.current!.srcObject = mediaStream
          })
      } catch {
        throw new Error('WebRTC not supported')
      }
    }
  }, [deviceId, nativeResolutionOn])

  // Get the list of available video input devices.
  // Only used when the user clicks "Camera not working?"
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices()
        setDevices(deviceInfos.filter(({ kind }) => kind === 'videoinput'))
      } catch {
        throw new Error('WebRTC not supported')
      }
    }
    cameraSelectOn && getDevices()
  }, [cameraSelectOn])

  return (
    <>
      <div
        style={{
          position: 'relative',
          margin: 16,
          border: '1px solid #ff606060',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 4px',
            color: '#cfed57',
          }}
        >
          <div>CODE MATRIX</div>
          <div>SEQUENCE</div>
        </div>
        <div ref={containerRef} style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            playsInline
            onCanPlay={() => {
              if (videoRef.current && containerRef.current) {
                videoRef.current.play()
                setReady(true)
                updateDimension()
              }
            }}
            style={{
              objectFit: 'cover',
              display: 'block', // Avoid the extra 5px bottom margin after the element
            }}
            muted
          />
          {ready && (
            <div
              style={{
                boxSizing: 'border-box',
                position: 'absolute',
                display: 'grid',
                top: 0,
                gridTemplateColumns: '5fr 2fr',
                padding: 4,
                // Ideally "100%" is enough, but it doesn't work on iOS
                width: dim.width,
                height: dim.height,
              }}
            >
              <div
                style={{
                  gridColumn: 1,
                  border: '1px dashed #cfed57',
                }}
              />
              <div
                style={{
                  gridColumn: 2,
                  border: '1px dashed #cfed57',
                  borderLeft: 0,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: 16, marginTop: 0, overflow: 'auto' }}>
        Move the camera as close to the screen as possile. Avoid rotation or
        tilt.
        <a
          style={{ marginLeft: 4 }}
          href="#"
          onClick={() => {
            setExampleOn(!exampleOn)
          }}
        >
          {exampleOn ? 'Hide' : 'Show'} the example
        </a>
        {exampleOn && (
          <div>
            <img style={{ width: '70%' }} src={exampleImg} />
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          {!cameraSelectOn ? (
            <a
              onClick={() => {
                setCameraSelectOn(true)
              }}
              href="#"
            >
              Camera not working?
            </a>
          ) : (
            <>
              <div>- Specify the camera to use:</div>
              <select
                onChange={(e) => {
                  setDeviceId(e.target.value)
                }}
                value={deviceId}
              >
                {devices &&
                  devices.map(({ label, deviceId }, i) => (
                    <option value={deviceId} key={deviceId}>
                      {i + 1}: {label}
                    </option>
                  ))}
              </select>
              <label style={{ display: 'block', marginTop: 8 }}>
                -
                <input
                  type="checkbox"
                  checked={nativeResolutionOn === '1'}
                  onChange={() => {
                    setNativeResolutionOn(
                      nativeResolutionOn === '0' ? '1' : '0'
                    )
                  }}
                />
                Use native resolution{' '}
                <small style={{ fontSize: '0.6em' }}>
                  (no impact to OCR accuracy, but may fix the black camera
                  issue)
                </small>
              </label>
              {!furthurHelpOn ? (
                <a
                  onClick={() => {
                    setFurthurHelpOn(true)
                  }}
                  href="#"
                >
                  Still not working?
                </a>
              ) : (
                <>
                  <p>
                    iOS user: Please use Safari browser (see{' '}
                    <a
                      href="https://stackoverflow.com/a/29164511"
                      target="_blank"
                    >
                      why
                    </a>
                    ). Make sure you have granted access to the camera (Settings
                    - Safari - Camera - choose "Ask")
                  </p>
                  <p>
                    Android user: If none of the options above work, please
                    check{' '}
                    <a
                      href="https://github.com/govizlora/optical-breacher/issues/7"
                      target="_blank"
                    >
                      this issue
                    </a>
                    .
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <button
        className="main"
        style={{
          margin: 'auto',
          marginBottom: 24,
        }}
        onClick={() => {
          const canvas = document.createElement('canvas')
          const mediaStream = videoRef.current!.srcObject as MediaStream
          const {
            width: camWidth = 1,
            height: camHeight = 1,
          } = mediaStream.getTracks()[0].getSettings()
          let sourceX = 0
          let sourceY = 0
          let sourceW = camWidth
          let sourceH = camHeight
          const context = canvas.getContext('2d')!
          if (camWidth / camHeight > ratio) {
            const captureWidth = camHeight * ratio
            sourceX = (camWidth - captureWidth) / 2
            sourceW = captureWidth
            canvas.height = Math.min(camHeight, 720)
            canvas.width = canvas.height * ratio
          } else {
            const captureHeight = camWidth / ratio
            sourceY = (camHeight - captureHeight) / 2
            sourceH = captureHeight
            canvas.width = Math.min(camWidth, 1280)
            canvas.height = canvas.width / ratio
          }
          context.drawImage(
            videoRef.current!,
            sourceX,
            sourceY,
            sourceW,
            sourceH,
            0,
            0,
            canvas.width,
            canvas.height
          )
          threshold(context, 0.8)
          onCapture(canvas)
        }}
      >
        SCAN
      </button>
    </>
  )
}
