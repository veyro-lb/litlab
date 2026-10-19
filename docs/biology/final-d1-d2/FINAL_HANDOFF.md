# BioLab — Final Content Sprint D: FINAL HANDOFF

**Status:** Implemented, committed, internally checked, **not independently approved for publication**. All 77 understanding-level content changes are on the isolated branch; no main merge or public deployment was performed.

- **Repository:** https://github.com/veyro-lb/litlab
- **Base branch:** `feature/biolab-complete-course-integration-20261017`
- **Base HEAD read before work:** `2c321ae547baa2a97294728b337a4dfa46e64408`
- **Isolated delivery branch:** `feature/biolab-final-d1-d2-20261017`
- **Last code/asset/test commit before this handoff:** `cce9e912fed99bf25a8e618aeb6ccbe6d165c802`
- **Final SHA:** resolve `git rev-parse HEAD` after fetching this delivery branch; the code state above has not been rebased. The full branch HEAD is rechecked after the handoff commit and reported separately.
- **Boundary:** only six `src/biology/learning/<package>/lesson.json` files; two associated `public/biology/<package>/*.svg` assets; and new files under `scripts/biology/final-d1-d2/` and `docs/biology/final-d1-d2/`.

## Sources, curricular status and counts

Primary editorial references: International Baccalaureate, *Biology guide*, first assessment 2025 (published 2023), syllabus Theme D; and C. J. Clegg, Andrew Davis and Christopher Talbot, *Biology for the IB Diploma*, 3rd edition (Hodder Education, 2023), Theme D chapters listed below. The complete relevant textbook PDF page ranges were extracted for comparison with the official syllabus. Explanations, questions and graphics are newly authored; publisher passages, protected figures and exam questions were not reproduced. Prior lesson source-reference metadata was retained. No qualified independent subject reviewer has signed these lessons off.

| Topic | IB guide printed pages | Hodder printed pages | Shared SL/HL | Additional HL | Total | Questions after edit | New in-lesson visuals |
|---|---|---|---:|---:|---:|---:|---:|
| D1.1 DNA replication | 85–86 | 602–614 | 5 | 4 | 9 | 19 | 4 |
| D1.2 Protein synthesis | 87–88 | 615–636 | 11 | 8 | 19 | 39 | 5 |
| D1.3 Mutation and gene editing | 89–90 | 637–647 | 7 | 3 | 10 | 21 | 4 |
| D2.1 Cell and nuclear division | 90–92 | 648–669 | 11 | 6 | 17 | 35 | 6 |
| D2.2 Gene expression | 92–93 | 670–680 | 0 | 11 | 11 | 23 | 5 |
| D2.3 Water potential | 94–95 | 681–692 | 7 | 4 | 11 | 24 | 5 |
| **Total** | — | — | **41** | **36** | **77** | **161** | **29** |

The guide classifies D2.2 as **entirely additional HL**. SL students must not receive any of its 11 sections or questions. For the other five topics, the exact shared/HL splits in the official guide were retained. No syllabus identifiers were added, deleted, reordered or changed.

## Per-understanding editorial and assessment ledger

Each row denotes an existing numbered section that was **actually edited**: its second teaching passage received an original, syllabus-specific mechanism or interpretation expansion; the `explanation` field was synchronized with `teachingBlocks`; and its main structured-question marking points were made specific to that mechanism. The `Questions` column counts every question connected to that ID (a question may map to two or three IDs). Figures and tables in the `Visual` column were newly placed in that section during this sprint. Absence of a new visual means that the existing lesson visuals, where present, remain available.

