/**
 * Phase 5 Batch 2 scientific and scope acceptance gates.
 * A structural preflight, NOT scientific certification.
 * Run against independently authored A1.2 and C1.1 lessons before
 * registering them in the live curriculum catalog.
 */
export function validateBatch5(topic, lesson) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const specs = {
    'A1.2': {count:15,shared:10,hl:5,prefix:'a12',mcq:15,figures:8,written:2,data:1},
    'C1.1': {count:17,shared:10,hl:7,prefix:'c11',mcq:17,figures:8,written:4,data:2}
  };
  const spec = specs[topic?.id];
  if (!spec) return ['Unexpected Phase 5 topic'];
  if (!lesson || !Array.isArray(lesson.sections) || !Array.isArray(lesson.questions)) return ['Lesson missing'];
  const understandingIds = topic.understandings.map((u) => u.id);
  if (understandingIds.length !== spec.count) fail('Incorrect official understanding count');
  for (let i=0;i<spec.count;i++) {
    const u=topic.understandings[i];
    if (!u || u.id !== topic.id+'.'+(i+1) ||
      u.level !== (i<spec.shared?'shared':'HL')) fail('Official sequence/scope '+(i+1));
    if (!u?.studentTitle?.trim()) fail('Missing registry title '+(i+1));
  }
  const sections=lesson.sections;
  const seen=new Set();
  for (const s of sections) {
    if ('title' in s) fail('Section title duplicates registry '+s.id);
    for (const id of s.understandingIds||[]) {
      if (seen.has(id)) fail('Duplicate understanding '+id);
      seen.add(id);
      const source=topic.understandings.find(u=>u.id===id);
      if (!source) fail('Unrecognized understanding '+id);
      else {
        if (source.level!==s.level) fail('Scope leakage '+id);
        if (s.guidePage!==source.guidePage || s.pdfPage!==source.pdfPage) fail('Guide locator '+id);
      }
    }
    if (!s.explanation?.trim() || !s.workedExample?.trim() ||
        !s.revisionSummary?.trim() || !s.interactions?.length || !s.recall?.length ||
        !s.misconceptions?.length || !s.claimReferences?.length) fail('Incomplete authored teaching '+s.id);
    if (!s.textbook?.printedPages?.length ||
        s.textbook.printedPages.some((p,i)=>s.textbook.pdfPages?.[i]!==p+12)) fail('Textbook locator '+s.id);
    for(const x of s.interactions||[]){
      if (x.kind==='selection' && (!x.options || x.options.filter(o=>o.correct).length!==1 ||
        x.options.some(o=>!o.feedback?.trim()))) fail('Unreviewable interaction '+x.id);
    }
  }
  for (const id of understandingIds) if (!seen.has(id)) fail('Uncovered understanding '+id);
  const mcqs=lesson.questions.filter(q=>q.paper==='1A');
  if (mcqs.length<spec.mcq) fail('Insufficient original four-option MCQs');
  for(const q of mcqs) if (q.options?.length!==4 || q.options.filter(o=>o.correct).length!==1 ||
    q.options.some(o=>!o.feedback?.trim()) || q.original!==true) fail('MCQ validity '+q.id);
  if (lesson.questions.filter(q=>q.paper==='2').length<spec.written) fail('Insufficient written tasks');
  if (lesson.questions.filter(q=>q.paper==='1B'&&q.data?.caption).length<spec.data) fail('Insufficient data tasks');
  if ((lesson.assets||[]).length<spec.figures) fail('Scientific figure families pending');
  for(const a of lesson.assets||[]){
    if (!a.recallSrc || !a.alt?.trim() || !a.permissionEvidence?.trim() ||
      a.review==='approved') fail('Incomplete original-figure provenance '+a.id);
  }
  if (lesson.review?.status!=='scientific-review' || lesson.review?.reviewer!==null)
    fail('Unauthorized approval');
  if (topic.id==='A1.2'){
    const n=sections.find(s=>s.understandingIds?.includes('A1.2.13'));
    if (!n?.molecularViewer || !/^https:\/\/www\.rcsb\.org\//.test(n.molecularViewer.url||'') ||
      !n.molecularViewer.fallback || !n.molecularViewer.studentInstructions)
      fail('Hands-on HL molecular viewer with accessibility fallback missing');
    const transcription=sections.find(s=>s.understandingIds?.includes('A1.2.8'))?.explanation||'';
    if (!/template/i.test(transcription) || !/coding/i.test(transcription) ||
      !/3′.*5′/.test(transcription)) fail('Transcription polarity or template/coding distinction missing');
  }
  if (topic.id==='C1.1'){
    const explanations=sections.map(s=>s.explanation||'').join(' ');
    for(const term of ['initial rate','activation energy','competitive','feedback',
      'exocytosis','penicillin','isoleucine']) if (!explanations.toLowerCase().includes(term))
      fail('Required enzyme teaching checkpoint '+term);
    for(const a of lesson.assets||[]) if (a.kind==='graph' &&
      (!a.accessibleData || !a.conditions || !a.modelDisclosure))
      fail('Graph data, conditions or model disclosure '+a.id);
  }
  return errors;
}
