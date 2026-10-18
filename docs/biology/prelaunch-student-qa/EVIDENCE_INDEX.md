# Browser evidence index — successful latest integration retest

**Verified integration baseline:** `bc508506186f4246455856fa58361ca601601abb`  
**Executed QA commit:** `96b8d18868cf1e642885064974c86c730b072fcb`  
**230 pass, 0 fail, 0 page errors; 40 topic routes, 147 sampled understandings, 43 screenshots.**

**Workflow:** https://github.com/veyro-lb/litlab/actions/runs/39128768834  
**Download screenshots/JSON/build logs:** https://github.com/veyro-lb/litlab/actions/runs/39128768834/artifacts/12137475623

The authentic artifact ZIP contains `acceptance-commit.txt`, `acceptance-install.log`, `acceptance-build.log`, `acceptance-browser.log`, `qa-artifacts/prelaunch-student-qa/report.json` with per-case audit detail, and 43 actual Chromium-captured PNG files.

Screenshot index:
- **Home at 6 sizes × 2 modes:** `home-{320,390,768,1024,1440,1920}-{light,dark}.png` and `home-entry-1440-light.png`.
- **Long C3.1 lesson:** `reading-C3.1-{320,390,768,1024,1440,1920}-{light,dark}.png`.
- **Representative zoom:** `figure-{A,B,C,D}-1440-enlarged.png`.
- **Mobile licensed image zoom regression:** `licensed-image-mobile-320.png`, `licensed-image-enlarged-320.png`.
- **Exact licensed source listing:** `licensed-image-source-A2.2-1440.png`.
- **Practice feedback:** `practice-{A,B,C,D}-1440.png`.
- **Scrollable comparison table:** `table-D3.2-{320,390}-{light,dark}.png`.
- **Drawing and source panel:** `drawing-A1.1-1440.png`, `sources-A1.1-1440.png`.
- **CSS-only zoom approximation:** `css-zoom-200-1024.png`.

The previous failed artifact remains available at https://github.com/veyro-lb/litlab/actions/runs/39128280928/artifacts/12136881622 for before/after regression evidence.

All screenshot claims are SHA-pinned; they do not certify later unpublished or original PDF-figure changes.
