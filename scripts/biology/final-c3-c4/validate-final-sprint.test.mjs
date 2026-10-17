import test from "node:test";
import assert from "node:assert/strict";
import { validateLesson, validateDiagram } from "./validate-final-sprint.mjs";

const model = () => ({
  topicId: "C4.1",
  sections: [{
    id: "c41-1", understandingIds: ["C4.1.1"], level: "shared",
    explanation: "A population consists of interacting organisms of the same species in a defined place and time. In sexually reproducing species its members normally interbreed. Defining boundaries avoids treating observations from one isolated lake as the entire regional population.",
    teachingBlocks: [{ title: "Population boundary", explanation: "Define area and time." }], assets: []
  }],
  assets: [],
  questions: [{
    id: "sample", kind: "selection", level: "shared", marks: 1,
    understandingIds: ["C4.1.1"],
    options: [
      { text: "correct", correct: true, feedback: "Correct biological cause." },
      { text: "wrong", correct: false, feedback: "Wrong species boundary." }
    ]
  }]
});

test("negative: missing understandings are reported", () => {
  assert(validateLesson(model(), "C4.1", 18).some(x => x.includes("C4.1.2")));
});
test("negative: duplicated understanding mapping is rejected", () => {
  const v = model(); v.sections.push({...v.sections[0], id:"duplicate"});
  assert(validateLesson(v, "C4.1", 18).some(x => x.includes("duplicate understanding")));
});
test("negative: multiple correct options are rejected", () => {
  const v = model(); v.questions[0].options[1].correct=true;
  assert(validateLesson(v, "C4.1", 18).some(x => x.includes("incorrect answer/feedback")));
});
test("negative: missing distractor feedback is rejected", () => {
  const v = model(); v.questions[0].options[1].feedback="";
  assert(validateLesson(v, "C4.1", 18).some(x => x.includes("incorrect answer/feedback")));
});
test("negative: wrong HL boundary is rejected", () => {
  const v = model(); v.sections[0].level="HL";
  assert(validateLesson(v, "C4.1", 18).some(x => x.includes("level boundary")));
});
test("negative: malformed or remotely linked SVG fails", () => {
  assert(validateDiagram("<svg><title>A</title></svg>", "missing-desc").length > 0);
  assert(validateDiagram('<svg><title>A</title><desc>D</desc><image href="https://example.com/a.jpg"/></svg>', "remote").some(x=>x.includes("remote")));
});
