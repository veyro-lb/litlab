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

async function loadAsset(path:string){
  const src=new URL(path,document.baseURI).href;
  return await new Promise<HTMLImageElement|null>(resolve=>{const image=new Image();const timer=window.setTimeout(()=>resolve(null),3500);image.onload=()=>{window.clearTimeout(timer);resolve(image)};image.onerror=()=>{window.clearTimeout(timer);resolve(null)};image.src=src});
}

function drawLogoFallback(ctx:CanvasRenderingContext2D,cx:number,y:number){
  ctx.textAlign='center';font(ctx,40,900);ctx.fillStyle=INK;ctx.fillText('LitLab',cx,y+38);font(ctx,13,800);ctx.fillStyle=PURPLE;ctx.fillText('EXPLORE • ANALYZE • UNDERSTAND',cx,y+64);
}

function drawIconFallback(ctx:CanvasRenderingContext2D,size:number){
  const s=size;ctx.fillStyle='#fff';ctx.strokeStyle=LINE;ctx.lineWidth=3;rr(ctx,-s/2,-s/2,s,s,s*.22);ctx.fill();ctx.stroke();
  ctx.fillStyle=PURPLE;ctx.beginPath();ctx.arc(0,0,s*.22,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,s*.05);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-s*.09,0);ctx.lineTo(-s*.025,s*.07);ctx.lineTo(s*.11,-s*.09);ctx.stroke();ctx.lineCap='butt';
}

function drawSeal(ctx:CanvasRenderingContext2D,x:number,y:number,code:string,icon:HTMLImageElement|null){
  ctx.save();ctx.translate(x,y);
  ctx.strokeStyle=PURPLE;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,78,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,64,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,53,0,Math.PI*2);ctx.fill();
  if(icon){const s=78;ctx.save();ctx.beginPath();ctx.arc(0,0,42,0,Math.PI*2);ctx.clip();ctx.drawImage(icon,-s/2,-s/2,s,s);ctx.restore()}else drawIconFallback(ctx,78);
  ctx.textAlign='center';font(ctx,10,900);ctx.fillStyle=PURPLE_DARK;ctx.fillText('LITLAB',0,-96);font(ctx,9,800);ctx.fillStyle=MUTED;ctx.fillText('OFFICIAL CONTRIBUTOR',0,102);font(ctx,8,800);ctx.fillStyle=MUTED;ctx.fillText(code.slice(0,19),0,118);ctx.restore();
}

