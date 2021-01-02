import { useState } from 'react'
// @ts-ignore
import exampleImg from '../assets/crop-example.jpg'

export const Upload = ({
  handleFile,
  toCameraMode,
}: {
  handleFile(file: File): Promise<void>
  toCameraMode(): void
}) => {
  const [isDragOn, setIsDragOn] = useState(false)
  const [err, setErr] = useState('')
  const [exampleOn, setExampleOn] = useState(false)

  return (
    <>
      <label
        style={{
          margin: 16,
          flexBasis: 300,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'center',
          padding: '0 48px',
          ...(isDragOn && { backgroundColor: '#ff606020' }),
        }}
        className="dropzone"
        onDragOver={(e) => {
          e.preventDefault()
        }}
        onDragEnter={(e) => {
          e.target === e.currentTarget && setIsDragOn(true)
        }}
        onDragLeave={(e) => {
          e.target === e.currentTarget && setIsDragOn(false)
        }}
        onDrop={async (e) => {
          setIsDragOn(false)
          e.preventDefault()
          const item = e.dataTransfer?.items?.[0]
          const file = item.kind === 'file' ? item.getAsFile() : null
          file &&
            handleFile(file).catch(() => {
              setErr('Invalid image')
            })
        }}
      >
        <div style={{ pointerEvents: 'none' }}>
          <div>To start, you can:</div>
          <div>- Drag an image into the box</div>
          <div>- or click the box to upload an image</div>
          <div>
            - or make an in-game screenshot using WIN + SHIFT + S, then CTRL + V
            here
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            file &&
              handleFile(file).catch(() => {
                setErr('Invalid image')
              })
          }}
        />
      </label>
      {err && <div style={{ marginLeft: 16 }}>Error: {err}</div>}
      <div style={{ margin: '0 16px' }}>
        Please crop the screenshot before uploading.
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
            <img
              style={{ maxHeight: 240, maxWidth: '100%' }}
              src={exampleImg}
            />
          </div>
        )}
      </div>
      <div style={{ margin: '8px 16px' }}>
        Alternatively, you can{' '}
        <a href="#" onClick={toCameraMode}>
          use the camera
        </a>
      </div>
    </>
  )
}
