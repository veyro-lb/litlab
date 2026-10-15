# Phase 3.1 Water scientific and visual cross-check

Status: source-checked draft; qualified scientific, assessment, rights-owner and student usability review remain pending. This author review is not independent human approval.

## Sources actually consulted

1. Supplied official Biology Guide: printed pp. 34–35 / PDF 40–41, extracted again for this milestone; the existing page renderings were available. It sets the six shared + two HL boundaries. No publisher content is embedded.
2. C. J. Clegg, Andrew Davis, Christopher Talbot, *Biology for the IB Diploma*, Third Edition, Hodder Education, 2023, ISBN 9781398364240: entire A1.1 chapter, printed pp. 2–13 / PDF 14–25. Text extracted throughout; PDF p. 22 (printed p. 10) also rendered to inspect the density sentence and its context. Used for conceptual progression, vocabulary, plant/animal examples, common mistakes and connections. Explanations, questions and SVGs are original; no textbook passages, tables, photographs or artwork are redistributed.
3. Supplied independent verification pack dated 16 October 2026: sections 1–10 checked, including C01–C19, misconception register, SVG-S1–S6 and H01–H11. Its repository observation was at older commit `001931210361efea011a3c86363c5d8695389321`; it was treated as research, not a review of the final rendered implementation. Pack fingerprint: e61f76cea80f4731239bc6ab5108c9b9a4beb88c314deda17a402ca379d14517.
4. Existing claim-specific references retained. Direct new checks: USGS density and capillary articles; NOAA ringed-seal page and website photo policy; NASA exact PIA19048 item and NASA media rules; OpenStax Biology preface. References were opened through web search on 2026-10-16 local date (2026-10-15 UTC session). IUPAC PDF and NOAA education activity returned reader errors, so those were not represented as newly verified. The existing chemistry/physics sources and Hodder support school-level mechanisms; no new quantitative viscosity/conductivity dataset was asserted.

### Textbook provenance by understanding

| Understanding | Printed pages | PDF pages | Cross-check references |
| --- | --- | --- | --- |
|A1.1.1|2|14|bio-water, chem-solvent, hodder-2023|
|A1.1.2|3, 4|15, 16|chem-bonds, bio-water, hodder-2023|
|A1.1.3|5, 6|17, 18|plant-water, bio-water, chem-bonds, hodder-2023|
|A1.1.4|7, 8|19, 20|plant-water, bio-water, chem-bonds, hodder-2023|
|A1.1.5|8, 9|20, 21|chem-solvent, bio-water, chem-bonds, hodder-2023|
|A1.1.6|9, 10, 11|21, 22, 23|buoyancy, viscosity, heat, conduction, seal, divers, hodder-2023, density-usgs|
|A1.1.7|11, 12|23, 24|bennu, origin-update, habitable, early-earth, origin-2026, hodder-2023|
|A1.1.8|12, 13|24, 25|habitable, europa, hodder-2023|

Textbook fingerprint: 31f66df7a23312b1a9d60c6ab70f9073a246bac7d108ef4b2bbd33312f533b78. Source page offsets were checked against printed folios, not assumed for other textbooks.

## Findings and disposition

| Evidence / discrepancy | Disposition in the lesson |
| --- | --- |
| Hodder p. 10 says lowest density near 4°C | Incorrect. New labeled enrichment uses **maximum density of pure liquid water near 4°C at ordinary atmospheric pressure**, corroborated by USGS. Existing LitLab did not contain the textbook’s reversed claim. Seawater caveat included. |
| Hodder p. 9 density ratio “784” does not match its table (998.21 / 1.204 ≈ 829) | Do not reproduce the ratio or table. Qualitative equal-displaced-volume comparison is sufficient. |
| Hodder p. 9 conductivity header omits inverse length | LitLab uses W m⁻¹ K⁻¹, distinct from heat capacity J kg⁻¹ K⁻¹ and dynamic viscosity Pa s. No universal animal cooling-rate multiplier. |
| Hodder p. 6 liquid surface diagram/caption can suggest a fixed hexagonal lattice | Do not copy. LitLab describes a dynamic liquid network and deformable interface, with no solid skin. |
| Hodder p. 11 origin prose is more categorical than the evidence warrants | Required asteroid route remains a hypothesis; relative sources are uncertain. Modern research and Europa context labeled enrichment. No additional origin mechanism required for a correct core answer. |
| Verification pack SVG-S1 specifies “O–H–O angle” of 104.5° | Correct notation is **H–O–H**, about the central oxygen. Both existing and mobile diagrams use the bent H₂O geometry. |
| Verification pack flags photo rights pending | The pack had not cleared specific bytes. This milestone rechecked exact NOAA and NASA assets and policies, with credit and fingerprint records below. This is source-policy checking, not legal sign-off. |
| Hydrophilic is not identical to soluble; viscosity is not total drag; conductivity is not heat capacity | Added explicit teaching and corrective feedback. Hydrophobic association is not described as an invented repulsive force. |

