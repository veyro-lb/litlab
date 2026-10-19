# BioLab original textbook screenshots — isolated first batch

This branch restores **14 pixel-identical PDF image crops** that were previously extracted from the user's attached materials. They are real excerpts, **not recreated CSS/SVG drawings**. Twelve are from *IB Biology Drawings* (Noteworthy Science / Marier), and two are from C. J. Clegg, Andrew Davis and Christopher Talbot, *Biology for the IB Diploma*, Third Edition (Hodder Education, 2023).

The BioLab project owner explicitly confirmed on **2026-10-19** that they have permission to reproduce these illustrations and requested visible source attribution. The owner's statement is the current permission basis; no independent copy of the licence has been inspected. Publishers and creators retain their original copyrights, and a source credit is not itself the reproduction licence.

All 14 are linked into existing lesson sections in eight syllabus topics. Exact files, user-supplied PDF page locators, credit strings and original SHA-256 hashes are recorded in [FIGURE_SOURCE_REGISTER.json](./FIGURE_SOURCE_REGISTER.json). Four alternative images in the older extraction set are **not** introduced here to avoid redundant figures.

**Educational scope remains incomplete:** Direct Hodder screenshots of Krebs/Calvin cycles and other complex mechanisms are **not yet included** in this first batch. Their current original diagrams are not to be described as textbook crops. Further batches must extract and independently check the actual images from the supplied 868-page textbook, position them beside the matching understanding and keep graph labels legible.

The old uncleared path `public/biology/source-pdf-figures/` remains absent; restored crops are separately registered under `public/biology/licensed-book-crops/` following the new user permission statement. Source credit must remain visible and may not be stripped by UI changes.

Use `node scripts/biology/licensed-book-figures/verify.mjs` and the branch-specific full CI before treating the preview as verified. No merge into main or production deployment was performed as part of this batch.
