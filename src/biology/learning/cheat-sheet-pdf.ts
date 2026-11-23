import pdfMake from 'pdfmake/build/pdfmake';
import fonts from 'pdfmake/build/vfs_fonts';
import nunitoBody from '@fontsource/nunito/files/nunito-latin-400-normal.woff?url';
import nunitoHeading from '@fontsource/nunito/files/nunito-latin-800-normal.woff?url';
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
const margin = 25;
const columnGap = 10;
const a4 = {width: 595.28, height: 841.89};
const pageMargins: [number, number, number, number] = [margin, 23, margin, 33];
const availableHeight = a4.height - pageMargins[1] - pageMargins[3];
const columnWidth = (a4.width - 2 * margin - columnGap) / 2;

type Palette = (typeof palettes)[keyof typeof palettes];
type Point = CheatSheetData['groups'][number]['points'][number] & {higher: boolean};

// Render equivalent arrows and raised allele labels with the bundled font.
function pdfText(text: string): ContentText[] {
  return text.replaceAll('→', '->').replaceAll('⇌', '<=>').replaceAll('ʻ', '‘')
    .match(/[\x20-\xff\u2010-\u2022]+|[^\x20-\xff\u2010-\u2022]/gu)?.map(part => {
      if (part === 'ᴬ' || part === 'ᴮ') return {text: part === 'ᴬ' ? 'A' : 'B', sup: true};
      return /^[\x20-\xff\u2010-\u2022]+$/.test(part) ? {text: part} : {text: part, font: 'Roboto'};
    }) ?? [];
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
      paddingLeft: () => 7, paddingRight: () => 7,
      paddingTop: index => compact ? 2 : index === 0 ? 4 : 5,
      paddingBottom: index => compact ? 2 : index === 0 ? 4 : 6,
    },
  };
}

type PanelColumns = {left: number[]; right: number[]; height: number};
type PlannedPage = {columns: PanelColumns; remaining: number};

function balanceColumns(indices: number[], heights: number[]): PanelColumns {
  const total = indices.reduce((sum, index) => sum + heights[index], 0);
  let split = indices.length;
  let bestHeight = total;
  let leftHeight = 0;
  for (let index = 1; index < indices.length; index++) {
    leftHeight += heights[indices[index - 1]];
    const height = Math.max(leftHeight, total - leftHeight);
    if (height >= bestHeight) break;
    bestHeight = height;
    split = index;
  }
  return {left: indices.slice(0, split), right: indices.slice(split), height: bestHeight};
}

// Match the widths of the final layout. A tall scratch page lets pdfmake measure
// wrapped text, images, table padding and card spacing without an intervening break.
async function measureBlocks(definition: TDocumentDefinitions, blocks: Content[][]): Promise<number[]> {
  const positions = new Map<string, number>();
  const marker = (id: string): Content => ({id, text: '.', fontSize: 1});
  await pdfMake.createPdf({
    ...definition,
    pageSize: {width: a4.width, height: 6000},
    content: blocks.flatMap((block, index) => [
      marker(`start-${index}`), ...block, marker(`end-${index}`),
    ]),
    pageBreakBefore: node => {
      if (node.id) positions.set(node.id, node.startPosition.top);
      return false;
    },
  }).getBlob();
  return blocks.map((_, index) => {
    const start = positions.get(`start-${index}`);
    const end = positions.get(`end-${index}`);
    if (start === undefined || end === undefined || end <= start) throw new Error('Unable to measure the cheat sheet layout.');
    return end - start;
  });
}