## C01–C19 crosswalk and teaching changes

| Pack claims | Understanding | Implementation and review outcome |
| --- | --- | --- |
| C01 | A1.1.1 | Added dry-mixture versus mobile aqueous reactants; separated dissolution, catalysis and membrane-associated enzymes. Origin location/pathway remains uncertain. |
| C02–C03 | A1.1.2 | Added three-step charge reasoning and warming versus molecular decomposition. Neutral bent H₂O, partial charges and solid/dashed distinction retained. Mobile SVG makes labels readable. |
| C04–C06 | A1.1.3 | Traces leaf evaporation → negative pressure/tension → cohesive continuity. Surface habitat remains distinct from buoyancy; dynamic interactions, no rigid skin. |
| C07–C08 | A1.1.4 | Explains cellulose hydroxyl interactions and finite force balance. Soil and plant-wall examples retained. Capillarity is not tall-tree ascent by itself. |
| C09–C10 | A1.1.5 | Hydration orientation, saturation and interaction balance expanded. Hydrophilicity versus dissolution and hydrophobic compartment formation made explicit. |
| C11–C15 | A1.1.6 | Four separate mechanisms, conditions, units, animal consequences and confounders. Seal blubber/loon feet/plumage are example applications; common names acceptable. No fixed physiological cooling ratio. |
| C16–C17 | A1.1.7 | Asteroid-delivery hypothesis, gravitational retention and condensation remain assessed scope. Research context labeled enrichment. |
| C18–C19 | A1.1.8 | Possible surface water conditional on atmosphere; detection of water ≠ ocean ≠ life. Europa image is surface ice. Extension clearly labeled. |

The pack’s more elaborate figures and new question bank were proposals, not mandatory replacements. Existing defensible assets, 8 embedded checks, 16 recalls and 15 original practice tasks were preserved. Four MCQs had implausible distractors replaced with meaningful conceptual confusions. Written responses still award no automatic marks. Every practice and embedded activity has valid understanding IDs. All 8 checks, 16 recall answers, 10 MCQ answer keys and distractor explanations, 2 illustrative data calculations and 3 written marking guides were read during this pass. The two calculations remain 4:1 capillary-rise ratio and approximately 2.38 K / 10 K; marks are provisional self-review points.

## Figure review and exact asset policy evidence

Original figures use the project’s original SVGs; none is a traced publisher panel or generated raster. Desktop figures retained. Six narrower original variants and six recall variants introduced. Hydrogen-bond orientation is H···O across different molecules, not H···H; mobile hydration diagrams show selected dynamic orientations, not permanent shells. Cohesion circles are schematic liquid parcels, not complete molecular structures. Capillary panels are explicitly idealized models; soil/wall mechanisms are explained in adjacent text. Habitat properties use matched qualitative comparisons, not arbitrary numerical scales. Delivery image depicts a possible contribution.

Original figure rights record: project-authored artwork with third-party scientific citations; the repository does not establish a new blanket public reuse license. Qualified review remains pending. Full-size links and written descriptions accompany every figure. Color is supplemented with line pattern, atom symbols and words.

| Photo | Exact source and credit | Basis / limits |
| --- | --- | --- |
| ringed-seal.jpg | https://www.fisheries.noaa.gov/species/ringed-seal ; https://www.fisheries.noaa.gov/s3/dam-migration/ringed-seal.jpg ; NOAA Alaska Fisheries Science Center / John Jansen | Exact credited item checked. NOAA-created images may be reused under https://www.fisheries.noaa.gov/national/about-us/website-policies-and-disclaimers ; NOAA credit retained. Government-work basis is stated for the US, not invented worldwide CC licensing. No logo or endorsement. |
| europa.jpg | https://science.nasa.gov/resource/europas-stunning-surface/ ; https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/e/EuropaStunningSurface1200w.jpg ; NASA/JPL-Caltech/SETI Institute, PIA19048 | Exact credit and Galileo mosaic identification checked. Factual educational display under https://www.nasa.gov/nasa-brand-center/images-and-media/ ; acknowledgement retained, no endorsement; third-party exceptions remain relevant. No separate copyright restriction observed on this item. Image shows surface ice, not ocean/life. |

