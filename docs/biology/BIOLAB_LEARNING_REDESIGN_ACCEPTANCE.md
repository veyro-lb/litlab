# BioLab learning experience — release acceptance contract

**Status:** Under redesign. This document applies to all eight currently registered teaching drafts plus future topic packages; it does not certify their correctness or authorize publication. Student-facing references must never expose internal PDF offsets as a substitute for teaching.

## Primary educational sources

1. **IB Biology Guide, first assessment 2025** defines the required understanding IDs, applications, level boundaries and skills/NOS scope. The live registry remains authoritative for descriptive original headings, with original wording carefully mapped to the guide.
2. **Clegg, Davis & Talbot, Biology for the IB Diploma Programme, Third Edition (Hodder, 2023)** is the primary *teaching and sequencing* source. Read the entire pertinent chapter for each topic before rewriting explanations, examples, concept dependencies and misconception support. Do not merely add its name to a references list.
3. Additional authoritative sources may corroborate scientific accuracy, resolve errors or ambiguities, supply legitimately reusable figures and microscopy, and help simplify difficult explanations. A commercial textbook is not infallible. Record discrepancies and corrections; do not replace the official syllabus with broad web material.
4. Write original explanations, interactions, examples, assessment and artwork. No extensive textbook quotation, copied diagrams or commercial question-bank content. Keep internal printed/PDF page and claim locators for editorial traceability, but **no PDF page numbers in normal student lesson prose or topic-overview text**. The student-facing Sources tab should credit the Hodder Third Edition prominently and separately identify the IB guide and supplementary evidence without overwhelming students with locators.

## Lesson experience requirements

For every in-scope syllabus understanding, deliver a genuinely self-contained, appealing learning activity rather than a bare article:

- **Start with a biological question or prediction** that students can answer before reading.
- **Reveal the scientific explanation progressively:** observable phenomenon → mechanism → consequence → real biological context; appropriately scaffold prerequisites.
- **Visualize an actual biological relationship** through a legible and scientifically reviewed diagram, animation, authentic image or interactive model. Every label, arrow, cellular compartment and molecule orientation must be checked. Not every statement requires a gratuitous illustration.
- **Investigate or apply**, for example through an accurately modelled causal sequence, calculation, data interpretation, scenario comparison or image interrogation. Use feedback that explains *why*, not buttons that merely reveal text.
- **Retrieve and correct:** active recall, an original understanding check with misconception-specific feedback and useful retry, followed by a compact takeaway and a deeper practice link.
- Offer a **study choice** (guided mode, summary, practice, sources), and visible progress through *sections in the current session* without inventing competence/mastery or altering established student storage contracts.

Design for students reading on 320px phone screens as well as 390, 768, 1440 and 1920px desktops. Treat typography, contrast, layout spacing, keyboard navigation, focus management, touch size, reduced motion, figure enlargement, responsive controls, 200% zoom and screen-reader alternatives as blocking quality criteria.

## Visual and interaction standards

- No decorative CSS constructions used as substitutes for scientific diagrams. Use verified original vector schematics or authentic licensed scientific imaging with complete attribution, scale context and reuse rights.
- No fake photomicrographs, invented scale bars, mislabeled molecules, clipped captions, inaccessible hotspots, tiny textbook-like diagrams, or superficial animation.
- Labelled and active-recall diagrams must be consistent. Users need a full-size inspection view and a text equivalent.
- Every generated numeric graph must have correct axes, units and explicit data provenance; distinguish illustrative models from real observations.
- Header sign-in, BioLab switch, search, tutor, theme controls and feedback must never overlap at any tested width or after authentication.
- Avoid lesson layout that looks like a giant syllabus article, monotonous cards, or a wall of indistinguishable paragraphs. The student should know what to *do* at every moment.

## Required content QA

Before marking any topic accepted, record a 1:1 matrix for each official understanding against the IB guide and Hodder chapter, plus:
- A complete original explanation and logical prerequisite path
- All mechanisms and scientific examples supported by the source
- Review of known textbook and student misconceptions
- Diagrams and accessible textual equivalents with scientifically verified arrows/labels/scales
- An original interactive understanding check with credible wrong-answer feedback
- Retrieval, revision and appropriate original IB-style practice
- Source, image-rights, scientific and qualified reviewer statuses

The current beta has only **eight registered development drafts, 101 mapped understandings**. A2.2 Cell structure is not eligible for release until prescribed authentic microscopy interpretation and biological-drawing evidence gaps are resolved. Do not claim the remaining 32 topics are available.

## Verification and deployment safety

Run the full curriculum/lesson and negative science validators, TypeScript build, production audit, mobile/wide viewport screenshot review, genuine keyboard/touch tests, and all existing English/auth/storage regressions. Add explicit authenticated header-collision checks and student-task scenario tests. An automated green build is *necessary, not sufficient*.

No public redesign deployment until the owner has viewed the interactive preview and authorized it; no silent merge into main. Qualified science, assessment, microscopy and image-rights approval remain separately required for fully reviewed release. Use an isolated Git branch and private or controlled preview while redesigning.
