import {useEffect, useId, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Download, ExternalLink, FileText, X} from 'lucide-react';
import type {PDFDocumentProxy, RenderTask} from 'pdfjs-dist';
import type {CheatSheetData} from './cheat-sheet-data';

type PdfFile = {blob: Blob; url: string};

export default function CheatSheetPdf({data}: {data: CheatSheetData}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const filePromise = useRef<Promise<PdfFile> | null>(null);
  const [file, setFile] = useState<PdfFile | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      void filePromise.current?.then(({url}) => URL.revokeObjectURL(url), () => {});
    };
  }, []);

  function preparePdf() {
    if (!filePromise.current) {
      setBusy(true);
      setError('');
      filePromise.current = import('./cheat-sheet-pdf').then(({makeCheatSheetPdf}) => makeCheatSheetPdf(data))
        .then(blob => {
          const result = {blob, url: URL.createObjectURL(blob)};
          setFile(result);
          return result;
        })
        .catch(error => {
          filePromise.current = null;
          setError('The PDF could not be prepared. Please try again.');
          throw error;
        })
        .finally(() => setBusy(false));
    }
    return filePromise.current;
  }

  function showPreview() {
    dialog.current?.showModal();
    setOpen(true);
    void preparePdf().catch(() => {});
  }

  async function downloadPdf() {
    try {
      const {url} = await preparePdf();
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      link.click();
    } catch {
      // The preparation error is shown next to the PDF controls.
    }
  }

  return <div className="bio-sheets-pdf">
    <div className="bio-sheets-pdf-actions">
      <button type="button" ref={opener} onClick={showPreview}><FileText size={17} aria-hidden="true"/> Preview PDF</button>
      <button type="button" onClick={() => void downloadPdf()} disabled={busy}><Download size={17} aria-hidden="true"/> Download PDF</button>
    </div>
    {!open && busy && <p role="status">Preparing PDF…</p>}
    {!open && error && <p role="alert">{error}</p>}
    <dialog ref={dialog} className="bio-sheet-pdf-dialog" aria-labelledby={titleId} onClose={() => {
      setOpen(false);
      opener.current?.focus();
    }}>
      <header className="bio-sheet-pdf-header">
        <h2 id={titleId}>{data.title} · PDF preview</h2>
        <button type="button" autoFocus onClick={() => dialog.current?.close()}><X size={17} aria-hidden="true"/> Close</button>
      </header>
      {open && <>
        {error && <div className="bio-sheet-pdf-feedback">
          <p role="alert">{error}</p><button type="button" onClick={() => void preparePdf().catch(() => {})}>Try again</button>
        </div>}
        {busy && !file && <p className="bio-sheet-pdf-feedback" role="status">Preparing PDF…</p>}
        {file && <PdfPages file={file} filename={data.filename}/>}
      </>}
    </dialog>
  </div>;
}

function PdfPages({file, filename}: {file: PdfFile; filename: string}) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [error, setError] = useState('');
  const [renderedPage, setRenderedPage] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let task: Awaited<ReturnType<typeof import('./cheat-sheet-pdf-preview')['openCheatSheetPdf']>> | undefined;
    void import('./cheat-sheet-pdf-preview').then(({openCheatSheetPdf}) => openCheatSheetPdf(file.blob)).then(async loading => {
      task = loading;
      if (!active) return loading.destroy();
      const document = await loading.promise;
      if (active) setPdf(document);
    }).catch(() => {
      if (active) setError('The preview could not be loaded. You can still open or download the PDF.');
    });
    return () => {
      active = false;
      void task?.destroy().catch(() => {});
    };
  }, [file]);

  useEffect(() => {
    if (!pdf) return;
    let active = true;
    let renderTask: RenderTask | undefined;
    viewport.current?.scrollTo(0, 0);
    void pdf.getPage(page).then(pdfPage => {
      const target = canvas.current;
      if (!active || !target) return;
      const dimensions = pdfPage.getViewport({scale: 2});
      target.width = Math.ceil(dimensions.width);
      target.height = Math.ceil(dimensions.height);
      renderTask = pdfPage.render({canvas: target, viewport: dimensions});
      return renderTask.promise.then(() => {
        if (active) setRenderedPage(page);
      });
    }).catch(() => {
      if (active) setError('This page could not be displayed. You can still open or download the PDF.');
    });
    return () => {
      active = false;
      renderTask?.cancel();
    };
  }, [page, pdf]);

  return <>
    <div className="bio-sheet-pdf-toolbar">
      {pdf && !error && <div className="bio-sheets-pdf-actions" role="group" aria-label="PDF page controls">
        <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}><ArrowLeft size={17} aria-hidden="true"/></button>
        <span aria-live="polite">Page {page} of {pdf.numPages}</span>
        <button type="button" aria-label="Next page" disabled={page === pdf.numPages} onClick={() => setPage(page + 1)}><ArrowRight size={17} aria-hidden="true"/></button>
      </div>}
      <div className="bio-sheets-pdf-actions">
        {pdf && !error && <button type="button" onClick={() => setZoomed(value => !value)}>
          {zoomed ? 'Fit page' : 'Zoom in'}
        </button>}
        <a href={file.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true"/> Open PDF</a>
        <a href={file.url} download={filename}><Download size={16} aria-hidden="true"/> Download PDF</a>
      </div>
    </div>
    <div className="bio-sheet-pdf-page" ref={viewport} role="region" aria-label="PDF preview page" tabIndex={0}>
      {error && <p role="alert">{error}</p>}
      {!error && renderedPage !== page && <p role="status">Loading page…</p>}
      <canvas ref={canvas} data-zoomed={zoomed} hidden={Boolean(error) || renderedPage !== page} aria-label={`Preview of page ${page}`}/>
    </div>
  </>;
}
