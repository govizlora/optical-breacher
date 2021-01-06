import Worker from 'worker-loader!./opencv.worker'

export const worker = new Worker()

// worker.onmessage = (_event) => {
//   console.log('recerrr', _event)
// }

worker.postMessage('init')

worker.onmessage = (e) => {
  e.data === 'inited' && console.log('init done')
}

// worker.addEventListener('message', (_event) => {})

// export class ImageProcessor {
//   private worker = new Worker()
//   private inited: Promise<void>

//   constructor() {
//     // this.inited = new Promise((resolve, reject) => {
//     //   this.worker.postMessage('init')
//     //   this.worker.onmessage = (e) => {
//     //     e.data === 'inited' && resolve()
//     //   }
//     // })
//   }

//   public init() {}
// }
