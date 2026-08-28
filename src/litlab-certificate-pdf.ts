export type CertificatePdfData={
  certificateCode:string;
  contributorName:string;
  contributorRole:string;
  contributionTitle:string;
  contributionType:string;
  contributionDescription:string;
  completedAt:string;
  issuedAt:string;
  verifiedMinutes?:number|null;
  issuerName:string;
  issuerTitle:string;
  preview?:boolean;
};

type CanvasPage={canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;pointWidth:number;pointHeight:number};

const LANDSCAPE={pxWidth:1754,pxHeight:1240,pointWidth:841.89,pointHeight:595.28};
const INK='#172033';
const MUTED='#667085';
const PURPLE='#6f55e8';
const PURPLE_DARK='#4d3fb5';
const PALE='#f7f5ff';
const LINE='#ded9f8';
const GOLD='#b28a39';

function font(ctx:CanvasRenderingContext2D,size:number,weight=500,family='Inter, Arial, sans-serif'){ctx.font=`${weight} ${size}px ${family}`}
function rr(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){const radius=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);ctx.closePath()}
function wrap(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){
  const clean=String(text??'').replace(/\s+/g,' ').trim();if(!clean)return [''];
  const words=clean.split(' '),lines:string[]=[];let line='';
  for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width<=maxWidth){line=test;continue}if(line)lines.push(line);line=word}
  if(line)lines.push(line);return lines;
}
function dateLabel(value?:string|null){if(!value)return 'Not recorded';const d=new Date(value);return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString([],{month:'long',day:'numeric',year:'numeric'})}
function duration(minutes?:number|null){if(minutes==null)return '';const h=minutes/60;return Number.isInteger(h)?`${h} hour${h===1?'':'s'}`:`${h.toFixed(1)} hours`}
function safeFilePart(value:string,fallback='LitLab',max=72){const normalized=String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'');const cleaned=normalized.replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').replace(/_+/g,'_');return (cleaned||fallback).slice(0,max).replace(/_+$/,'')||fallback}
function makeCanvas():CanvasPage{const canvas=document.createElement('canvas');canvas.width=LANDSCAPE.pxWidth;canvas.height=LANDSCAPE.pxHeight;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Certificate canvas is unavailable in this browser.');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);return {canvas,ctx,pointWidth:LANDSCAPE.pointWidth,pointHeight:LANDSCAPE.pointHeight}}

async function loadLogo(){
  const src=new URL('./litlab-logo.svg',document.baseURI).href;
  return await new Promise<HTMLImageElement|null>(resolve=>{const image=new Image();const timer=window.setTimeout(()=>resolve(null),3500);image.onload=()=>{window.clearTimeout(timer);resolve(image)};image.onerror=()=>{window.clearTimeout(timer);resolve(null)};image.src=src});
}

function drawLogoFallback(ctx:CanvasRenderingContext2D,cx:number,y:number){
  ctx.textAlign='center';font(ctx,36,900);ctx.fillStyle=INK;ctx.fillText('LitLab',cx,y+35);font(ctx,11,800);ctx.fillStyle=PURPLE;ctx.fillText('EXPLORE • ANALYZE • UNDERSTAND',cx,y+58);
}

function drawSeal(ctx:CanvasRenderingContext2D,x:number,y:number,code:string){
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=PURPLE;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,72,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,59,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=PURPLE;ctx.beginPath();ctx.arc(0,0,47,0,Math.PI*2);ctx.fill();ctx.textAlign='center';font(ctx,20,900);ctx.fillStyle='#fff';ctx.fillText('LL',0,7);font(ctx,9,900);ctx.fillStyle=PURPLE_DARK;ctx.fillText('LITLAB',0,-88);font(ctx,8,800);ctx.fillStyle=MUTED;ctx.fillText(code.slice(0,18),0,92);ctx.restore();
}

function drawSignature(ctx:CanvasRenderingContext2D,x:number,y:number,data:CertificatePdfData){
  ctx.textAlign='center';ctx.fillStyle=INK;ctx.font='italic 48px "Segoe Script", "Brush Script MT", cursive';ctx.fillText('LitLab',x,y);
  ctx.strokeStyle='#a9a3c9';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-155,y+18);ctx.lineTo(x+155,y+18);ctx.stroke();
  font(ctx,13,800);ctx.fillStyle=INK;ctx.fillText(data.issuerName||'LitLab',x,y+47);font(ctx,10,650);ctx.fillStyle=MUTED;ctx.fillText(data.issuerTitle||'LitLab Contributor Program',x,y+67);font(ctx,9,800);ctx.fillStyle=PURPLE;ctx.fillText('AUTHORIZED LITLAB SIGNATURE',x,y+87);
}

