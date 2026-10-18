# Source identification, rights, and preparation

## Accepted sources

| Accepted view(s) | Real source and exact specimen | Rights owner / explicit permission | Imaging and preparation | Scale rule |
|---|---|---|---|---|
| 3 channels of one HT29 human-cell field | CellProfiler `ExampleHuman` TIFFs; exact `AS_09125_050116030001_D03f00d0/1/2.tif` field; human HT29 cultured cells | **David Root**, named as copyright holder by CellProfiler project member [bethac07](https://github.com/CellProfiler/examples/issues/41); image-provider **Jason Moffat**; [CC0 explicitly added to README](https://github.com/CellProfiler/examples/commit/ab40cbdb6068b04a7e02a0a3e08042b37433a97c) | Fluorescence imaging; DAPI-labelled DNA (`d0`), phosphorylated-histone-H3 antibody (`d1`), cell-body channel (`d2`) with fluorophore unspecified; monochrome intensity; image colour is **not natural colour** | No actual µm/px calibration, no magnification-derived size |
| 6-panel cucumber leaf plate (one WebP file) | Vigani et al., 2015, Figure 3, **`Cucumis sativus` cv. Marketer** mesophyll control vs iron-deficient | **© Vigani et al. 2015**, [PLOS ONE article CC BY 4.0](https://doi.org/10.1371/journal.pone.0129141) | Fixed/thin-sectioned, stained TEM; sampled 2D material; some organelle contrast/artefacts depend on preparation | **500 nm each panel bar**, measure within panel only |

## Reproducible upstream links

- Human field: [example directory](https://github.com/CellProfiler/examples/tree/master/ExampleHuman), [README CC0 and Moffat citation](https://github.com/CellProfiler/examples/blob/master/ExampleHuman/README.md), [pipeline for exact channel mapping](https://github.com/CellProfiler/examples/blob/master/ExampleHuman/ExampleHuman.cppipe), [permission discussion](https://github.com/CellProfiler/examples/issues/41), [CellProfiler official human-cell example](https://cellprofiler.org/examples). The owner of the data is **not** assumed from the repository's BSD software licence; explicit image permission is the ground for reuse.
- Cucumber: [original paper](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0129141), [Figure 3](https://journals.plos.org/plosone/article/figure?id=10.1371/journal.pone.0129141.g003), [existing BioLab independent source review](../phase9/MICROSCOPY_PROVENANCE.json).

## What is not licensed for this import

The uploaded IB Biology Guide and Hodder Biology Third Edition are subject to their respective copyright/permissions conditions; screenshots of the illustrations and the separate `IB Biology Drawings.pdf` are **not** approved scientific photography and were **not copied**. Additional Commons/Wellcome images were researched but do not appear in approved assets.

## Source limits

The HT29 TIFFs are 512×512 **one physical field with three channels**; additional RGB synthesis is not included. The CellProfiler `cellbody` channel label does not establish the stain target. Dark and bright regions depend on fluorophore intensity, optical preparation and image-processing/display choices. The cucumber electron microscope produces sectional observations, not natural colour, live cell activity or an exhaustive view of all organelles.
