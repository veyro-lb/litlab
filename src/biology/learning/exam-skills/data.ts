interface PracticePart {
  prompt: string;
  points: string[];
}

export interface PracticeSet {
  id: string;
  title: string;
  context: string;
  caption: string;
  columns: string[];
  rows: (number | string)[][];
  links: [code: string, name: string][];
  parts: PracticePart[];
}

export const practiceSets: PracticeSet[] = [
  {
    id: 'microscopy',
    title: 'Cell division under the microscope',
    context: 'Inspect the onion root image before using the table. The counts are model observations from a separate sampling exercise.',
    caption: 'Model counts from three microscope fields',
    columns: ['Field', 'Total cells', 'Cells in mitosis'],
    rows: [['A', 48, 6], ['B', 52, 9], ['C', 50, 5]],
    links: [['A2.2.2', 'Microscopy skills'], ['D2.1.8', 'Identify stages of mitosis']],
    parts: [
      {prompt: 'State one visible chromosome arrangement that distinguishes anaphase from metaphase.',
        points: ['Anaphase has two separated groups of chromosomes moving apart. In metaphase, chromosomes are aligned near the middle.']},
      {prompt: 'Calculate the pooled percentage of cells in mitosis to one decimal place.',
        points: ['Combine the counts first: 6 + 9 + 5 = 20 mitotic cells out of 150 cells.', '20 ÷ 150 × 100 = 13.3%.']},
      {prompt: 'Explain why the three fields are limited evidence for one estimate of the whole root’s mitotic index.',
        points: ['Cell division varies across root regions; fields from the actively dividing tip can have a higher index.', 'One preparation may be unrepresentative. Sample predefined locations and replicate across several roots.']},
    ],
  },
  {
    id: 'light',
    title: 'Light intensity and photosynthesis',
    context: 'In this model investigation, a plant’s net oxygen production was compared at four light intensities at the same temperature.',
    caption: 'Model mean measurements from three replicates at each light intensity',
    columns: ['Light intensity / μmol photons m⁻² s⁻¹', 'Net oxygen production / μmol min⁻¹'],
    rows: [[50, 0.5], [100, 0.9], [200, 1.5], [400, 1.6]],
    links: [['C1.3.7', 'Vary conditions in photosynthesis'], ['C1.3.8', 'Carbon dioxide enrichment']],
    parts: [
      {prompt: 'Compare the increase in net oxygen production from 50 to 100 with the increase from 200 to 400.',
        points: ['The increases are 0.4 and 0.1 μmol min⁻¹, respectively.', 'The second increase is smaller despite the larger change in light intensity.']},
      {prompt: 'Explain one reason the response might level off.',
        points: ['At high light, another factor such as carbon dioxide availability can limit the overall rate. The graph itself cannot identify which factor limits it.']},
      {prompt: 'Evaluate whether the table establishes that the change from 200 to 400 is reliable.',
        points: ['The table gives means but no spread or measurement uncertainty, so reliability cannot be judged from the means alone.', 'Show replicate values or spread and check the size of the change against measurement uncertainty.']},
    ],
  },
  {
    id: 'energy',
    title: 'Energy transfer in Silver Springs',
    context: 'Use this historical energy-flow dataset from Silver Springs. The reported values are estimates for one ecosystem.',
    caption: 'Energy transfer in Silver Springs · Odum (1957), as reproduced by the US EPA',
    columns: ['Trophic level', 'Energy flow / kcal m⁻² yr⁻¹'],
    rows: [['Producers', 20810], ['Primary consumers', 3368], ['Secondary consumers', 383], ['Tertiary consumers', 21]],
    links: [['C4.2.11', 'Construct an energy pyramid'], ['C4.2.12', 'Explain reductions in available energy']],
    parts: [
      {prompt: 'Calculate the percentage transferred from primary consumers to secondary consumers.',
        points: ['383 ÷ 3,368 × 100 ≈ 11.4%.']},
      {prompt: 'Explain how to represent these data in a pyramid of energy.',
        points: ['Place producers at the base and each consumer level above the level it feeds on.', 'Use bar widths proportional to energy flow on the same scale and label the units.']},
      {prompt: 'Evaluate the claim that the gap between consecutive bars must all represent heat loss.',
        points: ['Respiration can dissipate energy as heat.', 'Uneaten material, waste and dead material can instead transfer energy to detrital pathways. The table does not resolve individual pathways.']},
    ],
  },
  {
    id: 'osmosis',
    title: 'Potato tissue and osmosis',
    context: 'This model compares potato samples after equal immersion times. The standard deviations refer to replicate percentage mass changes.',
    caption: 'Model results for five potato samples per concentration',
    columns: ['Sucrose / mol dm⁻³', 'Mean mass change / %', 'Standard deviation / percentage points'],
    rows: [[0.0, 13.2, 1.4], [0.2, 4.1, 1.2], [0.4, -3.3, 1.5], [0.6, -9.8, 1.8]],
    links: [['D2.3.3', 'Osmosis'], ['D2.3.4', 'Water movement in plant tissue']],
    parts: [
      {prompt: 'Identify the interval containing the estimated zero-mass-change concentration.',
        points: ['Between 0.2 and 0.4 mol dm⁻³, where the mean switches from positive to negative.']},
      {prompt: 'Explain why the sample mass decreased in the most concentrated solution.',
        points: ['The more concentrated solution had a lower water potential than the tissue.', 'Water moved out of the cells by osmosis, reducing sample mass.']},
      {prompt: 'Suggest an improvement that would make the estimate of the zero crossing more precise. Explain how.',
        points: ['Test more closely spaced sucrose concentrations between 0.2 and 0.4 mol dm⁻³.', 'This adds measurements nearer the zero crossing and reduces the concentration interval over which interpolation is needed.']},
    ],
  },
];
