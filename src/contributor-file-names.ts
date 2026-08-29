const DOCX_EXTENSION='.docx';
const MAX_DOCUMENT_NAME_LENGTH=240;
const MAX_STEM_LENGTH=MAX_DOCUMENT_NAME_LENGTH-DOCX_EXTENSION.length;

function trimToCharacters(value:string,max:number){
  return Array.from(value).slice(0,max).join('');
}

export function normalizeDocxFileName(value:string){
  let name=String(value||'').normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g,'')
    .replace(/[<>:"/\\|?*]+/g,'-')
    .replace(/\s+/g,' ')
    .trim();

  let stem=name.toLowerCase().endsWith(DOCX_EXTENSION)?name.slice(0,-DOCX_EXTENSION.length):name;
  stem=stem.replace(/[. ]+$/g,'').trim();
  stem=trimToCharacters(stem,MAX_STEM_LENGTH).replace(/[. ]+$/g,'').trim();
  if(!stem)stem='LitLab-contribution';
  return `${stem}${DOCX_EXTENSION}`;
}

export function encodeStoragePath(path:string){
  return String(path||'').split('/').map(segment=>encodeURIComponent(segment)).join('/');
}

export function signedDocumentUrl(baseUrl:string,signedPath:string,fileName:string){
  const full=`${baseUrl}/storage/v1${signedPath}`;
  const separator=full.includes('?')?'&':'?';
  return `${full}${separator}download=${encodeURIComponent(normalizeDocxFileName(fileName))}`;
}

export {};
