import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
// @ts-ignore
import exampleImg from '../assets/example.jpg'
import { threshold, useStorage } from './utils'

const ratio = 16 / 9
const maxZoomLevel = 5

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
    '1'
  )
  const zoomLevelRef = useRef(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Below for pinch to zoom
  const [eventCache, setEventCache] = useState<PointerEvent<HTMLDivElement>[]>(
    []
  )
  const [pinchStartInfo, setPinchStartInfo] = useState<{
    distance: number
    zoomLevel: number
  }>()
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setEventCache(prev => prev.filter(pe => pe.pointerId !== e.pointerId))
  }
  const [position, setPosition] = useState<{ x: number; y: number }>()
  useEffect(() => {
    if (containerRef.current && pinchStartInfo) {
      const bound = containerRef.current.getBoundingClientRect()
      console.log(bound)
      if (eventCache.length === 2) {
        setPosition({
          x: (eventCache[0].clientX + eventCache[1].clientX) / 2 - bound.x,
          y: (eventCache[0].clientY + eventCache[1].clientY) / 2 - bound.y,
        })
        const currentDistance = Math.sqrt(
          (eventCache[0].clientX - eventCache[1].clientX) ** 2 +
            (eventCache[0].clientY - eventCache[1].clientY) ** 2
        )
        const zoomRatioChange = currentDistance / pinchStartInfo.distance
        zoomLevelRef.current = Math.max(
          Math.min(pinchStartInfo.zoomLevel * zoomRatioChange, 5),
          1
        )
      } else {
        setPosition(undefined)
      }
    }
  }, [eventCache])

  const updateDimension = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      const dpr = window.devicePixelRatio || 1
      const width = containerRef.current.clientWidth
      const height = width / ratio
      const canvas = canvasRef.current
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.getContext('2d')!.scale(dpr, dpr)
      setDim({ width, height })
    }
  }, [setDim])

  // useEffect(updateDimension, [])

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
          .then(mediaStream => {
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

  useEffect(() => {
    if (ready) {
      let cancelled = false
      function draw() {
        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!
        const mediaStream = videoRef.current!.srcObject as MediaStream
        const {
          width: camWidth = 1,
          height: camHeight = 1,
        } = mediaStream.getTracks()[0].getSettings()
        let sourceX = 0
        let sourceY = 0
        let sourceW = camWidth
        let sourceH = camHeight
        if (camWidth / camHeight > ratio) {
          const captureWidth = camHeight * ratio
          sourceX = (camWidth - captureWidth) / 2
          sourceW = captureWidth
        } else {
          const captureHeight = camWidth / ratio
          sourceY = (camHeight - captureHeight) / 2
          sourceH = captureHeight
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
        !cancelled && requestAnimationFrame(draw)
      }
      requestAnimationFrame(draw)
      return () => {
        cancelled = true
      }
    }
  }, [ready])

  return (
    <>
      <div
        style={{
          margin: 16,
          border: '1px solid #ff606060',
          // overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div>
          Height: {dim.height}, width: {dim.width}, count: {eventCache.length}
        </div>
        <div>zoomLevel: {zoomLevelRef.current}</div>
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
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            // Fix a weird bug that the video goes outside of the <video> frame on android emulator
            overflow: 'hidden',
            // For pinch to zoom
            touchAction: 'none',
          }}
          onPointerDown={e => {
            setEventCache(prev => [...prev, e])
            console.log(eventCache.length)
            if (eventCache.length === 1) {
              const x1 = eventCache[0].clientX
              const y1 = eventCache[0].clientY
              const x2 = e.clientX
              const y2 = e.clientX
              setPinchStartInfo({
                distance: Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2),
                zoomLevel: zoomLevelRef.current,
              })
            }
          }}
          onPointerMove={e => {
            setEventCache(prev =>
              prev.map(pe => (pe.pointerId === e.pointerId ? e : pe))
            )
          }}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerOut={onPointerUp}
        >
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
              display: 'none', // Avoid the extra 5px bottom margin after the element
            }}
            muted
          />
          <canvas ref={canvasRef} style={{ height: '100%', width: '100%' }} />
          <div
            style={{
              position: 'absolute',
              top: position?.y,
              left: position?.x,
              display: position ? 'block' : 'none',
              width: 5,
              height: 5,
              background: 'pink',
            }}
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
                onChange={e => {
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
                  (turning it off may fix the black camera issue)
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
                      rel="noopener"
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
                      rel="noopener"
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
          threshold(context)
          onCapture(canvas)
        }}
      >
        SCAN
      </button>
    </>
  )
}