async function jpegBytes(canvas:HTMLCanvasElement){const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Could not create certificate image.')),'image/jpeg',0.96));return new Uint8Array(await blob.arrayBuffer())}
function enc(text:string){return new TextEncoder().encode(text)}
function concat(parts:Uint8Array[]){const length=parts.reduce((sum,p)=>sum+p.length,0),out=new Uint8Array(length);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length}return out}
async function imagePdf(page:CanvasPage){
  const jpg=await jpegBytes(page.canvas);const draw=`q\n${page.pointWidth} 0 0 ${page.pointHeight} 0 0 cm\n/Im0 Do\nQ\n`,drawBytes=enc(draw);
  const objects:Uint8Array[][]=[[],[enc('<< /Type /Catalog /Pages 2 0 R >>')],[enc('<< /Type /Pages /Count 1 /Kids [3 0 R] >>')],[enc(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pointWidth} ${page.pointHeight}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`)],[enc(`<< /Length ${drawBytes.length} >>\nstream\n`),drawBytes,enc('endstream')],[enc(`<< /Type /XObject /Subtype /Image /Width ${page.canvas.width} /Height ${page.canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),jpg,enc('\nendstream')]];
  const chunks:Uint8Array[]=[enc('%PDF-1.4\n% LitLab Certificate\n')],offsets:number[]=[0];let byteOffset=chunks[0].length;
  for(let i=1;i<=5;i++){offsets[i]=byteOffset;const obj=concat([enc(`${i} 0 obj\n`),concat(objects[i]),enc('\nendobj\n')]);chunks.push(obj);byteOffset+=obj.length}
  const xrefOffset=byteOffset;let xref='xref\n0 6\n0000000000 65535 f \n';for(let i=1;i<=5;i++)xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;xref+=`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;chunks.push(enc(xref));return concat(chunks);
}
function download(bytes:Uint8Array,filename:string){const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30_000)}

export async function saveCertificatePdf(data:CertificatePdfData){
  const page=makeCanvas(),{ctx}=page,W=LANDSCAPE.pxWidth,H=LANDSCAPE.pxHeight;
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  const gradient=ctx.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#fbfaff');gradient.addColorStop(.52,'#ffffff');gradient.addColorStop(1,'#f6f3ff');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(111,85,232,.035)';ctx.beginPath();ctx.arc(130,110,260,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(W-90,H-60,330,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=PURPLE;ctx.lineWidth=8;rr(ctx,38,38,W-76,H-76,24);ctx.stroke();ctx.strokeStyle='#d9d2ff';ctx.lineWidth=2;rr(ctx,59,59,W-118,H-118,18);ctx.stroke();
  ctx.fillStyle=PURPLE;rr(ctx,78,76,14,H-152,7);ctx.fill();

  const logo=await loadLogo();ctx.textAlign='center';
  if(logo){const logoW=382,logoH=100;ctx.drawImage(logo,W/2-logoW/2,84,logoW,logoH)}else drawLogoFallback(ctx,W/2,90);
  font(ctx,12,900);ctx.fillStyle=PURPLE;ctx.fillText('OFFICIAL LITLAB CONTRIBUTOR PROGRAM',W/2,205);
  font(ctx,35,900,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;ctx.fillText('Certificate of Contribution',W/2,259);
  ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2-205,286);ctx.lineTo(W/2+205,286);ctx.stroke();

  font(ctx,16,600);ctx.fillStyle=MUTED;ctx.fillText('This certificate is proudly presented to',W/2,338);
  font(ctx,64,900,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;const nameLines=wrap(ctx,data.contributorName,W-470).slice(0,2);nameLines.forEach((line,i)=>ctx.fillText(line,W/2,418+i*68));let y=418+Math.max(1,nameLines.length)*68;
  font(ctx,14,900);ctx.fillStyle=PURPLE;ctx.fillText(data.contributorRole.toUpperCase(),W/2,y+4);y+=54;
  font(ctx,17,600);ctx.fillStyle=MUTED;ctx.fillText('in recognition of the successful completion of',W/2,y);y+=46;
  font(ctx,30,850);ctx.fillStyle=INK;const titleLines=wrap(ctx,data.contributionTitle,W-500).slice(0,2);titleLines.forEach((line,i)=>ctx.fillText(line,W/2,y+i*38));y+=titleLines.length*38+24;
  font(ctx,14,550);ctx.fillStyle=MUTED;const desc=wrap(ctx,data.contributionDescription,W-590).slice(0,4);desc.forEach((line,i)=>ctx.fillText(line,W/2,y+i*23));y+=desc.length*23+34;

  ctx.fillStyle=PALE;rr(ctx,W/2-430,y-20,860,76,20);ctx.fill();font(ctx,12,800);ctx.fillStyle=INK;const facts=[`Completed ${dateLabel(data.completedAt)}`,`Issued ${dateLabel(data.issuedAt)}`];if(data.verifiedMinutes!=null)facts.push(`Verified time ${duration(data.verifiedMinutes)}`);ctx.fillText(facts.join('   •   '),W/2,y+14);font(ctx,10,650);ctx.fillStyle=MUTED;ctx.fillText(data.contributionType.toUpperCase(),W/2,y+39);y+=118;

  drawSignature(ctx,W/2-320,y+48,data);drawSeal(ctx,W/2+338,y+20,data.certificateCode);
  ctx.textAlign='center';font(ctx,11,850);ctx.fillStyle=INK;ctx.fillText(data.certificateCode,W/2+338,y+124);font(ctx,9,700);ctx.fillStyle=MUTED;ctx.fillText('CERTIFICATE ID',W/2+338,y+143);

  ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(150,H-132);ctx.lineTo(W-150,H-132);ctx.stroke();font(ctx,9,650);ctx.fillStyle=MUTED;ctx.textAlign='left';ctx.fillText('Issued by LitLab • Verify using the certificate ID shown above.',150,H-99);ctx.textAlign='right';ctx.fillText('LitLab Contributor Certificate • Not an IB certificate • Does not itself approve CAS.',W-150,H-99);
  if(data.preview){ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-0.34);ctx.textAlign='center';font(ctx,92,900);ctx.fillStyle='rgba(111,85,232,.11)';ctx.fillText('PREVIEW — NOT ISSUED',0,0);ctx.restore()}
  ctx.textAlign='left';const bytes=await imagePdf(page),filename=`LitLab_Contributor_Certificate_${safeFilePart(data.contributorName,'Contributor')}_${safeFilePart(data.certificateCode,'Certificate',38)}.pdf`;download(bytes,filename);
}