OpenStax current Biology preface: https://openstax.org/books/biology-2e/pages/preface specifies CC BY-NC-SA and additional AI-use conditions. It is a scientific citation, **not an asset feed or permission to copy content**. No OpenStax panels, publisher wording, questions or media were imported. Future third-party derivatives need asset-specific clearance.

### Shipped file fingerprints

| File | SHA-256 |
| --- | --- |
| bonding-mobile-recall.svg | `db44f6d3c3164764d29c18cda088d7f1bdd731f700a8653115c3484a6c213b19` |
| bonding-mobile.svg | `4a159acd71d15d996ff17d880ab1d9233469cbc6447b24afaab973622c715b74` |
| bonding-recall.svg | `fab9e171b2460bc742acefa413d2c7c181ee1ab3cce1b2e199d5566035899e72` |
| bonding.svg | `7a471ce0a3664082b9edf40db9a85cd51f3ab8bea48fd5e0c347ebac01cf9142` |
| capillary-mobile-recall.svg | `caa831e97fc115af9d70f6802d2e87ab9179d56506be785047b7df2872d38877` |
| capillary-mobile.svg | `d9ff6957969c7ce382cabb11624ff645a3b9925579f58ee92125ca16676163a6` |
| capillary-recall.svg | `1365b9bc87435a80e59e70dc0bc01b38db283402445f71c0bae05590ae61e356` |
| capillary.svg | `3890007ae695516e22e4f7888abf0d64031d0d5c41f0e38c025bff6305b66f26` |
| cohesion-mobile-recall.svg | `d6f8af09a5486d7db29322e1b52f5f750d79fe2da1741c30e224a6eaf30bc8ed` |
| cohesion-mobile.svg | `1845aa9c704dd8086489140671a941157f74968d02884421c76d10174b84a942` |
| cohesion-recall.svg | `cd5274e3c88fc615b25da245d69f50dd1d4d3e05c1fa867b24de638679704c4f` |
| cohesion.svg | `240585b9a3a8a6b9843fb114420dbd4b8b3642e21c2a83f769f0e833deb8f03d` |
| delivery-mobile-recall.svg | `2886a78b57a5567936496ea4e2f00859e687bfb6058e37c70d36fa9913e76bb3` |
| delivery-mobile.svg | `9523ed71ed05aa1b686c3ac3c704473a942c4e2e2ba4237c0fa10957d4dfe593` |
| delivery-recall.svg | `a0c780ff7af06fa2018973c610c314035ec3a854c80aeca45b867011d8401ceb` |
| delivery.svg | `c086182c1d3e20ab55dd8466840a3607a5ccc6600fc95c02c736197eed2edef3` |
| europa.jpg | `5c3f79a9bb90d7e8bca8de271a4ca724cf0e1b78f7f8123517e1cf69698563b6` |
| habitat-mobile-recall.svg | `0277768b2a1e4aa8136b2d7821f1a2a17543c917f7adbfe807ff7e9f98e965ad` |
| habitat-mobile.svg | `a938fb8ec273c5e73a02091d8012ddfef9e59ab20a65fdde162c2ec55b9deb8f` |
| habitat-recall.svg | `cfc311f20f04e94e09d351b22c497f9548754ba958f9fb094d149f7980022879` |
| habitat.svg | `9ae1af7f9be12716fdb3ce2e97267719fb6a831aa7187d6d0df494a13b5e880e` |
| hydration-mobile-recall.svg | `65fee2261fc57c0313b4431a230c61740a6dbe96239bc3567f5419705761c68e` |
| hydration-mobile.svg | `a5f2a9d663f61a3edbb415645cb0d5942eb33819ebe9c2a0a3fcef1679077104` |
| hydration-recall.svg | `5905807e8e430121b08343baa1283276c0ccfb82d935f6a07be0cb396e9a9458` |
| hydration.svg | `9dc383cc8e249ff9f8d006e0a3a8e91dfe1e746477ef93184406fafb13855990` |
| ringed-seal.jpg | `cea07f71a6320662b88075d12841067514ffc117cf65bcd36633223de83839b9` |

## Human gates still open

H01–H06: qualified IB/science review of exact final content and figures; H07: rights owner review for public release; H08: assistive-technology review; H09: independent assessment editing; H11: student usability/comprehension sessions. H10 source checks performed with the limitations noted above. No reviewer identity, classroom result or approval was fabricated. These block public approval, not the preparation of isolated source-checked drafts after technical checks pass.
