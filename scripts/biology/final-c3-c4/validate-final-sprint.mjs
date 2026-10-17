import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const targets = [
  ["C3.1", "integration-body-systems", 23],
  ["C3.2", "defence-against-disease", 18],
  ["C4.1", "populations-communities", 18],
  ["C4.2", "transfers-energy-matter", 22],
];
const load = p => readFileSync(resolve(root, p), "utf8");
const lessonPath = slug => "src/biology/learning/" + slug + "/lesson.json";

export function validateLesson(lesson, prefix, expected) {
  const problems = [];
  const fail = message => problems.push(prefix + ": " + message);
  const ids = new Set();
  if (lesson.topicId !== prefix) fail("wrong topicId");
  if (!Array.isArray(lesson.sections)) return ["invalid sections array"];
  for (const section of lesson.sections) {
    if (section.understandingIds?.length !== 1) fail("section must map to one understanding: " + section.id);
    for (const id of section.understandingIds || []) {
      if (ids.has(id)) fail("duplicate understanding " + id);
      ids.add(id);
      if (!/^([A-D][1-4]\\.[1-4]\\.\\d+)$/.test(id)) fail("malformed understanding " + id);
      if (!section.explanation || section.explanation.trim().length < 150) fail("empty/short explanation " + id);
      const isHL = prefix === "C3.1" && Number(id.split(".")[2]) >= 17;
      if (section.level !== (isHL ? "HL" : "shared")) fail("level boundary " + id);
      if (!section.teachingBlocks?.length) fail("missing teaching blocks for " + id);
    }
  }
  for (let n = 1; n <= expected; n++) if (!ids.has(prefix + "." + n)) fail("missing " + prefix + "." + n);
  if (ids.size !== expected) fail("expected " + expected + " understandings; found " + ids.size);
  const questionIds = new Set();
  const assetIds = new Set((lesson.assets || []).map(a => a.id));
  for (const section of lesson.sections) {
    for (const asset of section.assets || []) if (!assetIds.has(asset)) fail("unregistered asset " + asset);
    for (const placement of section.figurePlacements || []) if (!assetIds.has(placement.assetId)) fail("bad figure placement " + placement.assetId);
    for (const visual of section.visuals || []) {
      if (!["comparison", "sequence", "bars"].includes(visual.kind)) fail("unexpected visual type " + visual.kind);
      if (visual.kind === "comparison" && (!visual.headers?.length || visual.rows?.some(row => row.length !== visual.headers.length))) fail("malformed comparison visual " + section.id);
      if (visual.kind === "sequence" && !visual.steps?.every(step => step.title && step.description)) fail("malformed sequence " + section.id);
      if (visual.kind === "bars" && !visual.values?.every(item => Number.isFinite(item.value) && item.value >= 0)) fail("invalid bar value " + section.id);
    }
    for (const t of section.graphTables || []) {
      if (!t.caption || !t.headers?.length || !t.rows?.every(row => row.length === t.headers.length)) fail("malformed graph table " + section.id);
    }
  }
  for (const asset of lesson.assets || []) {
    if (asset.kind !== "diagram" || !asset.src?.startsWith("/biology/") || !asset.alt || !asset.attribution) fail("asset without science/rights provenance " + asset.id);
  }
  for (const q of lesson.questions || []) {
    if (questionIds.has(q.id)) fail("duplicate question id " + q.id);
    questionIds.add(q.id);
    if (!Number.isInteger(q.marks) || q.marks < 1) fail("bad mark count " + q.id);
    for (const id of q.understandingIds || []) {
      if (!ids.has(id)) fail("question maps to absent understanding " + q.id);
      if (q.level !== ((prefix === "C3.1" && Number(id.split(".")[2]) >= 17) ? "HL" : "shared")) fail("question crosses SL/HL boundary " + q.id);
    }
    if (q.kind === "selection") {
      if (!Array.isArray(q.options) || q.options.filter(o => o.correct).length !== 1 || q.options.some(o => !o.feedback?.trim())) fail("incorrect answer/feedback " + q.id);
    } else if (!q.markingPoints?.length || !q.answer) fail("missing written markscheme " + q.id);
  }
  return problems;
}

