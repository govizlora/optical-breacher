import { PointerEvent, useEffect, useRef, useState } from 'react'

export const MultiTouchTest = () => {
  const [eventCache, setEventCache] = useState<PointerEvent<HTMLDivElement>[]>(
    []
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState<{ x: number; y: number }>()
  const [startInfo, setStartInfo] = useState<{
    x1: number
    y1: number
    x2: number
    y2: number
  }>()

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setEventCache(prev => prev.filter(pe => pe.pointerId !== e.pointerId))
  }

  useEffect(() => {
    if (containerRef.current) {
      const bound = containerRef.current.getBoundingClientRect()
      console.log(bound)
      if (eventCache.length === 2) {
        setPosition({
          x: (eventCache[0].clientX + eventCache[1].clientX) / 2 - bound.x,
          y: (eventCache[0].clientY + eventCache[1].clientY) / 2 - bound.y,
        })
      } else {
        setPosition(undefined)
      }
    }
  }, [eventCache])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        background: 'white',
        height: 320,
        touchAction: 'none',
      }}
      onPointerDown={e => {
        setEventCache(prev => [...prev, e])
        console.log(eventCache.length)
        if (eventCache.length === 1) {
          setStartInfo({
            x1: eventCache[0].clientX,
            y1: eventCache[0].clientY,
            x2: e.clientX,
            y2: e.clientX,
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
      Touchh: {eventCache.length}
      StartInfo: {startInfo?.x1} {startInfo?.y1} {startInfo?.x2} {startInfo?.y2}
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
    </div>
  )
}
