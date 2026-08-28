export {saveCertificatePdf} from './litlab-certificate-pdf';
export type {CertificatePdfData} from './litlab-certificate-pdf';

export type EvidenceRow={label:string;value:string};
export type EvidenceSection={title:string;subtitle?:string;rows?:EvidenceRow[];paragraphs?:string[];items?:string[]};
export type EvidencePdfData={
  contributorName:string;
  contributionTitle:string;
  contributionType:string;
  submittedAt?:string|null;
  completedAt?:string|null;
  wordVersions:number;
  selfRecordedMinutes:number;
  sections:EvidenceSection[];
  studentCas:boolean;
};

type CanvasPage={canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;pointWidth:number;pointHeight:number;bodyMarks:number};

const PORTRAIT={pxWidth:1240,pxHeight:1754,pointWidth:595.28,pointHeight:841.89};
const INK='#172033';
const MUTED='#657083';
const PURPLE='#6f55e8';
const PALE='#f6f4ff';
const LINE='#e2e6ef';
const GREEN='#258653';

export function safeFilePart(value:string,fallback='LitLab',max=72){
  const normalized=String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
  const cleaned=normalized.replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').replace(/_+/g,'_');
  return (cleaned||fallback).slice(0,max).replace(/_+$/,'')||fallback;
}
function dateLabel(value?:string|null){if(!value)return 'Not recorded';const d=new Date(value);return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString([],{month:'long',day:'numeric',year:'numeric'})}
function duration(minutes?:number|null){if(minutes==null)return '';const h=minutes/60;return Number.isInteger(h)?`${h} hour${h===1?'':'s'}`:`${h.toFixed(1)} hours`}
function makeCanvas():CanvasPage{const canvas=document.createElement('canvas');canvas.width=PORTRAIT.pxWidth;canvas.height=PORTRAIT.pxHeight;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('PDF canvas is unavailable in this browser.');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);return {canvas,ctx,pointWidth:PORTRAIT.pointWidth,pointHeight:PORTRAIT.pointHeight,bodyMarks:0}}
function rr(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){const radius=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);ctx.closePath()}
function font(ctx:CanvasRenderingContext2D,size:number,weight=500,family='Inter, Arial, sans-serif'){ctx.font=`${weight} ${size}px ${family}`}
function wrap(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){
  const clean=String(text??'').replace(/\s+/g,' ').trim();if(!clean)return [];
  const words=clean.split(' '),lines:string[]=[];let line='';
  for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width<=maxWidth){line=test;continue}if(line)lines.push(line);if(ctx.measureText(word).width<=maxWidth){line=word;continue}let chunk='';for(const char of Array.from(word)){const t=chunk+char;if(ctx.measureText(t).width>maxWidth&&chunk){lines.push(chunk);chunk=char}else chunk=t}line=chunk}
  if(line)lines.push(line);return lines;
}