| Understanding | Level | IB guide page | Textbook page(s) | Mechanism / corrective focus added | New visual / diagram | Questions |
|---|---|---:|---|---|---|---:|
| D1.1.1 | SL + HL | 86 | 602 | Follow the consequence: an unreplicated chromosome contains one DNA double helix; a correctly replicated chromosome contains two identical sister chromatids. | — | 2 |
| D1.1.2 | SL + HL | 86 | 603 | A template strand does not dictate where its own bases remain; it determines the order of incoming complementary nucleotides. | Semi-conservative copying: follow the strands | 2 |
| D1.1.3 | SL + HL | 86 | 604 | Helicase disrupts hydrogen bonds between paired bases without cutting the sugar–phosphate backbone. | — | 2 |
| D1.1.4 | SL + HL | 86 | 606 | Temperature makes three different things possible in successive PCR stages: high heat separates template strands, cooling allows short primers to anneal to flanking complementary sites, and extension at the polymerase's working temperature copies the bounded region. | Do not confuse PCR with gel electrophoresis | 3 |
| D1.1.5 | SL + HL | 86 | 607 | A matching DNA-band or STR profile is evidence of consistency with a sample source, not a proof that excludes contamination, relatives or procedural error. | — | 2 |
| D1.1.6 | HL only | 86 | 609 | The phosphate of an incoming dNTP attaches to the free 3′-OH of the nascent chain, so elongation is always 5′→3′. | — | 2 |
| D1.1.7 | HL only | 86 | 610 | At a fork travelling right, a 3′→5′ template oriented left-to-right can be copied toward the fork continuously; its opposing 5′→3′ template needs repeated primers and short fragments made away from the fork. | One fork, two DNA-synthesis patterns | 2 |
| D1.1.8 | HL only | 86 | 612 | In the prokaryotic model required here, primase synthesizes RNA primers because polymerases need an existing 3′-OH. | Bacterial replication enzyme hand-off | 2 |
| D1.1.9 | HL only | 86 | 613 | DNA polymerase III may pause when a just-added base is mismatched; its 3′→5′ exonuclease removes the incorrectly paired terminal nucleotide. | — | 2 |
| D1.2.1 | SL + HL | 87 | 615 | Transcription copies a selected DNA region into one RNA transcript. | — | 2 |
| D1.2.2 | SL + HL | 87 | 616 | Check the polarity of all three aligned molecules: coding DNA 5′-ATG GCT TAA-3′, template DNA 3′-TAC CGA ATT-5′, and mRNA 5′-AUG GCU UAA-3′. | DNA coding strand, template strand and transcript | 2 |
| D1.2.3 | SL + HL | 87 | 617 | DNA is read without being consumed. | — | 2 |
| D1.2.4 | SL + HL | 87 | 618 | Not every gene is transcribed continuously. | — | 2 |
| D1.2.5 | SL + HL | 87 | 619 | Translation links the information in mRNA codons to the order of amino acids in a polypeptide. | — | 2 |
| D1.2.6 | SL + HL | 87 | 620 | mRNA supplies the code; small and large ribosomal subunits organize decoding and peptide-bond formation; tRNAs match codons while delivering bound amino acids. | — | 2 |
| D1.2.7 | SL + HL | 87 | 621 | Polarity matters: mRNA codon 5′-AUG-3′ pairs antiparallel with tRNA anticodon 3′-UAC-5′. | A codon and its antiparallel anticodon | 3 |
| D1.2.8 | SL + HL | 87 | 622 | Four possible bases yield 4² = 16 doublets, too few for 20 standard amino acids, but 4³ = 64 triplets. | — | 2 |
| D1.2.9 | SL + HL | 88 | 623 | Determine the reading frame before using the mRNA codon table. | — | 3 |
| D1.2.10 | SL + HL | 88 | 624 | During elongation, an aminoacyl-tRNA matches the next codon, a peptide bond forms, and the ribosome advances by three bases along 5′→3′ mRNA. | Translation elongation cycle | 2 |
| D1.2.11 | SL + HL | 88 | 626 | A point substitution can alter one codon and thereby change one amino acid. | — | 2 |
| D1.2.12 | HL only | 88 | 627 | Distinguish the directions of two different processes: RNA synthesis extends 5′→3′ while DNA template reading is 3′→5′; the ribosome moves along mRNA 5′→3′ while the polypeptide grows from N-terminus to C-terminus. | — | 2 |
| D1.2.13 | HL only | 88 | 628 | A promoter is a DNA sequence that helps recruit and position the transcription machinery near the start of a gene. | — | 2 |
| D1.2.14 | HL only | 88 | 629 | Noncoding DNA can be functional. | — | 2 |
| D1.2.15 | HL only | 88 | 630 | Eukaryotic pre-mRNA maturation includes addition of a 5′ cap, a 3′ poly(A) tail, and removal of introns while exons are spliced together. | Maturation of a eukaryotic pre-mRNA | 2 |
| D1.2.16 | HL only | 88 | 631 | Alternative splicing produces different exon combinations from transcripts of one DNA gene. | — | 2 |
| D1.2.17 | HL only | 88 | 632 | At initiation, the small ribosomal subunit engages mRNA near its 5′ end and finds the start codon; initiator tRNA and large subunit assemble a functional ribosome. | Three ribosomal tRNA binding sites; d12-ribosome-orientation | 2 |
| D1.2.18 | HL only | 88 | 633 | Preproinsulin enters the secretory pathway and loses its signal peptide, becoming proinsulin. | — | 2 |
| D1.2.19 | HL only | 88 | 634 | An actively maintained proteome requires removal of damaged or no-longer-needed proteins as well as new synthesis. | — | 2 |
| D1.3.1 | SL + HL | 89 | 637 | A DNA substitution changes one nucleotide pair; an insertion adds base pairs and a deletion removes them. | — | 2 |
| D1.3.2 | SL + HL | 89 | 638 | The genetic code is degenerate, so two codons can encode the same amino acid. | Possible consequences of a coding substitution | 3 |
| D1.3.3 | SL + HL | 89 | 639 | An insertion or deletion of one or two bases inside a coding region generally shifts the downstream reading frame. | Insertions and deletions: frame comparison | 3 |
| D1.3.4 | SL + HL | 89 | 640 | Replication errors and imperfect DNA repair introduce spontaneous mutations. | — | 2 |
| D1.3.5 | SL + HL | 89 | 641 | Mutation is not a directed response to a species' needs. | Mutation does not equal natural selection | 2 |
| D1.3.6 | SL + HL | 89 | 642 | A variant present in an egg or sperm lineage may be transmitted to offspring. | — | 2 |
| D1.3.7 | SL + HL | 89 | 643 | Mutation supplies novel alleles over evolutionary time; meiosis and fertilization mostly reshuffle alleles that already exist. | — | 2 |
| D1.3.8 | HL only | 90 | 644 | Disabling a gene can reveal its contribution to phenotype by comparing knockout and otherwise comparable wild-type organisms. | — | 2 |
| D1.3.9 | HL only | 90 | 645 | A common CRISPR–Cas9 editing design uses guide RNA for target recognition and Cas9 to cleave DNA near a target adjacent to a suitable recognition motif. | Gene-editing result needs verification | 2 |
| D1.3.10 | HL only | 90 | 646 | Conservation means that related sequences remain alike over evolutionary time. | — | 2 |
| D2.1.1 | SL + HL | 90 | 648 | Cell division produces daughter cells from a pre-existing parent cell. | — | 2 |
| D2.1.2 | SL + HL | 90 | 649 | Animal cytokinesis uses an actin–myosin contractile ring that constricts the plasma membrane. | How animal and plant cells complete cytokinesis | 2 |
| D2.1.3 | SL + HL | 91 | 650 | Equal cytokinesis usually supplies two similar daughter-cell volumes. | — | 2 |
| D2.1.4 | SL + HL | 91 | 651 | Mitosis preserves chromosome number and ordinarily produces genetically similar nuclei for growth and repair. | Mitosis versus meiosis | 2 |
| D2.1.5 | SL + HL | 91 | 652 | Count chromosomes by centromeres rather than visible chromatids: a 2n=4 G1 nucleus has four chromosomes and four DNA molecules; after S phase it still has four chromosomes but eight DNA molecules. | — | 2 |
| D2.1.6 | SL + HL | 91 | 654 | Chromosome compaction organizes long DNA molecules for movement; histone-associated DNA folds into more condensed forms. | — | 2 |
| D2.1.7 | SL + HL | 91 | 655 | Prophase starts conspicuous chromosome condensation and spindle formation; at metaphase duplicated chromosomes align around the cell equator. | Mitosis: read the chromosomes in order; d21-mitosis-2n4 | 2 |
| D2.1.8 | SL + HL | 91 | 656 | Identify mitotic stages by chromosome morphology and spatial distribution, not the darkness of a stain alone. | — | 2 |
| D2.1.9 | SL + HL | 91 | 657 | Meiosis I separates homologous chromosomes, reducing a diploid nucleus to haploid complements while sister chromatids usually remain joined. | A 2n=4 meiosis model: keep the unit of counting explicit | 2 |
| D2.1.10 | SL + HL | 91 | 659 | Nondisjunction is failure of appropriate chromosome separation in meiosis I or II, producing gametes with abnormal chromosome counts. | — | 2 |
| D2.1.11 | SL + HL | 91 | 660 | Crossing over exchanges material between nonsister chromatids of homologous chromosomes during meiosis I. | — | 2 |
| D2.1.12 | HL only | 91 | 661 | Plant meristem cells proliferate near growing root and shoot tips; early animal embryos multiply cells rapidly. | — | 2 |
| D2.1.13 | HL only | 92 | 662 | The order G1 → S → G2 → mitosis → cytokinesis prevents a cell from allocating unreplicated chromosomes to new daughter cells. | One proliferative cell cycle | 2 |
| D2.1.14 | HL only | 92 | 664 | During G1 and G2, cells synthesize proteins and other components; during S, nuclear DNA is replicated. | — | 2 |
| D2.1.15 | HL only | 92 | 665 | Cyclin levels rise and fall through synthesis and degradation. | — | 2 |
| D2.1.16 | HL only | 92 | 666 | A proto-oncogene can become an oncogene through a gain-of-function change that promotes division; a tumour-suppressor gene may lose its normal braking function. | — | 2 |
| D2.1.17 | HL only | 92 | 667 | Benign tumours are localized and do not invade or metastasize; malignant cancers can invade adjacent tissues and spread, producing secondary tumours from a primary tumour. | Tumour types: invasion matters as well as growth | 3 |
| D2.2.1 | HL only | 92 | 670 | DNA sequence can influence phenotype through a causal chain: transcription creates RNA, translation of a protein-coding transcript yields a polypeptide, and the folded protein acts as an enzyme, receptor or structural component. | — | 2 |
| D2.2.2 | HL only | 92 | 671 | Sequence-specific transcription factors can bind promoters and distal enhancers, modulating transcription initiation by influencing polymerase recruitment or chromatin accessibility. | How DNA binding regulates transcription | 2 |
| D2.2.3 | HL only | 93 | 672 | An mRNA's abundance depends on both synthesis and degradation. | Equal transcription is not equal RNA output | 3 |
| D2.2.4 | HL only | 93 | 673 | Epigenesis is the progressive establishment of differentiated cell states during development. | — | 2 |
| D2.2.5 | HL only | 93 | 674 | The genome is the DNA complement; the transcriptome is the set and abundances of RNA transcripts in a given cell and condition; the proteome is the set and amounts of proteins. | Three biological information layers | 2 |
| D2.2.6 | HL only | 93 | 675 | DNA cytosine methylation at a promoter commonly reduces downstream transcription. | Not all methylation has the same regulatory effect | 2 |
| D2.2.7 | HL only | 93 | 676 | Some DNA methylation and histone-state information can be recreated after replication, allowing daughter-cell lineages to retain expression patterns without a base substitution. | Maintaining expression state through mitosis | 2 |
| D2.2.8 | HL only | 93 | 677 | Environmental conditions can be associated with changes in methylation patterns, including responses to air pollution. | — | 2 |
| D2.2.9 | HL only | 93 | 678 | Many epigenetic tags are removed or reset during gametogenesis and early development, but some parent-of-origin information can persist, producing genomic imprinting effects. | — | 2 |
| D2.2.10 | HL only | 93 | 679 | Monozygotic twins share an exceptionally similar initial genotype, making their comparisons useful for examining environmental influences on gene-expression phenotypes. | — | 2 |
| D2.2.11 | HL only | 93 | 680 | Regulatory factors outside a gene can change its expression. | — | 2 |
| D2.3.1 | SL + HL | 94 | 681 | A water molecule has a partial-negative oxygen region and partial-positive hydrogen regions. | — | 2 |
| D2.3.2 | SL + HL | 94 | 682 | Describe an external solution as hypotonic, isotonic or hypertonic relative to the comparison cell or solution, based on effective solute concentration. | Tonicity must always have a reference | 2 |
| D2.3.3 | SL + HL | 94 | 683 | In osmosis, water crosses a selectively permeable membrane with a net movement set by conditions on both sides. | — | 2 |
| D2.3.4 | SL + HL | 94 | 684 | Use percentage mass change = (final mass − initial mass) / initial mass × 100. | From plant-tissue measurements to isotonic point | 3 |
| D2.3.5 | SL + HL | 94 | 685 | An animal cell lacks a rigid external cell wall. | Different effects of osmotic imbalance | 2 |
| D2.3.6 | SL + HL | 94 | 686 | A plant cell's strong wall restricts expansion as water enters in a hypotonic setting, causing positive turgor pressure. | — | 2 |
| D2.3.7 | SL + HL | 94 | 687 | Intravenous solutions are designed to be appropriately compatible with body-fluid tonicity, minimizing destructive net water shifts into or out of patient cells. | — | 2 |
| D2.3.8 | HL only | 95 | 688 | Water potential Ψw is the potential energy of water per unit volume, defined relative to pure water under reference conditions rather than measured as an absolute value. | Compare negative water potentials correctly | 2 |
| D2.3.9 | HL only | 95 | 689 | Water tends to move from higher Ψw to lower Ψw across a permeable route. | — | 3 |
| D2.3.10 | HL only | 95 | 690 | For an IB cell-level model, Ψw = Ψs + Ψp. | Signed water-potential arithmetic | 3 |
| D2.3.11 | HL only | 95 | 691 | A flaccid plant cell in a hypotonic bath may take up water and build positive turgor, which increases Ψp until net water movement is reduced. | — | 3 |

