import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
// @ts-ignore
import exampleImg from '../assets/example.jpg'
import { threshold, useStorage } from './utils'

const ratio = 16 / 9
const maxZoomLevel = 10

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

  // Below for pinch to zoom
  const pointEventsRef = useRef<PointerEvent<HTMLDivElement>[]>([])
  const pinchStartInfoRef = useRef({ distance: 1, scale: 1 })
  const [_scale, setScale] = useStorage('zoomScale', 1)
  const scale = parseFloat(_scale)
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointEventsRef.current = pointEventsRef.current.filter(
      prev => prev.pointerId !== e.pointerId
    )
  }
  const getDistance = () => {
    const x1 = pointEventsRef.current[0].clientX
    const y1 = pointEventsRef.current[0].clientY
    const x2 = pointEventsRef.current[1].clientX
    const y2 = pointEventsRef.current[1].clientY
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }

  return (
    <>
      <div
        style={{
          margin: 16,
          border: '1px solid #ff606060',
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
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            // Fix a weird bug that the video goes outside of the <video> frame on android emulator
            // Also necessary for pinch to zoom
            overflow: 'hidden',
            // For pinch to zoom
            touchAction: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPointerDown={e => {
            pointEventsRef.current = [...pointEventsRef.current, e]
            // 2 finger pinch zoom starts
            if (pointEventsRef.current.length === 2) {
              pinchStartInfoRef.current = {
                distance: getDistance(),
                scale,
              }
            }
          }}
          onPointerMove={e => {
            pointEventsRef.current = pointEventsRef.current.map(prev =>
              prev.pointerId === e.pointerId ? e : prev
            )
            if (pointEventsRef.current.length === 2) {
              const zoomRatioChange =
                getDistance() / pinchStartInfoRef.current.distance
              setScale(
                Math.max(
                  Math.min(
                    pinchStartInfoRef.current.scale * zoomRatioChange,
                    maxZoomLevel
                  ),
                  1
                )
              )
            }
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
              videoRef?.current?.play()
              setReady(true)
              updateDimension()
            }}
            style={{
              objectFit: 'cover',
              transform: `scale(${scale})`,
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
        <div
          style={{
            fontSize: '0.4em',
            color: '#ff606080',
            margin: 2,
            whiteSpace: 'pre',
          }}
        >
          ZOOM_RATIO{'    '}
          {scale.toFixed(6)}x
        </div>
      </div>

      <div style={{ margin: 16, marginTop: 0, overflow: 'auto' }}>
        Move the camera closer to the screen (or use pinch zoom) to avoid
        unnecessary contents. Don't rotate or tilt.
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
          let sourceH = camHeight / scale
          let sourceW = camWidth / scale
          const context = canvas.getContext('2d')!
          if (camWidth / camHeight > ratio) {
            // The camera very wide
            sourceW = sourceH * ratio
            canvas.height = Math.min(sourceH, 720)
            canvas.width = canvas.height * ratio
          } else {
            // The camera is very tall
            sourceH = sourceW / ratio
            canvas.width = Math.min(sourceW, 1280)
            canvas.height = canvas.width / ratio
          }
          sourceX = (camWidth - sourceW) / 2
          sourceY = (camHeight - sourceH) / 2
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
