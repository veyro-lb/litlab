import pdfMake from 'pdfmake/build/pdfmake';
import fonts from 'pdfmake/build/vfs_fonts';
import type {Content, ContentText, TableCell, TDocumentDefinitions} from 'pdfmake/interfaces';
import {getFigureCredit} from './source-policy';
import type {CheatSheetData} from './cheat-sheet-data';

pdfMake.addVirtualFileSystem(fonts);

const green = '#176B59';
const muted = '#475569';

// The bundled font lacks these symbols. Keep arrows legible and allele letters raised.
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

export async function makeCheatSheetPdf(data: CheatSheetData): Promise<Blob> {
  const {sheet, extension, check} = data;
  const selected = data.groups.flatMap(group => group.points.flatMap(point => point.figure ? [point.figure] : []));
  const images = Object.fromEntries(await Promise.all(
    [...new Set(selected.map(figure => figure.src))].map(async path => [path, await getImage(path)] as const),
  ));

  const heading = (text: string): Content => ({text, style: 'section', headlineLevel: 1});
  const pair = (label: string, value: string): Content => ({
    text: [{text: pdfText(label + '  '), bold: true, color: green}, ...pdfText(value)],
    margin: [0, 0, 0, 6],
  });

  const content: Content[] = [
    {text: data.subtitle, color: green, bold: true},
    {text: data.title, style: 'title'},
  ];

  if (sheet) {
    content.push(heading('At a glance'), ...sheet.essentials.map(([label, value]) => pair(label, value)));
    if (extension) content.push(pair('HL · ' + extension[0], extension[1]));
    if (sheet.formula) content.push(pair(sheet.formula[0], sheet.formula[1]));
    content.push(pair('Exam tip', sheet.exam));
  }

  if (data.comparisons.length) content.push(heading('Compare'));
  for (const visual of data.comparisons) {
    const body: TableCell[][] = [
      visual.headers.map(text => ({text: pdfText(text), bold: true, fillColor: '#E7F3EE'})),
      ...visual.rows.map(row => row.map((text, index) => ({text: pdfText(text), bold: index === 0}))),
    ];
    content.push(
      {text: pdfText(visual.title), style: 'point', headlineLevel: 2},
      {table: {headerRows: 1, keepWithHeaderRows: 1, dontBreakRows: true, widths: visual.headers.map(() => '*'), body},
        layout: 'lightHorizontalLines', fontSize: 9.3, margin: [0, 0, 0, 6]},
    );
    if (visual.note) content.push({text: pdfText(visual.note), style: 'small'});
  }

  for (const group of data.groups) {
    content.push(heading(group.label));
    for (const {id, heading: name, section, figure, mistake} of group.points) {
      const stack: Content[] = [
        {text: pdfText(`${id}  ${name}`), style: 'point'},
        {text: pdfText(section.revisionSummary), margin: [0, 0, 0, 6]},
      ];
      if (figure) {
        const credit = getFigureCredit(figure, data.references);
        stack.push(
          {image: figure.src, fit: [450, 135], alignment: 'center', margin: [0, 2, 0, 5]},
          {text: pdfText(figure.captionTitle), bold: true, fontSize: 9, margin: [0, 0, 0, 2]},
          {text: pdfText(figure.alt), style: 'small'},
          {text: `Source: ${credit.attribution}${figure.license ? ` · ${figure.license}` : ''}`,
            style: 'small', ...(credit.sourceUrl ? {link: credit.sourceUrl} : {})},
          ...credit.dataSources.map(reference => ({text: reference.title, style: 'small', link: reference.url})),
        );
      }
      if (mistake) stack.push(pair('Common mistake', mistake.misconception), pair('Correction', mistake.correction));
      content.push({stack, unbreakable: true, margin: [0, 0, 0, 6]});
    }
  }

  if (check) {
    content.push(heading('Worked question'), {text: pdfText(check[0]), bold: true, margin: [0, 0, 0, 6]}, pair('Answer', check[1]));
  }

  const definition: TDocumentDefinitions = {
    info: {title: `BioLab Cheat Sheet · ${data.subtitle} · ${data.title}`, author: 'BioLab'},
    language: 'en',
    pageSize: 'A4',
    pageMargins: [40, 42, 40, 49],
    defaultStyle: {fontSize: 10.5, lineHeight: 1.14, color: '#1F2937'},
    styles: {
      title: {fontSize: 27, bold: true, color: '#102E29', margin: [0, 5, 0, 9]},
      section: {fontSize: 15, bold: true, color: green, margin: [0, 11, 0, 6]},
      point: {fontSize: 11.5, bold: true, color: '#102E29', margin: [0, 4, 0, 4]},
      small: {fontSize: 8, color: muted, margin: [0, 0, 0, 6]},
    },
    pageBreakBefore: (current, following) =>
      Boolean(current.headlineLevel) && following.getFollowingNodesOnPage().length === 0,
    footer: (page, pages) => ({
      columns: [{text: `BioLab · ${data.id} Cheat Sheet`}, {text: `${page} / ${pages}`, alignment: 'right'}],
      color: muted, fontSize: 8.5, margin: [40, 12, 40, 0],
    }),
    images,
    content,
  };
  return pdfMake.createPdf(definition).getBlob();
}