## Substantive scientific edits

**D1.1 (9/9):** distinguished duplication of DNA from transcription and S-phase chromosome accounting; strengthened semi-conservative pairing; helicase versus phosphodiester-bond formation; PCR cycle and gel migration conditions; forensic marker reliability; 5′→3′ synthesis; repeated lagging-strand primers; *prokaryotic* primase/polymerase I/polymerase III/ligase roles; and terminal 3′→5′ proofreading. Existing replication-fork schematic retained.

**D1.2 (19/19):** connected DNA-template direction, RNA synthesis, mRNA coding, codon reading frames, tRNA anticodon orientation and peptide-bond formation; explained degeneracy and genetic-code limits; clarified HL promoter recognition, noncoding DNA, cap/tail/splicing, alternate exon combinations, the ribosome A/P/E sites, two-stage insulin maturation, and proteasomal turnover. Added a new labelled original codon–anticodon/ribosome diagram in D1.2.17.

**D1.3 (10/10):** separated substitution, insertion/deletion, silent/missense/nonsense, frameshift and non-frameshift consequences. Distinguished spontaneous mutation, DNA damage/repair, and mutagens; avoided implying that natural selection directs mutations; clarified germ-line versus somatic transmission, knockout controls, CRISPR targeting and verification, ethical limits, and alternative hypotheses for sequence conservation.