export function validateDiagram(svg, name) {
  const problems = [];
  if (!/<svg\\b/.test(svg) || !/<\\/svg>/.test(svg)) problems.push(name + ": bad SVG root");
  if (!/<title\\b/.test(svg) || !/<desc\\b/.test(svg)) problems.push(name + ": missing visible semantics");
  if (/href=["']https?:/.test(svg)) problems.push(name + ": remote resource/link not permitted");
  return problems;
}

export function runAudit() {
  const errors = []; const results = [];
  const lessons = new Map();
  for (const [topic, slug, count] of targets) {
    const data = JSON.parse(load(lessonPath(slug)));
    lessons.set(topic, data);
    errors.push(...validateLesson(data, topic, count));
    for (const asset of data.assets || []) {
      const svg = load("public" + asset.src);
      errors.push(...validateDiagram(svg, asset.id));
    }
    results.push({ topic, understandings: data.sections.length, questions: data.questions.length, assets: data.assets.length });
  }
  // Scientific figure content and graph topology checks: files existing is not sufficient.
  const graph = load("public/biology/populations-communities/sigmoid-model.svg");
  const sigmoid = lessons.get("C4.1").sections.find(s => s.understandingIds.includes("C4.1.8"));
  const points = [...graph.matchAll(/<polyline points="([^"]+)"/g)][0]?.[1];
  const counts = sigmoid.graphTables[0].rows.map(r => r[1]);
  const expectedPoints = counts.map((count, index) => (134 + 133.2 * index).toFixed(1).replace(/\\.0$/, "") + "," + (375 - 4.75 * count)).join(" ");
  if (points !== expectedPoints) errors.push("C4.1.8: sigmoid SVG points do not match model table and axis scale");
  const logGraph = load("public/biology/populations-communities/exponential-semilog.svg");
  if (!logGraph.includes("M152 332L362 252L572 172L782 92") || !logGraph.includes("Population size (individuals; log scale)") || !logGraph.includes("Elapsed time (arbitrary units; linear scale)")) errors.push("C4.1.7: semi-log plotted geometry or axis units invalid");
  const web = load("public/biology/transfers-energy-matter/meadow-food-web.svg");
  for (const arrow of ["M224 218L301 156","M224 266L301 330","M470 154L542 154","M710 156L762 224","M470 331L762 266"]) if (!web.includes(arrow)) errors.push("C4.2.4: expected food-to-consumer edge missing: " + arrow);
  const energy = lessons.get("C4.2").sections.find(s => s.understandingIds.includes("C4.2.11"));
  const flows = energy.graphTables[0].rows.map(row => row[1]);
  if (JSON.stringify(flows) !== JSON.stringify([20810,3368,383,21])) errors.push("C4.2.11: historical EPA series altered");
  if (!energy.graphTables[0].caption.includes("EPA") || !energy.graphTables[0].caption.includes("yr")) errors.push("C4.2.11: original-data provenance/units missing");
  const co2 = lessons.get("C4.2").sections.find(s => s.understandingIds.includes("C4.2.20"));
  if (JSON.stringify(co2.graphTables[0].rows) !== JSON.stringify([[1959,315.98],[2004,377.38]])) errors.push("C4.2.20: NOAA/Scripps historical values altered");
  const reflex = load("public/biology/integration-body-systems/c31-reflex.svg");
  if (!reflex.includes("ONE interneuron") || !reflex.includes("dorsal-root") || !reflex.includes("ventral-root")) errors.push("C3.1.9: reflex arc missing required topology");
  const pressure = load("public/biology/integration-body-systems/c31-heart.svg");
  if (!pressure.includes("carotid sinus / aortic arch") || !pressure.includes("Corrective response tends to oppose")) errors.push("C3.1.14: pressure-feedback mechanism mislabelled");
  return { errors, results };
}

if (resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  const result = runAudit();
  console.log(JSON.stringify(result, null, 2));
  assert.equal(result.errors.length, 0, "C3/C4 sprint validation failed");
}
