import pdfMake from 'pdfmake/build/pdfmake';
import fonts from 'pdfmake/build/vfs_fonts';
import type {Content, ContentText, TableCell, TDocumentDefinitions} from 'pdfmake/interfaces';
import {getFigureCredit} from './source-policy';
import type {CheatSheetData} from './cheat-sheet-data';

pdfMake.addVirtualFileSystem(fonts);

const palettes = {
  A: {ink: '#155549', line: '#BCD9CC', tint: '#E7F3ED'},
  B: {ink: '#554481', line: '#CFC5E7', tint: '#EFEBF8'},
  C: {ink: '#235477', line: '#C4D8EC', tint: '#E8F2FB'},
  D: {ink: '#784A23', line: '#E6D0B7', tint: '#FCF0DF'},
};
const hlPalette = {ink: '#564278', line: '#D6CBE5', tint: '#F2ECF8'};
const examPalette = {ink: '#705321', line: '#E7D6AC', tint: '#FFF5DA'};
const textColor = '#192D35';
const subdued = '#4E6269';
const margin = 27;
const columnGap = 12;
const columnWidth = (595.28 - 2 * margin - columnGap) / 2;

type Palette = (typeof palettes)[keyof typeof palettes];
type Point = CheatSheetData['groups'][number]['points'][number] & {higher: boolean};

// Render equivalent arrows and raised allele labels with the bundled font.
function pdfText(text: string): ContentText[] {
  return text.replaceAll('→', '->').replaceAll('⇌', '<=>').replaceAll('ʻ', '‘')
    .split(/([ᴬᴮ])/).filter(Boolean).map(part => {
      if (part === 'ᴬ' || part === 'ᴮ') return {text: part === 'ᴬ' ? 'A' : 'B', sup: true};
      return {text: part};
    });
}