**D2.1 (17/17):** explained cytokinesis in plant versus animal cells; unequal division; chromosome count versus chromatids/DNA molecule count in a 2n=4 model; mitotic stage sequence and spindle transport; distinct meiosis I and II segregation; crossing over and assortment; nondisjunction; active interphase, cyclin thresholds, oncogenes/tumour suppressors, metastasis and proper mitotic-index interpretation. Added new 2n=4 labelled mitosis-stage SVG at D2.1.7.

**D2.2 (11/11, HL only):** explained promoters/enhancers and factor binding, transcript synthesis versus degradation, genome–transcriptome–proteome differences, promoter DNA versus histone methylation, epigenetic cell-lineage inheritance and germ-line erasure. Qualified air-pollution associations, monozygotic twin comparisons, parent-of-origin hybrid examples, and hormonal/bacterial regulatory examples. Do not infer causation solely from methylation associations.

**D2.3 (11/11):** separated polar solvation from tonicity and emphasized relative solute concentration at SL; explained osmotic direction and dynamic equilibrium, replicates and interpolation, turgor versus plasmolysis, crenation and medical fluids. At HL specified the water potential reference state, units kPa, direction from higher to lower Ψw, signed Ψs and Ψp terms including xylem tension, and signed quantitative predictions. Graph datasets remain clearly **hypothetical**, not empirical.

