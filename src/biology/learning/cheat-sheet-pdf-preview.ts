// PDF.js's modern build uses newer browser APIs that can prevent in-page rendering.
import {getDocument, GlobalWorkerOptions} from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

export async function openCheatSheetPdf(blob: Blob) {
  return getDocument({data: await blob.arrayBuffer()});
}