class EvidenceRenderer{
  pages:CanvasPage[]=[];
  page!:CanvasPage;
  y=0;
  readonly margin=78;
  readonly contentWidth=PORTRAIT.pxWidth-156;
  readonly bodyTop=172;
  readonly bottom=PORTRAIT.pxHeight-112;
  constructor(private data:EvidencePdfData){this.newPage(true)}
  private markBody(){this.page.bodyMarks+=1}
  private newPage(first=false){
    if(!first&&this.page&&this.page.bodyMarks===0){this.y=this.bodyTop;return}
    this.page=makeCanvas();this.pages.push(this.page);const {ctx}=this.page;
    ctx.fillStyle=PURPLE;rr(ctx,64,58,58,58,15);ctx.fill();font(ctx,21,900);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('LL',93,96);ctx.textAlign='left';
    font(ctx,24,900);ctx.fillStyle=INK;ctx.fillText('LitLab',138,84);font(ctx,13,800);ctx.fillStyle=PURPLE;ctx.fillText(this.data.studentCas?'CAS / CONTRIBUTION EVIDENCE':'CONTRIBUTION EVIDENCE',138,108);
    ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(64,132);ctx.lineTo(PORTRAIT.pxWidth-64,132);ctx.stroke();this.y=this.bodyTop;if(first)this.coverIntro();
  }
  private coverIntro(){
    const {ctx}=this.page;font(ctx,44,900);ctx.fillStyle=INK;const title=wrap(ctx,this.data.contributionTitle,this.contentWidth).slice(0,4);(title.length?title:['Contribution record']).forEach((line,i)=>ctx.fillText(line,this.margin,this.y+i*51));this.y+=Math.max(1,title.length)*51+18;
    font(ctx,18,650);ctx.fillStyle=MUTED;ctx.fillText(this.data.contributorName||'LitLab Contributor',this.margin,this.y);this.y+=34;font(ctx,13,700);ctx.fillStyle=PURPLE;ctx.fillText((this.data.contributionType||'Contribution').toUpperCase(),this.margin,this.y);this.y+=38;
    const cards=[['Submitted',dateLabel(this.data.submittedAt)],['Completed',dateLabel(this.data.completedAt)],['Word versions',String(this.data.wordVersions)],['Activity record',this.data.selfRecordedMinutes?duration(this.data.selfRecordedMinutes):'None added']];const gap=12,w=(this.contentWidth-gap)/2,h=104;
    cards.forEach(([a,b],i)=>{const x=this.margin+(i%2)*(w+gap),y=this.y+Math.floor(i/2)*(h+gap);ctx.fillStyle='#fafbfe';ctx.strokeStyle=LINE;ctx.lineWidth=2;rr(ctx,x,y,w,h,16);ctx.fill();ctx.stroke();font(ctx,11,800);ctx.fillStyle=MUTED;ctx.fillText(a.toUpperCase(),x+18,y+30);font(ctx,18,850);ctx.fillStyle=INK;ctx.fillText(b,x+18,y+63)});this.y+=2*(h+gap)+24;
    ctx.fillStyle=PALE;rr(ctx,this.margin,this.y,this.contentWidth,102,16);ctx.fill();font(ctx,13,650);ctx.fillStyle=MUTED;const note=this.data.studentCas?'This PDF organizes evidence already saved in your LitLab contributor record. It can support your own CAS documentation, but LitLab does not approve CAS and your school decides what evidence it accepts.':'This PDF organizes evidence already saved in your LitLab contributor record. It confirms the contribution record but is not an IB certificate.';wrap(ctx,note,this.contentWidth-40).slice(0,4).forEach((line,i)=>ctx.fillText(line,this.margin+20,this.y+30+i*22));this.y+=130;this.markBody();
  }
  private ensure(height:number){if(this.y+height>this.bottom)this.newPage(false)}
  private firstBlockHeight(section:EvidenceSection){
    if(section.rows?.length)return 70;
    if(section.paragraphs?.some(text=>String(text||'').trim()))return 58;
    if(section.items?.some(text=>String(text||'').trim()))return 58;
    return 28;
  }
  section(section:EvidenceSection){
    const title=String(section.title||'Evidence').trim()||'Evidence';
    let ctx=this.page.ctx;font(ctx,23,850);const subtitleLines=section.subtitle?wrap(ctx,section.subtitle,this.contentWidth).slice(0,5):[];
    const subtitleHeight=subtitleLines.length?subtitleLines.length*30+12:0;
    this.ensure(25+subtitleHeight+18+this.firstBlockHeight(section));
    ctx=this.page.ctx;font(ctx,12,900);ctx.fillStyle=PURPLE;ctx.fillText(title.toUpperCase(),this.margin,this.y);this.y+=25;this.markBody();
    if(subtitleLines.length){font(ctx,23,850);ctx.fillStyle=INK;subtitleLines.forEach((line,i)=>ctx.fillText(line,this.margin,this.y+i*30));this.y+=subtitleHeight;this.markBody()}
    ctx=this.page.ctx;ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(this.margin,this.y);ctx.lineTo(this.margin+this.contentWidth,this.y);ctx.stroke();this.y+=18;
    for(const row of section.rows||[])this.row(row);for(const paragraph of section.paragraphs||[])this.paragraph(paragraph);for(const item of section.items||[])this.item(item);this.y+=22;
  }
  private row(row:EvidenceRow){
    let ctx=this.page.ctx;font(ctx,14,550);let remaining=wrap(ctx,row.value,this.contentWidth-282);if(!remaining.length)remaining=['Not recorded'];let first=true;
    while(remaining.length){this.ensure(70);ctx=this.page.ctx;font(ctx,14,550);const available=Math.max(1,Math.floor((this.bottom-this.y-24)/23)),chunk=remaining.splice(0,available),height=Math.max(48,chunk.length*23+22);font(ctx,11,850);ctx.fillStyle=MUTED;ctx.fillText(`${String(row.label||'Detail').toUpperCase()}${first?'':' (CONTINUED)'}`,this.margin,this.y+19);font(ctx,14,550);ctx.fillStyle=INK;chunk.forEach((line,i)=>ctx.fillText(line,this.margin+282,this.y+19+i*23));ctx.strokeStyle='#edf0f5';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(this.margin,this.y+height);ctx.lineTo(this.margin+this.contentWidth,this.y+height);ctx.stroke();this.y+=height+6;this.markBody();first=false;if(remaining.length)this.newPage(false)}
  }
  private paragraph(text:string){
    const clean=String(text||'').trim();if(!clean)return;
    let ctx=this.page.ctx;font(ctx,14,550);let remaining=wrap(ctx,clean,this.contentWidth);
    while(remaining.length){this.ensure(46);ctx=this.page.ctx;font(ctx,14,550);const available=Math.max(1,Math.floor((this.bottom-this.y-10)/24)),chunk=remaining.splice(0,available);ctx.fillStyle=MUTED;chunk.forEach((line,i)=>ctx.fillText(line,this.margin,this.y+i*24));this.y+=chunk.length*24+12;this.markBody();if(remaining.length)this.newPage(false)}
  }
  private item(text:string){
    const clean=String(text||'').trim();if(!clean)return;
    let ctx=this.page.ctx;font(ctx,14,600);let remaining=wrap(ctx,clean,this.contentWidth-36),first=true;
    while(remaining.length){this.ensure(48);ctx=this.page.ctx;font(ctx,14,600);const available=Math.max(1,Math.floor((this.bottom-this.y-12)/23)),chunk=remaining.splice(0,available);if(first){ctx.fillStyle=GREEN;ctx.beginPath();ctx.arc(this.margin+7,this.y+8,5,0,Math.PI*2);ctx.fill()}ctx.fillStyle=INK;chunk.forEach((line,i)=>ctx.fillText(line,this.margin+27,this.y+12+i*23));this.y+=chunk.length*23+13;this.markBody();first=false;if(remaining.length)this.newPage(false)}
  }
  finish(){
    const pages=this.pages.filter((page,index)=>index===0||page.bodyMarks>0);
    pages.forEach((p,index)=>{const {ctx}=p;ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(64,PORTRAIT.pxHeight-78);ctx.lineTo(PORTRAIT.pxWidth-64,PORTRAIT.pxHeight-78);ctx.stroke();font(ctx,10,650);ctx.fillStyle=MUTED;ctx.fillText('LitLab contributor record',64,PORTRAIT.pxHeight-48);ctx.textAlign='right';ctx.fillText(`Page ${index+1} of ${pages.length}`,PORTRAIT.pxWidth-64,PORTRAIT.pxHeight-48);ctx.textAlign='left'});return pages;
  }
}