## Visual and assessment ledger

- **29 new contextual learning visuals**: 4 D1.1, 5 D1.2, 4 D1.3, 6 D2.1, 5 D2.2, 5 D2.3. They use the existing `LearningVisual` comparison or sequence component rather than a new interface. They are placed alongside the relevant teaching paragraph and use scrollable tables with header cells where appropriate.
- **Two original diagrams**: `public/biology/cell-nuclear-division/mitosis-stages-2n4.svg` and `public/biology/protein-synthesis/translation-codon-anticodon.svg`. Both have SVG titles/descriptions, matching lesson asset alt text, model labels, and source/rights metadata. Existing topic diagrams are preserved.
- **Five new authored questions**: `d11-pcr-model-data-1b`, `d12-anticodon-1b`, `d13-frame-reasoning-1b`, `d22-rna-turnover-model-1b`, and `d23-signed-psi-2`. Earlier data questions in D2.1 and D2.3 remain. Calculations and model assumptions are explicit; no published IB item has been copied.
- **77 existing three-mark structured question rubrics** gained explanatory, section-specific marking statements. **462 duplicate generic incorrect-option feedback strings** (the lesson interaction and assessment copies) were replaced with explanations that explicitly identify the selected distractor and recall the topic misconception correction. Correct answer keys were not changed.

