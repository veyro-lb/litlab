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

type TeacherTestimony={
  reviewer_name:string;
  summary:string;
  accuracy:number;
  clarity:number;
  dp_relevance:number;
  originality:number;
  sources:number;
  recommendation:string;
  reviewed_at:string;
};
type CanvasPage={canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;pointWidth:number;pointHeight:number};

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const LANDSCAPE={pxWidth:1754,pxHeight:1240,pointWidth:841.89,pointHeight:595.28};
const INK='#172033';
const MUTED='#667085';
const PURPLE='#6f55e8';
const PURPLE_DARK='#4d3fb5';
const PALE='#f7f5ff';
const LINE='#ded9f8';
const GOLD='#b28a39';
const GREEN='#258653';

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
function sessionToken(){try{return String(JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token||'')}catch{return ''}}

async function loadAsset(path:string){
  const src=new URL(path,document.baseURI).href;
  return await new Promise<HTMLImageElement|null>(resolve=>{const image=new Image();const timer=window.setTimeout(()=>resolve(null),3500);image.onload=()=>{window.clearTimeout(timer);resolve(image)};image.onerror=()=>{window.clearTimeout(timer);resolve(null)};image.src=src});
}
async function loadTeacherTestimony(code:string,preview=false):Promise<TeacherTestimony|null>{
  if(preview||!code||code.startsWith('PREVIEW'))return null;
  const auth=sessionToken();if(!auth)return null;
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_litlab_certificate_teacher_testimony`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify({p_certificate_code:code})});
    if(!response.ok)return null;const text=await response.text();if(!text)return null;const value=JSON.parse(text) as TeacherTestimony|null;return value&&value.summary?value:null;
  }catch{return null}
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
  ctx.save();ctx.textAlign='center';font(ctx,11,900);ctx.fillStyle=PURPLE;ctx.fillText('AUTHORIZED BY LITLAB',x,y-88);
  if(signature){const signatureWidth=420;const signatureHeight=signatureWidth*(150/513);ctx.drawImage(signature,x-signatureWidth/2,y-68,signatureWidth,signatureHeight)}else{ctx.fillStyle='#151b2d';ctx.font='italic 68px "Snell Roundhand", "Apple Chancery", "URW Chancery L", "Segoe Script", "Brush Script MT", cursive';ctx.fillText('LitLab',x,y+18)}
  ctx.strokeStyle='#a9a3c9';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-190,y+59);ctx.lineTo(x+190,y+59);ctx.stroke();font(ctx,16,850);ctx.fillStyle=INK;ctx.fillText(data.issuerName||'LitLab',x,y+88);font(ctx,13,650);ctx.fillStyle=MUTED;ctx.fillText(data.issuerTitle||'LitLab Contributor Program',x,y+112);font(ctx,10,800);ctx.fillStyle=PURPLE;ctx.fillText('DIGITALLY ISSUED • CERTIFICATE ID VERIFIABLE',x,y+133);ctx.restore();
}
function pageBackground(page:CanvasPage){
  const {ctx}=page,W=LANDSCAPE.pxWidth,H=LANDSCAPE.pxHeight;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);const gradient=ctx.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#fbfaff');gradient.addColorStop(.52,'#ffffff');gradient.addColorStop(1,'#f6f3ff');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(111,85,232,.035)';ctx.beginPath();ctx.arc(130,110,260,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(W-90,H-60,330,0,Math.PI*2);ctx.fill();ctx.strokeStyle=PURPLE;ctx.lineWidth=8;rr(ctx,38,38,W-76,H-76,24);ctx.stroke();ctx.strokeStyle='#d9d2ff';ctx.lineWidth=2;rr(ctx,59,59,W-118,H-118,18);ctx.stroke();ctx.fillStyle=PURPLE;rr(ctx,78,76,14,H-152,7);ctx.fill();
}
function drawCertificatePage(data:CertificatePdfData,logo:HTMLImageElement|null,icon:HTMLImageElement|null,signature:HTMLImageElement|null){
  const page=makeCanvas(),{ctx}=page,W=LANDSCAPE.pxWidth,H=LANDSCAPE.pxHeight;pageBackground(page);ctx.textAlign='center';
  if(logo){const logoW=410,logoH=108;ctx.drawImage(logo,W/2-logoW/2,76,logoW,logoH)}else drawLogoFallback(ctx,W/2,82);
  font(ctx,15,900);ctx.fillStyle=PURPLE;ctx.fillText('OFFICIAL LITLAB CONTRIBUTOR PROGRAM',W/2,211);font(ctx,43,900,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;ctx.fillText('Certificate of Contribution',W/2,270);ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2-230,302);ctx.lineTo(W/2+230,302);ctx.stroke();
  font(ctx,20,600);ctx.fillStyle=MUTED;ctx.fillText('This certificate is proudly presented to',W/2,353);font(ctx,72,900,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;const nameLines=wrap(ctx,data.contributorName,W-440).slice(0,2);nameLines.forEach((line,i)=>ctx.fillText(line,W/2,439+i*75));let y=439+Math.max(1,nameLines.length)*75;
  font(ctx,17,900);ctx.fillStyle=PURPLE;ctx.fillText(data.contributorRole.toUpperCase(),W/2,y+2);y+=55;font(ctx,20,600);ctx.fillStyle=MUTED;ctx.fillText('in recognition of the successful completion of',W/2,y);y+=48;font(ctx,35,850);ctx.fillStyle=INK;const titleLines=wrap(ctx,data.contributionTitle,W-470).slice(0,2);titleLines.forEach((line,i)=>ctx.fillText(line,W/2,y+i*43));y+=Math.max(1,titleLines.length)*43+20;font(ctx,17,550);ctx.fillStyle=MUTED;const desc=wrap(ctx,data.contributionDescription,W-520).slice(0,4);desc.forEach((line,i)=>ctx.fillText(line,W/2,y+i*27));y+=Math.max(1,desc.length)*27+27;
  ctx.fillStyle=PALE;rr(ctx,W/2-455,y-16,910,86,20);ctx.fill();font(ctx,15,800);ctx.fillStyle=INK;const facts=[`Completed ${dateLabel(data.completedAt)}`,`Issued ${dateLabel(data.issuedAt)}`];if(data.verifiedMinutes!=null)facts.push(`Verified time ${duration(data.verifiedMinutes)}`);ctx.fillText(facts.join('   •   '),W/2,y+19);font(ctx,12,700);ctx.fillStyle=MUTED;ctx.fillText(data.contributionType.toUpperCase(),W/2,y+49);y+=124;
  const lowerY=Math.min(y+48,H-330);drawSignature(ctx,W/2-325,lowerY,data,signature);drawSeal(ctx,W/2+342,lowerY-18,data.certificateCode,icon);ctx.textAlign='center';font(ctx,14,850);ctx.fillStyle=INK;ctx.fillText(data.certificateCode,W/2+342,lowerY+116);font(ctx,11,700);ctx.fillStyle=MUTED;ctx.fillText('CERTIFICATE ID',W/2+342,lowerY+140);
  ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(150,H-132);ctx.lineTo(W-150,H-132);ctx.stroke();font(ctx,11,650);ctx.fillStyle=MUTED;ctx.textAlign='left';ctx.fillText('Issued by LitLab • Verify using the certificate ID shown above.',150,H-96);ctx.textAlign='right';ctx.fillText('LitLab Contributor Certificate • Not an IB certificate • Does not itself approve CAS.',W-150,H-96);
  if(data.preview){ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-0.34);ctx.textAlign='center';font(ctx,98,900);ctx.fillStyle='rgba(111,85,232,.11)';ctx.fillText('PREVIEW — NOT ISSUED',0,0);ctx.restore()}ctx.textAlign='left';return page;
}
function drawTestimonyPage(data:CertificatePdfData,testimony:TeacherTestimony,logo:HTMLImageElement|null,icon:HTMLImageElement|null){
  const page=makeCanvas(),{ctx}=page,W=LANDSCAPE.pxWidth,H=LANDSCAPE.pxHeight;pageBackground(page);ctx.textAlign='left';
  if(logo){const logoW=300,logoH=79;ctx.drawImage(logo,132,82,logoW,logoH)}else{ctx.textAlign='left';font(ctx,36,900);ctx.fillStyle=INK;ctx.fillText('LitLab',132,128)}
  font(ctx,12,900);ctx.fillStyle=PURPLE;ctx.fillText('ATTACHED TO STUDENT CERTIFICATE',132,205);font(ctx,42,900,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;ctx.fillText('Teacher Academic Testimony',132,262);font(ctx,17,600);ctx.fillStyle=MUTED;ctx.fillText(`For ${data.contributorName} • ${data.contributionTitle}`,132,302);
  const reviewerY=355;ctx.fillStyle=PALE;rr(ctx,132,reviewerY,1490,104,18);ctx.fill();font(ctx,11,900);ctx.fillStyle=PURPLE;ctx.fillText('TEACHER REVIEWER',158,reviewerY+30);font(ctx,21,850);ctx.fillStyle=INK;ctx.fillText(testimony.reviewer_name||'Teacher reviewer',158,reviewerY+61);font(ctx,12,650);ctx.fillStyle=MUTED;ctx.fillText(`Academically approved • Reviewed ${dateLabel(testimony.reviewed_at)}`,158,reviewerY+86);
  const scores:[string,number][]=[['Accuracy',testimony.accuracy],['Clarity',testimony.clarity],['DP relevance',testimony.dp_relevance],['Originality',testimony.originality],['Sources',testimony.sources]];const gap=12,cardW=(1490-gap*4)/5,cardY=486;
  scores.forEach(([label,value],index)=>{const x=132+index*(cardW+gap);ctx.fillStyle='#fff';ctx.strokeStyle=LINE;ctx.lineWidth=2;rr(ctx,x,cardY,cardW,102,16);ctx.fill();ctx.stroke();font(ctx,27,900);ctx.fillStyle=INK;ctx.fillText(`${Number(value)||0}/5`,x+20,cardY+43);font(ctx,11,800);ctx.fillStyle=MUTED;ctx.fillText(label.toUpperCase(),x+20,cardY+72)});
  font(ctx,12,900);ctx.fillStyle=PURPLE;ctx.fillText('TEACHER TESTIMONY',132,648);ctx.fillStyle='#fff';ctx.strokeStyle=LINE;ctx.lineWidth=2;rr(ctx,132,670,1490,310,20);ctx.fill();ctx.stroke();font(ctx,20,600,'Georgia, Times New Roman, serif');ctx.fillStyle=INK;const lines=wrap(ctx,testimony.summary||'Teacher approval recorded.',1428).slice(0,10);lines.forEach((line,index)=>ctx.fillText(line,164,718+index*30));
  ctx.fillStyle='rgba(37,134,83,.07)';rr(ctx,132,1004,1120,86,16);ctx.fill();font(ctx,12,800);ctx.fillStyle=GREEN;ctx.fillText('ACADEMIC REVIEW EVIDENCE',158,1035);font(ctx,12,650);ctx.fillStyle=MUTED;const note='This testimony records the assigned teacher’s LitLab academic review. It is not an IB grade or school grade; LitLab admin made the final contribution decision.';wrap(ctx,note,1060).slice(0,2).forEach((line,index)=>ctx.fillText(line,158,1060+index*20));
  drawSeal(ctx,1450,1044,data.certificateCode,icon);ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(132,H-82);ctx.lineTo(W-132,H-82);ctx.stroke();font(ctx,10,700);ctx.fillStyle=MUTED;ctx.fillText(`Certificate ID ${data.certificateCode} • Teacher testimony attached to the student contribution record.`,132,H-52);return page;
}

async function jpegBytes(canvas:HTMLCanvasElement){const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Could not create certificate image.')),'image/jpeg',0.96));return new Uint8Array(await blob.arrayBuffer())}
function enc(text:string){return new TextEncoder().encode(text)}
function concat(parts:Uint8Array[]){const length=parts.reduce((sum,p)=>sum+p.length,0),out=new Uint8Array(length);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length}return out}
async function imagePdf(pages:CanvasPage[]){
  const jpegs=await Promise.all(pages.map(page=>jpegBytes(page.canvas)));const objectCount=2+pages.length*3,objects:Uint8Array[][]=Array.from({length:objectCount+1},()=>[]);objects[1]=[enc('<< /Type /Catalog /Pages 2 0 R >>')];const kids=pages.map((_,i)=>`${3+i*3} 0 R`).join(' ');objects[2]=[enc(`<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`)];
  pages.forEach((page,i)=>{const pageNo=3+i*3,contentNo=pageNo+1,imageNo=pageNo+2,draw=`q\n${page.pointWidth} 0 0 ${page.pointHeight} 0 0 cm\n/Im0 Do\nQ\n`,drawBytes=enc(draw);objects[pageNo]=[enc(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pointWidth} ${page.pointHeight}] /Resources << /XObject << /Im0 ${imageNo} 0 R >> >> /Contents ${contentNo} 0 R >>`)];objects[contentNo]=[enc(`<< /Length ${drawBytes.length} >>\nstream\n`),drawBytes,enc('endstream')];const jpg=jpegs[i];objects[imageNo]=[enc(`<< /Type /XObject /Subtype /Image /Width ${page.canvas.width} /Height ${page.canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),jpg,enc('\nendstream')]});
  const chunks:Uint8Array[]=[enc('%PDF-1.4\n% LitLab Certificate\n')],offsets:number[]=[0];let byteOffset=chunks[0].length;for(let i=1;i<=objectCount;i++){offsets[i]=byteOffset;const obj=concat([enc(`${i} 0 obj\n`),concat(objects[i]),enc('\nendobj\n')]);chunks.push(obj);byteOffset+=obj.length}const xrefOffset=byteOffset;let xref=`xref\n0 ${objectCount+1}\n0000000000 65535 f \n`;for(let i=1;i<=objectCount;i++)xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;xref+=`trailer\n<< /Size ${objectCount+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;chunks.push(enc(xref));return concat(chunks);
}
function download(bytes:Uint8Array,filename:string){const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30_000)}

export async function saveCertificatePdf(data:CertificatePdfData){
  const [logo,icon,signature,testimony]=await Promise.all([loadAsset('./litlab-logo.svg'),loadAsset('./favicon.svg'),loadAsset('./litlab-signature.svg'),loadTeacherTestimony(data.certificateCode,Boolean(data.preview))]);
  const pages=[drawCertificatePage(data,logo,icon,signature)];if(testimony)pages.push(drawTestimonyPage(data,testimony,logo,icon));const bytes=await imagePdf(pages),filename=`LitLab_Contributor_Certificate_${safeFilePart(data.contributorName,'Contributor')}_${safeFilePart(data.certificateCode,'Certificate',38)}.pdf`;download(bytes,filename);
}