export async function makeCheatSheetPdf(data: CheatSheetData): Promise<Blob> {
  const headingUrl = new URL(nunitoHeading, document.baseURI).href;
  const bodyUrl = new URL(nunitoBody, document.baseURI).href;
  pdfMake.addFonts({Nunito: {normal: bodyUrl, bold: headingUrl}});
  const {sheet, extension, check} = data;
  const palette = palettes[data.id[0] as keyof typeof palettes] ?? palettes.A;
  const points: Point[] = data.groups.flatMap(group => group.points.map(point => ({...point, higher: group.higher})));
  const illustration = points.find(point => point.figure);
  const figure = illustration?.figure;
  const images = figure ? {[figure.src]: await getImage(figure.src)} : {};
  const example = illustration?.mistake ? illustration : points.find(point => point.mistake);
  const comparison = data.comparisons[0];

  function renderPoint(point: Point, figureHeight: number, compact: boolean): Content {
    const body: Content[] = [{text: pdfText(point.section.revisionSummary)}];
    if (figure && point === illustration) {
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
      margin: [0, 0, 0, 8],
      table: {widths: ['*'], body: [[{fillColor: palette.ink, stack: [
        {text: pdfText(`BioLab cheat sheet   ·   ${data.subtitle}`), fontSize: 8.8, bold: true, characterSpacing: .3, color: '#FFFFFF'},
        {text: pdfText(continued ? `${data.title} (continued)` : data.title),
          fontSize: continued ? 15 : 25, bold: true, color: '#FFFFFF', margin: [0, 4, 0, 0]},
      ]}]]},
      layout: {
        hLineWidth: () => 0, vLineWidth: () => 0,
        paddingLeft: () => 11, paddingRight: () => 11,
        paddingTop: () => 6, paddingBottom: () => 7,
      },
    };
  }

  function overview(compact: boolean): Content[] {
    if (!sheet) return [];
    const info: Content[] = [
      {columns: sheet.essentials.map(([label, value]) => panel(label, [{text: pdfText(value)}], palette, compact)), columnGap: 8},
    ];
    const tips: Content[] = [panel('Exam tip', [{text: pdfText(sheet.exam)}], examPalette, compact)];
    if (sheet.formula) tips.push(panel(sheet.formula[0], [{text: pdfText(sheet.formula[1])}], palette, compact));
    if (extension) tips.push(panel('HL · ' + extension[0], [{text: pdfText(extension[1])}], hlPalette, compact));
    info.push({columns: tips, columnGap: 8, margin: [0, 0, 0, 3]});
    return info;
  }

  function wrapUp(compact: boolean): Content[] {
    const content: Content[] = [];
    if (comparison) {
      const body: TableCell[][] = [
        comparison.headers.map(text => ({text: pdfText(text), bold: true, color: palette.ink, fillColor: palette.tint})),
        ...comparison.rows.map(row => row.map((text, col) => ({text: pdfText(text), bold: col === 0}))),
      ];
      const table: Content[] = [{table: {headerRows: 1, dontBreakRows: true, widths: comparison.headers.map(() => '*'), body},
        layout: 'lightHorizontalLines', fontSize: 8.4}];
      if (comparison.note) table.push({text: pdfText(comparison.note), style: 'credit'});
      content.push(panel(comparison.title, table, palette, compact));
    }
    if (check) {
      content.push(panel('Worked question', [
        {text: pdfText(check[0]), bold: true, margin: [0, 0, 0, 3]},
        {text: [{text: 'Answer: ', bold: true, color: examPalette.ink}, ...pdfText(check[1])]},
      ], examPalette, compact));
    }
    if (compact && content.length === 2 && comparison && comparison.headers.length <= 3) {
      return [{columns: [{width: '64%', stack: [content[0]]}, {width: '*', stack: [content[1]]}], columnGap: 8}];
    }
    return content;
  }

  async function plan(density: 'standard' | 'compact' | 'spacious') {
    const compact = density === 'compact';
    const fontSize = compact ? 8.8 : density === 'spacious' ? 11 : 9.5;
    const figureHeight = compact ? 72 : density === 'spacious' ? 120 : 92;
    const firstHeader = () => [title(false), ...overview(compact)];
    const secondHeader = () => [title(true)];
    const closing = () => wrapUp(compact);
    const card = (index: number) => renderPoint(points[index], figureHeight, compact);
    const indices = points.map((_, index) => index);

    const definition: TDocumentDefinitions = {
      info: {title: `BioLab Cheat Sheet · ${data.subtitle} · ${data.title}`, author: 'BioLab'},
      language: 'en',
      pageSize: a4,
      pageMargins,
      defaultStyle: {font: 'Nunito', fontSize, lineHeight: 1.03, color: textColor},
      styles: {credit: {fontSize: 7.2, color: subdued, margin: [0, 2, 0, 0]}},
      images,
      content: [],
    };

    const [intro, continuation, closingHeight, ...heights] = await measureBlocks(definition, [
      firstHeader(), secondHeader(), closing(),
      ...indices.map(index => [{columns: [{width: columnWidth, stack: [card(index)]}]}]),
    ]);
    const pageFor = (selected: number[], titleHeight: number, ending = 0): PlannedPage => {
      const columns = balanceColumns(selected, heights);
      return {columns, remaining: availableHeight - columns.height - titleHeight - ending};
    };
    const first = pageFor(indices, intro, closingHeight);
    let pages: PlannedPage[] = first.remaining >= 0 ? [first] : [];
    if (!pages.length) {
      let leastUneven = Infinity;
      for (let split = 1; split < indices.length; split++) {
        const a = pageFor(indices.slice(0, split), intro);
        const b = pageFor(indices.slice(split), continuation, closingHeight);
        if (a.remaining < 0 || b.remaining < 0) continue;
        const uneven = Math.abs(a.remaining - b.remaining);
        if (uneven < leastUneven) {
          leastUneven = uneven;
          pages = [a, b];
        }
      }
    }

    async function render() {
      let pageCount = 0;
      const content: Content[] = pages.flatMap(({columns}, index) => [
        ...(index ? [{stack: secondHeader(), pageBreak: 'before' as const}] : firstHeader()),
        {columns: [columns.left, columns.right].map(group => ({width: columnWidth, stack: group.map(card)})), columnGap},
        ...(index === pages.length - 1 ? closing() : []),
      ]);
      const blob = await pdfMake.createPdf({
        ...definition, content,
        footer: (page, count) => {
          pageCount = count;
          return {columns: [{text: `BioLab · ${data.id} Cheat Sheet`}, {text: `${page} / ${count}`, alignment: 'right'}],
            color: subdued, fontSize: 8, margin: [margin, 9, margin, 0]};
        },
      }).getBlob();
      if (pageCount === pages.length) return blob;
    }
    return {pageCount: pages.length, freeSpace: pages[0]?.remaining ?? 0, render};
  }

  const standard = await plan('standard');
  if (standard.pageCount === 1) {
    if (standard.freeSpace > 230) {
      const spacious = await plan('spacious');
      const blob = spacious.pageCount === 1 ? await spacious.render() : undefined;
      if (blob) return blob;
    }
    const blob = await standard.render();
    if (blob) return blob;
  }

  const compact = await plan('compact');
  const options = [standard, compact].filter(layout => layout.pageCount === 2 || (layout === compact && layout.pageCount === 1))
    .sort((a, b) => a.pageCount - b.pageCount);
  for (const layout of options) {
    const blob = await layout.render();
    if (blob) return blob;
  }
  throw new Error('The cheat sheet exceeded the two-page PDF layout.');
}