async function jpegBytes(canvas:HTMLCanvasElement){const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Could not create PDF page image.')),'image/jpeg',0.94));return new Uint8Array(await blob.arrayBuffer())}
function enc(text:string){return new TextEncoder().encode(text)}
function concat(parts:Uint8Array[]){const length=parts.reduce((sum,p)=>sum+p.length,0),out=new Uint8Array(length);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length}return out}
async function imagePdf(pages:CanvasPage[]){
  const jpegs=await Promise.all(pages.map(page=>jpegBytes(page.canvas)));const objectCount=2+pages.length*3,objects:Uint8Array[][]=Array.from({length:objectCount+1},()=>[]);objects[1]=[enc('<< /Type /Catalog /Pages 2 0 R >>')];const kids=pages.map((_,i)=>`${3+i*3} 0 R`).join(' ');objects[2]=[enc(`<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`)];
  pages.forEach((page,i)=>{const pageNo=3+i*3,contentNo=pageNo+1,imageNo=pageNo+2,draw=`q\n${page.pointWidth} 0 0 ${page.pointHeight} 0 0 cm\n/Im0 Do\nQ\n`,drawBytes=enc(draw);objects[pageNo]=[enc(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pointWidth} ${page.pointHeight}] /Resources << /XObject << /Im0 ${imageNo} 0 R >> >> /Contents ${contentNo} 0 R >>`)];objects[contentNo]=[enc(`<< /Length ${drawBytes.length} >>\nstream\n`),drawBytes,enc('endstream')];const jpg=jpegs[i];objects[imageNo]=[enc(`<< /Type /XObject /Subtype /Image /Width ${page.canvas.width} /Height ${page.canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),jpg,enc('\nendstream')]});
  const chunks:Uint8Array[]=[enc('%PDF-1.4\n% LitLab PDF\n')],offsets:number[]=[0];let byteOffset=chunks[0].length;for(let i=1;i<=objectCount;i++){offsets[i]=byteOffset;const obj=concat([enc(`${i} 0 obj\n`),concat(objects[i]),enc('\nendobj\n')]);chunks.push(obj);byteOffset+=obj.length}const xrefOffset=byteOffset;let xref=`xref\n0 ${objectCount+1}\n0000000000 65535 f \n`;for(let i=1;i<=objectCount;i++)xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;xref+=`trailer\n<< /Size ${objectCount+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;chunks.push(enc(xref));return concat(chunks);
}
function downloadBytes(bytes:Uint8Array,filename:string){const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30_000)}

export async function saveEvidencePdf(data:EvidencePdfData){const renderer=new EvidenceRenderer(data);for(const section of data.sections)renderer.section(section);const pages=renderer.finish();if(!pages.length)throw new Error('No evidence pages were generated.');const bytes=await imagePdf(pages),kind=data.studentCas?'CAS_Evidence':'Contribution_Evidence',filename=`LitLab_${kind}_${safeFilePart(data.contributorName,'Contributor')}_${safeFilePart(data.contributionTitle,'Contribution',54)}.pdf`;downloadBytes(bytes,filename)}
