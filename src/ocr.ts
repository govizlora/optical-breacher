import { createWorker, OEM, PSM, ImageLike, Page, WorkerParams, Worker } from 'tesseract.js'
// @ts-ignore
import '../lib/cyber.traineddata.gz'
// @ts-ignore
import workerPath from '../lib/worker.min.js'
// @ts-ignore
import corePath from '../lib/tesseract-core.wasm.js'

export type Logger = (packet: { name: string, status: string; progress?: number }) => void

export class OCR {
  private matrixWorker: Promise<Worker>;
  private targetsWorker: Promise<Worker>;

  constructor(
    private logger: Logger,
  ) {
    this.matrixWorker = this.createWorker('matrix', { tessedit_pageseg_mode: PSM.SINGLE_BLOCK, tessedit_ocr_engine_mode: OEM.LSTM_ONLY })
    this.targetsWorker = this.createWorker('targets', { tessedit_pageseg_mode: PSM.SINGLE_BLOCK, tessedit_ocr_engine_mode: OEM.LSTM_ONLY })
  }

  public terminate = async () => Promise.all([(await this.targetsWorker).terminate(), (await this.matrixWorker).terminate]);

  // Multiple Rectangles (with scheduler to do recognition in parallel):
  // https://github.com/naptha/tesseract.js/blob/master/docs/examples.md
  // Currently hard-coded to separate the image vertically with a 5:2 ratio.
  public async recognize(image: ImageLike, width: number, height: number) {
    const matrixWorker = await this.matrixWorker;
    const targetsWorker = await this.targetsWorker;
    const results = await Promise.all([
      matrixWorker.recognize(image, { rectangle: { left: 0, top: 0, width: width / 7 * 5, height } }),
      targetsWorker.recognize(image, { rectangle: { left: width / 7 * 5, top: 0, width: width / 7 * 2, height } })
    ]);
    return {
      matrixData: results[0].data as Page,
      targetsData: results[1].data as Page,
    }
  }

  private async createWorker(name: string, params: Partial<WorkerParams>) {
    const worker = createWorker({
      langPath: './lib',
      workerPath,
      corePath,
      logger: args => this.logger({ name, ...args })
    });
    await worker.load();
    await worker.loadLanguage('cyber');
    await worker.initialize('cyber');
    await worker.setParameters(params);
    return worker;
  }
}