import {useEffect, useRef, useState} from 'react';
import {Download, ExternalLink, ZoomIn, ZoomOut} from 'lucide-react';
import type {PDFDocumentProxy, PDFDocumentLoadingTask, RenderTask} from 'pdfjs-dist';
import type {CheatSheetData} from './cheat-sheet-data';

export default function CheatSheetPdf({data, requestedId}: {data: CheatSheetData; requestedId: string | null}) {
  const [url, setUrl] = useState('');
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    let task: PDFDocumentLoadingTask | undefined;
    setUrl('');
    setPdf(null);
    setError('');

    async function load() {
      try {
        const {makeCheatSheetPdf} = await import('./cheat-sheet-pdf');
        const blob = await makeCheatSheetPdf(data);
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        const {openCheatSheetPdf} = await import('./cheat-sheet-pdf-preview');
        if (!active) return;
        task = await openCheatSheetPdf(blob);
        if (!active) {
          await task.destroy();
          return;
        }
        const document = await task.promise;
        if (active) setPdf(document);
      } catch {
        if (active) setError(objectUrl
          ? 'The preview could not load. You can still open or download the PDF.'
          : 'The cheat sheet PDF could not load.');
      }
    }

    void load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      void task?.destroy().catch(() => {});
    };
  }, [data, retry]);

  return <section className="bio-sheet-pdf-reader" aria-label="Cheat sheet PDF">
    <div className="bio-sheet-pdf-toolbar">
      <span>{pdf ? `${pdf.numPages} ${pdf.numPages === 1 ? 'page' : 'pages'}` : 'PDF'}</span>
      <div className="bio-sheets-pdf-actions">
        {pdf && <button type="button" onClick={() => setZoomed(value => !value)}>
          {zoomed ? <ZoomOut size={17} aria-hidden="true"/> : <ZoomIn size={17} aria-hidden="true"/>}
          {zoomed ? 'Fit width' : 'Zoom in'}
        </button>}
        {url && <>
          <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true"/> Open PDF</a>
          <a href={url} download={data.filename}><Download size={16} aria-hidden="true"/> Download PDF</a>
        </>}
      </div>
    </div>
    {error && <div className="bio-sheet-pdf-feedback">
      <p role="alert">{error}</p>
      <button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
    </div>}
    {!error && !pdf && <p className="bio-sheet-pdf-feedback" role="status">Loading cheat sheet…</p>}
    {pdf && <div className="bio-sheet-pdf-pages" data-zoomed={zoomed}
      role={zoomed ? 'region' : undefined} aria-label={zoomed ? 'Zoomed PDF pages' : undefined} tabIndex={zoomed ? 0 : undefined}>
      {Array.from({length: pdf.numPages}, (_, index) =>
        <PdfPage key={index} pdf={pdf} page={index + 1} requestedId={requestedId}/>)}
    </div>}
  </section>;
}

function PdfPage({pdf, page, requestedId}: {pdf: PDFDocumentProxy; page: number; requestedId: string | null}) {
  const wrapper = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    let renderTask: RenderTask | undefined;
    let scrollFrame = 0;

    async function render() {
      try {
        const pdfPage = await pdf.getPage(page);
        const target = canvas.current;
        if (!active || !target) return;
        const dimensions = pdfPage.getViewport({scale: 2});
        target.width = Math.ceil(dimensions.width);
        target.height = Math.ceil(dimensions.height);
        renderTask = pdfPage.render({canvas: target, viewport: dimensions});
        const [text] = await Promise.all([pdfPage.getTextContent(), renderTask.promise]);
        if (!active) return;
        const items = text.items.flatMap(item => 'str' in item ? [item] : []);
        setLines(items.map(item => item.str + (item.hasEOL ? '\n' : '')).join('').split('\n').filter(Boolean));
        setReady(true);
        const startsAtSection = requestedId && items.some(item =>
          item.str.trim() === requestedId || item.str.startsWith(requestedId + ' '));
        if (startsAtSection) {
          scrollFrame = requestAnimationFrame(() => wrapper.current?.scrollIntoView({block: 'start'}));
        }
      } catch {
        if (active) setError(true);
      }
    }

    void render();
    return () => {
      active = false;
      renderTask?.cancel();
      cancelAnimationFrame(scrollFrame);
    };
  }, [pdf, page, requestedId]);

  return <section className="bio-sheet-pdf-page" ref={wrapper} aria-label={`Page ${page} of ${pdf.numPages}`}>
    {!ready && !error && <p role="status">Loading page {page}…</p>}
    {error && <p role="alert">This page could not load. Open or download the PDF to read it.</p>}
    <canvas ref={canvas} hidden={!ready} aria-hidden="true"/>
    {ready && <p className="bio-sr-only">{lines.join(' ')}</p>}
  </section>;
}