## Verification: actually executed, versus not executed

Verified against the code-state commit `cce9e912fed99bf25a8e618aeb6ccbe6d165c802`, using the exact checked-in `verify.mjs` validation function evaluated in the GitHub-connected JavaScript runtime with the six lesson JSON files and the repository tree read from the same SHA:

| Check | Result / evidence |
|---|---|
| Six exact topic IDs, 77 sequential understanding IDs and 41 shared / 36 HL sections | **PASS** |
| D2.2 HL-only sections and question scope | **PASS** |
| Section passage/headings synchronization, references and source locators | **PASS** |
| 161 question mappings, unique keys, correct-option cardinality, model-data labelling | **PASS** |
| 29 `LearningVisual` layouts, header lengths and figure placements | **PASS** |
| 77 marking-point lengths versus marks, wrong-option feedback distinctness | **PASS** |
| Five new question mathematics/answer sign checks (including idealized PCR and signed Ψ) | **PASS** |
| Structural XML tag/ARIA/title/description/security checks on both newly written SVG files | **PASS** |
| Nine controlled negative mutations: dropped section, HL leak, strand reversal, double keyed answer, wrong level, invalid Ψ calculation, ragged comparison row, false approval and cross-topic question | **PASS — all rejected** |
| Scoped GitHub commit comparison against the base | **PASS — no changes outside authorized folders** |

The regression scripts are committed at `scripts/biology/final-d1-d2/verify.mjs` and `scripts/biology/final-d1-d2/negative.test.mjs`. Their logic was exercised in a GitHub-connected JS runtime, but the **Node test runner, npm quality checks, full TypeScript/Vite production build and real browser route tests were not executed**: this environment cannot clone the GitHub checkout (DNS/network blocked) and the existing Actions workflows do not target this new branch; changing shared CI configuration is outside the allowed ownership. **Do not label these checks as passing.** A real browser screenshot of the two newly introduced SVGs and responsive layout remains to be captured.

## Unresolved / publication gates

1. **D2.1.8 genuine microscopy:** schematic stage comparisons are present, but required stage identification on real microscope cells or licensed authentic micrographs needs a rights-verified source and a real visual test. The earlier lesson itself lists this as a release blocker.
2. **Qualified review:** all six lesson packages retain `review.status = "source-mapped"` and `review.reviewer = null`. None has been independently certified by a qualified scientific or IB assessment reviewer.
3. **Execution gate:** run the checked-in scripts, existing six `lesson.test.mjs` tests, repository quality suite, production build, and browser checks from a genuine clean checkout of the **exact final branch SHA**. Confirm mobile tables and diagrams, alternative text, question input/feedback, and HL gating.
4. **Rights and time-dependent claims:** the edited content is original educational wording, but a final human review should check externally supported examples (including clinical gene-editing application/regulatory status) and confirm no third-party figure was inadvertently used elsewhere in a lesson. Published model datasets must remain labelled hypothetical.

**Unfinished numbered text IDs:** none of the 77. The outstanding requirements are microscopy and independent scientific/assessment/real-browser/production validation, not missing syllabus sections. This is an internally complete editorial draft, **not** an authorization for public student release.

## Safe integration instructions

1. Inspect the latest HEAD of `feature/biolab-complete-course-integration-20261017` and this sprint's HEAD before integration. Do not force-reset, overwrite or merge the integration branch as part of this sprint.
2. Compare files using `git diff --name-only 2c321ae547baa2a97294728b337a4dfa46e64408..feature/biolab-final-d1-d2-20261017`. Allow only the six lesson JSON packages, their associated `public/biology` assets, and new `docs/biology/final-d1-d2/` and `scripts/biology/final-d1-d2/` paths. Treat any other modification as a boundary violation.
3. In a clean exact-SHA checkout run `node scripts/biology/final-d1-d2/verify.mjs`, `node --test scripts/biology/final-d1-d2/negative.test.mjs`, all six local `lesson.test.mjs` files, `npm ci`, `npm run quality` and `npm run build`. Then run guarded route/mobile/browser smoke with SL and HL account conditions.
4. Acquire authentic microscopy evidence and scientific/assessment sign-off before authorizing release. Preserve the draft review status until that approval. Any later registry/catalog activation belongs solely to the integrator, not this isolated sprint.
5. Integrate reviewed commits onto the latest integration HEAD using an explicit reviewed cherry-pick or integration PR. **Do not merge into main or publicly deploy from this branch.**