async function getImage(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('A cheat sheet figure could not be loaded.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function panel(title: string, body: Content[], palette: Palette, compact = false): Content {
  return {
    unbreakable: true,
    margin: [0, 0, 0, compact ? 3 : 6],
    table: {
      widths: ['*'],
      body: [
        [{text: pdfText(title), bold: true, color: palette.ink, fillColor: palette.tint}],
        [{stack: body}],
      ],
    },
    layout: {
      hLineWidth: () => .55, vLineWidth: () => .55,
      hLineColor: () => palette.line, vLineColor: () => palette.line,
      paddingLeft: () => 8, paddingRight: () => 8,
      paddingTop: index => compact ? 2 : index === 0 ? 4 : 5,
      paddingBottom: index => compact ? 2 : index === 0 ? 4 : 6,
    },
  };
}

function splitBalanced<T>(items: T[], weight: (item: T) => number, fraction = .5): [T[], T[]] {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let split = items.length;
  let running = 0;
  let best = Infinity;
  for (let index = 1; index < items.length; index++) {
    running += weight(items[index - 1]);
    const distance = Math.abs(running - total * fraction);
    if (distance >= best) break;
    best = distance;
    split = index;
  }
  return [items.slice(0, split), items.slice(split)];
}

export async function makeCheatSheetPdf(data: CheatSheetData): Promise<Blob> {
  const {sheet, extension, check} = data;
  const palette = palettes[data.id[0] as keyof typeof palettes] ?? palettes.A;
  const points: Point[] = data.groups.flatMap(group => group.points.map(point => ({...point, higher: group.higher})));
  const illustration = points.find(point => point.figure);
  const figure = illustration?.figure;
  const images = figure ? {[figure.src]: await getImage(figure.src)} : {};
  const example = illustration?.mistake ? illustration : points.find(point => point.mistake);
  const comparison = data.comparisons[0];

  function weight(point: Point, includeFigure: boolean) {
    const words = point.heading.length + point.section.revisionSummary.length;
    return 32 + words / 4.2 + (includeFigure && point === illustration ? 115 : 0)
      + (point === example ? 38 : 0);
  }

  function renderPoint(point: Point, includeFigure: boolean, figureHeight: number, compact: boolean): Content {
    const body: Content[] = [{text: pdfText(point.section.revisionSummary)}];
    if (includeFigure && figure && point === illustration) {
      const credit = getFigureCredit(figure, data.references);
      body.push(
        {image: figure.src, fit: [columnWidth - 20, figureHeight], alignment: 'center', margin: [0, 4, 0, 3]},
        {text: pdfText(figure.captionTitle), fontSize: 8, bold: true},
        {text: pdfText(`Source: ${credit.attribution}${figure.license ? ` · ${figure.license}` : ''}`), style: 'credit',
          ...(credit.sourceUrl ? {link: credit.sourceUrl} : {})},
        ...credit.dataSources.map(reference => ({text: pdfText(reference.title), style: 'credit', link: reference.url})),
      );
    }
    if (point === example && point.mistake) {
      body.push({
        text: [{text: 'Watch for: ', bold: true, color: examPalette.ink}, ...pdfText(point.mistake.correction)],
        fontSize: 8.6, margin: [0, 4, 0, 0],
      });
    }
    const label = point.higher ? ' · HL' : '';
    return panel(`${point.id}${label}  ${point.heading}`, body, point.higher ? hlPalette : palette, compact);
  }

  function title(continued: boolean): Content {
    return {
      margin: [0, 0, 0, 10],
      table: {widths: ['*'], body: [[{fillColor: palette.ink, stack: [
        {text: pdfText(`BIOLAB / CHEAT SHEET     ${data.subtitle}`), fontSize: 8.8, bold: true, characterSpacing: .3, color: '#FFFFFF'},
        {text: pdfText(continued ? `${data.title} (continued)` : data.title),
          fontSize: continued ? 14 : 21, bold: true, color: '#FFFFFF', margin: [0, 4, 0, 0]},
      ]}]]},
      layout: {
        hLineWidth: () => 0, vLineWidth: () => 0,
        paddingLeft: () => 11, paddingRight: () => 11,
        paddingTop: () => 8, paddingBottom: () => 9,
      },
    };
  }

  function overview(): Content[] {
    if (!sheet) return [];
    const info: Content[] = [
      {columns: sheet.essentials.map(([label, value]) => panel(label, [{text: pdfText(value)}], palette)), columnGap: 8},
    ];
    const tips: Content[] = [panel('Exam tip', [{text: pdfText(sheet.exam)}], examPalette)];
    if (sheet.formula) tips.push(panel(sheet.formula[0], [{text: pdfText(sheet.formula[1])}], palette));
    if (extension) tips.push(panel('HL · ' + extension[0], [{text: pdfText(extension[1])}], hlPalette));
    info.push({columns: tips, columnGap: 8, margin: [0, 0, 0, 3]});
    return info;
  }

  function wrapUp(): Content[] {
    const content: Content[] = [];
    if (comparison) {
      const body: TableCell[][] = [
        comparison.headers.map(text => ({text: pdfText(text), bold: true, color: palette.ink, fillColor: palette.tint})),
        ...comparison.rows.map(row => row.map((text, col) => ({text: pdfText(text), bold: col === 0}))),
      ];
      const table: Content[] = [{table: {headerRows: 1, dontBreakRows: true, widths: comparison.headers.map(() => '*'), body},
        layout: 'lightHorizontalLines', fontSize: 8.4}];
      if (comparison.note) table.push({text: pdfText(comparison.note), style: 'credit'});
      content.push(panel(comparison.title, table, palette));
    }
    if (check) {
      content.push(panel('Worked question', [
        {text: pdfText(check[0]), bold: true, margin: [0, 0, 0, 3]},
        {text: [{text: 'Answer: ', bold: true, color: examPalette.ink}, ...pdfText(check[1])]},
      ], examPalette));
    }
    return content;
  }

  async function render({pages, fontSize = 9.5, figureHeight = 92, firstPageShare = .53}:
    {pages: 1 | 2; fontSize?: number; figureHeight?: number; firstPageShare?: number}): Promise<{blob: Blob; pages: number}> {
    let actualPages = 0;
    const includeFigure = figureHeight > 0;
    const weighted = (point: Point) => weight(point, includeFigure);
    const batches = pages === 1 ? [points] : splitBalanced(points, weighted, firstPageShare);
    const content: Content[] = batches.flatMap((batch, index) => {
      const columns = splitBalanced(batch, weighted).map(column => ({stack: column.map(point => renderPoint(point, includeFigure, figureHeight, fontSize < 9))}));
      return [
        ...(index ? [{stack: [title(true)], pageBreak: 'before' as const}] : [title(false), ...overview()]),
        {columns, columnGap},
        ...(index === batches.length - 1 ? wrapUp() : []),
      ];
    });
    const definition: TDocumentDefinitions = {
      info: {title: `BioLab Cheat Sheet · ${data.subtitle} · ${data.title}`, author: 'BioLab'},
      language: 'en',
      pageSize: 'A4',
      pageMargins: [margin, 25, margin, 37],
      defaultStyle: {fontSize, lineHeight: 1.08, color: textColor},
      styles: {
        credit: {fontSize: 7.2, color: subdued, margin: [0, 2, 0, 0]},
      },
      footer: (page, count) => {
        actualPages = count;
        return {columns: [{text: `BioLab · ${data.id} Cheat Sheet`}, {text: `${page} / ${count}`, alignment: 'right'}],
          color: subdued, fontSize: 8, margin: [margin, 10, margin, 0]};
      },
      images,
      content,
    };
    return {blob: await pdfMake.createPdf(definition).getBlob(), pages: actualPages};
  }

  const layouts = [
    ...(points.length <= 10 ? [{pages: 1 as const}] : []),
    {pages: 2 as const},
    {pages: 2 as const, fontSize: 8.8, figureHeight: 75, firstPageShare: .52},
    {pages: 2 as const, fontSize: 8.8, figureHeight: 75, firstPageShare: .47},
    {pages: 2 as const, fontSize: 8.8, figureHeight: 75, firstPageShare: .57},
  ];
  for (const layout of layouts) {
    const result = await render(layout);
    if (result.pages > 0 && result.pages <= layout.pages) return result.blob;
  }
  throw new Error('The cheat sheet exceeded the two-page PDF layout.');
}
