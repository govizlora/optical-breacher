import { createWorker, OEM, PSM, createScheduler, ImageLike } from 'tesseract.js'
// @ts-ignore
import langPath from './eng.traineddata.gz'

export type Logger = (packet: { workerID: number, status: string; progress?: number }) => void

export class OCR {
  private scheduler = createScheduler();
  private inited: Promise<void> = Promise.resolve();

  constructor(
    private logger: Logger,
    private workerAmount: number = 2
  ) {
    this.inited = Promise.all(
      Array(this.workerAmount)
        .fill(null)
        .map((_v, i) => this.createWorker(i))
    )
      .then(workers => {
        workers.forEach(this.scheduler.addWorker)
      })
  }

  public terminate = this.scheduler.terminate;

  // Multiple Rectangles (with scheduler to do recognition in parallel):
  // https://github.com/naptha/tesseract.js/blob/master/docs/examples.md
  // Currently hard-coded to separate the image vertically with a 2:1 ratio.
  public async recognize(image: ImageLike, width: number, height: number) {
    await this.inited;
    const rectangles = [
      { left: 0, top: 0, width: width / 3 * 2, height },
      { left: width / 3 * 2, top: 0, width: width / 3, height }
    ]
    const results = await Promise.all(rectangles.map((rectangle) => (
      this.scheduler.addJob('recognize', image, { rectangle })
    )));
    console.log('finished', results)
    return {
      leftText: results[0].data.text as string,
      rightText: results[1].data.text as string,
    }
  }

  private async createWorker(workerID: number) {
    const worker = createWorker({
      langPath: langPath,
      logger: args => this.logger({ workerID, ...args })
    });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789 ABCDEFGHJKLMNPQRTUVWXYZ',
      // tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      // tessedit_ocr_engine_mode: OEM.TESSERACT_ONLY,
      // user_defined_dpi: '2400'
      // preserve_interword_spaces: '1',
      // tessjs_create_box: '1',
      // tessjs_create_unlv: '1',
      // tessjs_create_osd: '1'
    });
    return worker;
  }
}