function drawSignature(ctx:CanvasRenderingContext2D,x:number,y:number,data:CertificatePdfData,signature:HTMLImageElement|null){
  ctx.save();ctx.textAlign='center';
  font(ctx,11,900);ctx.fillStyle=PURPLE;ctx.fillText('AUTHORIZED BY LITLAB',x,y-88);

  if(signature){
    const signatureWidth=420;
    const signatureHeight=signatureWidth*(150/513);
    ctx.drawImage(signature,x-signatureWidth/2,y-68,signatureWidth,signatureHeight);
  }else{
    ctx.fillStyle='#151b2d';
    ctx.font='italic 68px "Snell Roundhand", "Apple Chancery", "URW Chancery L", "Segoe Script", "Brush Script MT", cursive';
    ctx.fillText('LitLab',x,y+18);
  }

  ctx.strokeStyle='#a9a3c9';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-190,y+59);ctx.lineTo(x+190,y+59);ctx.stroke();
  font(ctx,16,850);ctx.fillStyle=INK;ctx.fillText(data.issuerName||'LitLab',x,y+88);
  font(ctx,13,650);ctx.fillStyle=MUTED;ctx.fillText(data.issuerTitle||'LitLab Contributor Program',x,y+112);
  font(ctx,10,800);ctx.fillStyle=PURPLE;ctx.fillText('DIGITALLY ISSUED • CERTIFICATE ID VERIFIABLE',x,y+133);
  ctx.restore();
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

  const [logo,icon,signature]=await Promise.all([loadAsset('./litlab-logo.svg'),loadAsset('./favicon.svg'),loadAsset('./litlab-signature.svg')]);ctx.textAlign='center';
  if(logo){const logoW=410,logoH=108;ctx.drawImage(logo,W/2-logoW/2,76,logoW,logoH)}else drawLogoFallback(ctx,W/2,82);
  font(ctx,15,900);ctx.fillStyle=PURPLE;ctx.fillText('OFFICIAL LITLAB CONTRIBUTOR PROGRAM',W/2,211);
  font(ctx,43,900,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;ctx.fillText('Certificate of Contribution',W/2,270);
  ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2-230,302);ctx.lineTo(W/2+230,302);ctx.stroke();

  font(ctx,20,600);ctx.fillStyle=MUTED;ctx.fillText('This certificate is proudly presented to',W/2,353);
  font(ctx,72,900,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;const nameLines=wrap(ctx,data.contributorName,W-440).slice(0,2);nameLines.forEach((line,i)=>ctx.fillText(line,W/2,439+i*75));let y=439+Math.max(1,nameLines.length)*75;
  font(ctx,17,900);ctx.fillStyle=PURPLE;ctx.fillText(data.contributorRole.toUpperCase(),W/2,y+2);y+=55;
  font(ctx,20,600);ctx.fillStyle=MUTED;ctx.fillText('in recognition of the successful completion of',W/2,y);y+=48;
  font(ctx,35,850);ctx.fillStyle=INK;const titleLines=wrap(ctx,data.contributionTitle,W-470).slice(0,2);titleLines.forEach((line,i)=>ctx.fillText(line,W/2,y+i*43));y+=Math.max(1,titleLines.length)*43+20;
  font(ctx,17,550);ctx.fillStyle=MUTED;const desc=wrap(ctx,data.contributionDescription,W-520).slice(0,4);desc.forEach((line,i)=>ctx.fillText(line,W/2,y+i*27));y+=Math.max(1,desc.length)*27+27;

  ctx.fillStyle=PALE;rr(ctx,W/2-455,y-16,910,86,20);ctx.fill();font(ctx,15,800);ctx.fillStyle=INK;const facts=[`Completed ${dateLabel(data.completedAt)}`,`Issued ${dateLabel(data.issuedAt)}`];if(data.verifiedMinutes!=null)facts.push(`Verified time ${duration(data.verifiedMinutes)}`);ctx.fillText(facts.join('   •   '),W/2,y+19);font(ctx,12,700);ctx.fillStyle=MUTED;ctx.fillText(data.contributionType.toUpperCase(),W/2,y+49);y+=124;

  const lowerY=Math.min(y+48,H-330);
  drawSignature(ctx,W/2-325,lowerY,data,signature);drawSeal(ctx,W/2+342,lowerY-18,data.certificateCode,icon);
  ctx.textAlign='center';font(ctx,14,850);ctx.fillStyle=INK;ctx.fillText(data.certificateCode,W/2+342,lowerY+116);font(ctx,11,700);ctx.fillStyle=MUTED;ctx.fillText('CERTIFICATE ID',W/2+342,lowerY+140);

  ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(150,H-132);ctx.lineTo(W-150,H-132);ctx.stroke();font(ctx,11,650);ctx.fillStyle=MUTED;ctx.textAlign='left';ctx.fillText('Issued by LitLab • Verify using the certificate ID shown above.',150,H-96);ctx.textAlign='right';ctx.fillText('LitLab Contributor Certificate • Not an IB certificate • Does not itself approve CAS.',W-150,H-96);
  if(data.preview){ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-0.34);ctx.textAlign='center';font(ctx,98,900);ctx.fillStyle='rgba(111,85,232,.11)';ctx.fillText('PREVIEW — NOT ISSUED',0,0);ctx.restore()}
  ctx.textAlign='left';const bytes=await imagePdf(page),filename=`LitLab_Contributor_Certificate_${safeFilePart(data.contributorName,'Contributor')}_${safeFilePart(data.certificateCode,'Certificate',38)}.pdf`;download(bytes,filename);
}
