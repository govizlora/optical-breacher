import { useCallback, useEffect, useRef, useState } from "react"
// @ts-ignore
import exampleImg from '../assets/example.jpg'

const ratio = 16 / 9;

function threshold(context: CanvasRenderingContext2D, t: number) {
	const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
	const thres = t * 255;
	for (let i = 0; i < imageData.data.length; i += 4) {
		const c = imageData.data[i + 1] < thres ? 255 : 0;
		imageData.data[i] = c
		imageData.data[i + 1] = c
		imageData.data[i + 2] = c
	}
	context.putImageData(imageData, 0, 0);
}

export function Camera({
	onCapture
}: {
	onCapture(canvas: HTMLCanvasElement): void;
}) {
	const [dim, setDim] = useState({ width: 240, height: 320 })
	const [ready, setReady] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [exampleOn, setExampleOn] = useState(false);

	const updateDimension = useCallback(() => {
		if (videoRef.current && containerRef.current) {
			const width = containerRef.current.clientWidth;
			const height = width / ratio;
			videoRef.current.width = width
			videoRef.current.height = height
			setDim({ width, height })
		}
	}, [setDim])

	useEffect(() => {
		window.addEventListener('resize', updateDimension);
		return () => { window.removeEventListener('resize', updateDimension) }
	}, [updateDimension])

	useEffect(() => {
		if (videoRef.current && !videoRef.current.srcObject) {
			navigator.mediaDevices.getUserMedia(
				{
					audio: false,
					video: { facingMode: "environment" }
				}
			).then(mediaStream => {
				videoRef.current!.srcObject = mediaStream;
			})
		}
	}, [])

	return <>
		<div style={{ position: 'relative', margin: 16, border: '1px solid #ff606060', overflow: 'hidden' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', color: '#cfed57' }}>
				<div>CODE MATRIX</div>
				<div>SEQUENCE</div>
			</div>
			<div ref={containerRef} style={{ position: 'relative' }}>
				<video
					ref={videoRef}
					playsInline
					onCanPlay={() => {
						if (videoRef.current && containerRef.current) {
							videoRef.current.play();
							setReady(true);
							updateDimension();
						}
					}}
					style={{
						objectFit: 'cover',
						display: 'block' // Avoid the extra 5px bottom margin after the element
					}}
					muted
				/>
				{ready &&
					<div
						style={{
							boxSizing: 'border-box',
							position: 'absolute',
							display: 'grid',
							top: 0,
							gridTemplateColumns: '5fr 2fr',
							// columnGap: 16,
							padding: 4,
							// Ideally "100%" is enough, but it doesn't work on iOS
							width: dim.width,
							height: dim.height
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
				}
			</div>
		</div>
		<div style={{ margin: '0 16px' }}>
			Move the camera as close to the screen as possile. Avoid rotation or tilt.
			{exampleOn ? <div><img style={{ width: '70%' }} src={exampleImg} /></div> :
				<a style={{ color: '#FF6060', marginLeft: 4 }} href="#" onClick={() => { setExampleOn(true) }}>Show the example</a>}
		</div>
		<button
			className='main'
			style={{
				margin: 'auto',
				marginBottom: 32,
			}}
			onClick={() => {
				const canvas = document.createElement('canvas');
				const mediaStream = videoRef.current!.srcObject as MediaStream;
				const { width: camWidth = 1, height: camHeight = 1 } = mediaStream.getTracks()[0].getSettings();
				let sourceX = 0;
				let sourceY = 0;
				let sourceW = camWidth;
				let sourceH = camHeight;
				const context = canvas.getContext('2d')!;
				if (camWidth / camHeight > ratio) {
					const captureWidth = camHeight * ratio;
					sourceX = (camWidth - captureWidth) / 2;
					sourceW = captureWidth;
					canvas.height = Math.min(camHeight, 720);
					canvas.width = canvas.height * ratio;
				} else {
					const captureHeight = camWidth / ratio;
					sourceY = (camHeight - captureHeight) / 2;
					sourceH = captureHeight;
					canvas.width = Math.min(camWidth, 1280);
					canvas.height = canvas.width / ratio;
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
}