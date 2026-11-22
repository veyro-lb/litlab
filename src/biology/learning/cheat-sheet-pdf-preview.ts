import {getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

export async function openCheatSheetPdf(blob: Blob) {
  return getDocument({data: await blob.arrayBuffer()});
}
