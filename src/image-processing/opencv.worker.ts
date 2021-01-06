import opencvPath from '../../lib/opencv.4.5.1.js'
import type * as CV from '../opencv-typings'

declare global {
  interface Window {
    cv: Promise<typeof CV>
  }
}

console.log('worker loaded')
let cv: typeof CV

onmessage = async function (e) {
  console.log('OpenCV worker received message', e.data)
  switch (e.data) {
    case 'init': {
      importScripts(opencvPath)
      cv = this.cv()
      console.log(cv)
      const Mat = new cv.Mat()
      console.log(Mat)
      postMessage('inited')
      break
    }
    default:
      break
  }
}
