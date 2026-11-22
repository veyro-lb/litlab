type Takeaway = readonly [label: string, text: string];

interface CheatSheetContent {
  essentials: readonly Takeaway[];
  exam: string;
  hl?: Takeaway;
  formula?: Takeaway;
}

// Original condensed notes aligned to the topic's syllabus scope.
export const cheatSheets: Record<string, CheatSheetContent> = {
  'A1.1': {
    essentials: [
      ['Polarity → hydrogen bonding', 'Oxygen pulls shared electrons more strongly than hydrogen. A bent water molecule has partial charges, so neighbouring molecules attract.'],
      ['Cohesion vs adhesion', 'Cohesion holds water molecules together in a xylem column. Adhesion attracts water to polar or charged surfaces.'],
      ['Solvent and habitat', 'Water surrounds ions and many polar solutes. High specific heat capacity buffers temperature, and buoyancy supports aquatic organisms.'],
    ],
    exam: 'Draw solid lines for covalent O–H bonds inside a molecule and dashed lines for hydrogen bonds between molecules.',
    hl: ['Water beyond Earth', 'Hydrated material supports the possibility of water delivery. Retaining liquid water also depends on planetary conditions.'],
  },
  'A1.2': {
    essentials: [
      ['Nucleotide', 'One phosphate group, one pentose sugar and one nitrogenous base. Covalent links form the sugar–phosphate backbone.'],
      ['DNA vs RNA', 'DNA usually has two antiparallel strands, deoxyribose and thymine. RNA usually has one strand, ribose and uracil.'],
      ['Complementary pairing', 'A pairs with T in DNA or U in RNA; C pairs with G. Complementarity allows copying and transcription. Base order carries information.'],
    ],
    exam: 'Before giving a complementary DNA sequence, check which direction the question asks you to write it in.',
    hl: ['Direction and packaging', 'A new strand grows 5′ → 3′. Eukaryotic DNA wraps around histone cores to form nucleosomes.'],
  },
  'A2.1': {
    essentials: [
      ['From chemistry to compartments', 'Abiotic reactions can produce organic molecules. Fatty acids can self-assemble into vesicles that separate an interior from the surroundings.'],
      ['RNA world hypothesis', 'RNA can store information and some RNA molecules catalyse reactions. These properties make RNA a candidate for early inheritance and catalysis.'],
      ['Common ancestry', 'The shared genetic code and conserved cellular machinery support common ancestry. Geological and molecular evidence constrain estimates of early life.'],
    ],
    exam: 'State what each experiment or observation supports. The formation of organic molecules alone does not establish that a living cell formed.',
  },
  'A2.2': {
    essentials: [
      ['Common structures', 'Cells have a plasma membrane, cytoplasm, DNA and ribosomes. Prokaryotes lack a membrane-bound nucleus.'],
      ['Eukaryotic cells', 'Plant cells have cellulose walls and often chloroplasts. Fungal cells have chitin walls. Animal cells lack cell walls.'],
      ['Reading micrographs', 'Resolution is the ability to distinguish nearby points. An electron microscope can resolve finer details than a light microscope.'],
    ],
    formula: ['Magnification', 'Magnification = image size ÷ actual size. Convert both sizes to the same units first.'],
    exam: 'Use visible evidence to identify a structure. A larger image alone is not evidence of better resolution.',
    hl: ['Endosymbiosis', 'Mitochondria and chloroplasts have features consistent with bacterial ancestry, including their own DNA and ribosomes.'],
  },
  'A2.3': {
    essentials: [
      ['Core features', 'A viral genome is DNA or RNA enclosed in a protein capsid. Some viruses also have a lipid envelope.'],
      ['Dependence on cells', 'Viruses rely on host cells for reproduction. In a lytic outcome the host cell breaks open. A temperate phage genome can persist during lysogeny.'],
      ['Evolution and origins', 'Sequence variation and selection can change viral populations. Different groups may have different evolutionary origins.'],
    ],
    exam: 'Distinguish a capsid from an envelope, and specify whether a feature is shared by all viruses or only some.',
  },
  'A3.1': {
    essentials: [
      ['Naming species', 'Write genus first and species epithet second. Capitalize the genus and italicize both words when typed.'],
      ['Species boundaries', 'The biological species concept uses interbreeding and reproductive isolation. Closely related populations can be difficult to classify during divergence.'],
      ['Chromosomes and genomes', 'Karyograms show chromosome number and visible structure. Sequencing identifies base order. Genomes vary both within and between species.'],
    ],
    exam: 'A chromosome count alone cannot identify a species or measure how closely two species are related.',
    hl: ['Identification keys', 'Follow paired choices using observable characteristics until you reach an identification.'],
  },
  'A3.2': {
    essentials: [
      ['Clades', 'A clade contains a common ancestor and all its descendants. A node represents a shared ancestor.'],
      ['Read relationships at nodes', 'Two groups are more closely related if they share a more recent common ancestor. Rotating branches around a node preserves those relationships.'],
      ['Molecular evidence', 'Comparing homologous DNA or protein sequences can inform trees. Ribosomal RNA sequence evidence supports the three-domain classification.'],
    ],
    exam: 'Compare the most recent shared nodes. The order of names at the tips is irrelevant to relatedness.',
  },
  'A4.1': {
    essentials: [
      ['Evolution', 'Heritable characteristics change across generations in a population. Sequence similarities and homologous structures can support common ancestry.'],
      ['Homology vs analogy', 'Homologous structures derive from a shared ancestral feature. Analogous features can evolve independently under similar selection pressures.'],
      ['Speciation', 'Reduced gene flow allows populations to diverge. Reproductive isolation prevents the populations from freely exchanging genes.'],
    ],
    exam: 'For a speciation explanation, connect restricted gene flow to divergence and the development of reproductive barriers.',
    hl: ['Routes to isolation', 'Allopatric speciation involves a geographic barrier. Sympatric speciation occurs without geographic separation; polyploidy can produce isolation in plants.'],
  },
  'A4.2': {
    essentials: [
      ['Three levels', 'Genetic diversity is variation within species. Species diversity concerns species in a community. Ecosystem diversity concerns the variety of habitats and systems.'],
      ['Drivers of loss', 'Habitat loss, overexploitation, invasive species, pollution and climate change can reduce biodiversity. Identify the direct effect in the case given.'],
      ['Conservation', 'In situ conservation protects organisms in their habitats. Ex situ approaches preserve populations or genetic material outside those habitats.'],
    ],
    exam: 'When evaluating a conservation strategy, link it to the threat it addresses and identify a limitation.',
  },
  'B1.1': {
    essentials: [
      ['Making and breaking bonds', 'Condensation forms a bond and releases water. Hydrolysis uses water to break a bond.'],
      ['Glucose polymers', 'Starch and glycogen store glucose. Cellulose consists of β-glucose chains that form strong fibres in plant cell walls.'],
      ['Lipid structure and role', 'Triglycerides store energy. Amphipathic phospholipids form bilayers in water. Unsaturated fatty acids contain one or more C=C bonds.'],
    ],
    exam: 'Link a structural difference to a function. For example, hydrogen bonding between straight cellulose chains helps form strong fibres.',
  },
  'B1.2': {
    essentials: [
      ['Amino acids', 'An amino acid contains an amino group, carboxyl group and variable R group. Essential amino acids must be obtained in the diet.'],
      ['Peptide bonds', 'Condensation joins amino acids into polypeptides. Changing the amino-acid sequence can affect folding and function.'],
      ['Denaturation', 'Heat or extreme pH can change a protein’s shape and function by disrupting interactions that maintain its folded structure.'],
    ],
    exam: 'Distinguish denaturation from hydrolysis of peptide bonds. A change in shape can occur while the amino-acid sequence remains intact.',
    hl: ['Four levels of structure', 'Primary is the sequence, secondary is local folding, tertiary is the overall fold of one chain, and quaternary is the assembly of multiple chains.'],
  },
  'B2.1': {
    essentials: [
      ['Fluid mosaic membrane', 'Phospholipids form a selectively permeable bilayer with mobile lipids and proteins. Surface carbohydrates contribute to recognition.'],
      ['Passive transport', 'Small nonpolar molecules can diffuse through the bilayer. Channels and carriers allow facilitated diffusion down gradients. Aquaporins facilitate water movement.'],
      ['Active transport', 'Transport proteins can move substances against a gradient using energy. For ions, consider both concentration and charge.'],
    ],
    exam: 'A membrane protein can mediate passive transport. Decide whether movement is down or against the relevant gradient.',
    hl: ['Coupled transport', 'A pump can establish an ion gradient. Movement down that gradient can drive another substance against its own gradient.'],
  },
  'B2.2': {
    essentials: [
      ['Organelles', 'Specialized cell structures carry out particular functions. Membrane-bound compartments maintain conditions suited to particular reactions.'],
      ['Nucleus and cytoplasm', 'Separating transcription from translation allows control over which RNA reaches cytoplasmic ribosomes.'],
      ['Why compartments help', 'Compartments concentrate enzymes and substrates, maintain chemical gradients and keep incompatible processes apart.'],
    ],
    exam: 'Identify what the compartment controls, then explain how that helps the process run.',
    hl: ['Secreted proteins', 'Ribosomes at rough ER make many secreted proteins. Vesicles move cargo to the Golgi for processing and sorting, then towards the cell surface.'],
  },
  'B2.3': {
    essentials: [
      ['Differentiation', 'Cells with the same genome can express different sets of genes and develop different structures and functions.'],
      ['Stem cell potency', 'Totipotent cells can form embryonic and extraembryonic tissues. Pluripotent cells form body cell types. Multipotent cells form a narrower set.'],
      ['Exchange and cell size', 'As a similarly shaped cell grows, volume rises faster than surface area. Flattening or folding can increase area relative to volume.'],
    ],
    exam: 'For a specialized cell, give the feature, its immediate physical effect and the resulting benefit for the cell’s function.',
    hl: ['Structure–function examples', 'Microvilli expand absorptive area. Thin alveolar cells shorten diffusion distance. Gamete structures suit their distinct roles.'],
  },
  'B3.1': {
    essentials: [
      ['Exchange surfaces', 'Large area, short diffusion distances and steep gradients help gases move rapidly. Ventilation and blood flow help maintain gradients in lungs.'],
      ['Ventilation', 'During inhalation, thoracic volume increases and air pressure in the lungs falls below atmospheric pressure. Air flows in.'],
      ['Leaves', 'Stomata let gases diffuse between air and the leaf. Internal air spaces improve access to mesophyll cells. Water vapour also escapes through stomata.'],
    ],
    formula: ['Stomatal density', 'Stomatal density = number of stomata ÷ area sampled. Include the area unit, such as stomata mm⁻².'],
    exam: 'For ventilation, state the sequence from muscle action to volume change, pressure change and airflow.',
    hl: ['Foetal haemoglobin', 'Foetal haemoglobin has a higher oxygen affinity than adult haemoglobin at a given oxygen partial pressure, aiding oxygen transfer across the placenta.'],
  },
  'B3.2': {
    essentials: [
      ['Blood vessels', 'Arteries carry blood away from the heart under higher pressure. Vein valves help prevent backflow. Capillaries have thin walls for exchange.'],
      ['Coronary circulation', 'Narrowing or blockage of coronary arteries can reduce oxygen supply to heart muscle.'],
      ['Xylem', 'Water evaporates from leaves, creating tension. Cohesion transmits the pull down the water column. Lignified walls help vessels withstand tension.'],
    ],
    exam: 'Define arteries and veins by direction relative to the heart. Oxygen content is not the defining feature.',
    hl: ['Xylem vs phloem', 'Xylem carries water under tension. Phloem moves assimilates from source to sink by pressure flow.'],
  },
  'B3.3': {
    essentials: [
      ['Sliding filaments', 'Actin slides past myosin and the sarcomere shortens. Filament lengths stay constant.'],
      ['Cross-bridge cycle', 'Calcium exposes binding sites on actin. Myosin binds and pulls. ATP binding allows detachment.'],
      ['Whole-body movement', 'A motor unit contains one motor neuron and the fibres it innervates. Antagonistic muscles act across joints to produce opposite movements.'],
    ],
    exam: 'During contraction, the I band and H zone narrow while the A band stays the same length.',
  },
  'B4.1': {
    essentials: [
      ['Habitat and tolerance', 'A habitat is where an organism lives. Its distribution depends in part on the range of abiotic conditions it can tolerate.'],
      ['Terrestrial biomes', 'Temperature and rainfall help determine large-scale biome patterns. Similar climates can favour similar adaptations in unrelated species.'],
      ['Environmental examples', 'Warm, shallow, clear water favours many reef-building corals. Desert plants may reduce water loss using small leaves, waxy surfaces or modified photosynthesis.'],
    ],
    exam: 'Use the specific abiotic factor to explain how a feature improves survival in that habitat.',
  },
  'B4.2': {
    essentials: [
      ['Niche', 'A niche includes a species’ resource use, tolerances and interactions. The realized niche reflects constraints such as competition.'],
      ['Nutrition', 'Photoautotrophs use light to make organic compounds. Holozoic feeders ingest food, saprotrophs digest externally, and mixotrophs combine modes.'],
      ['Competition and adaptation', 'Species that depend on the same limiting resources may compete. Differences in resource use can reduce overlap and permit coexistence.'],
    ],
    exam: 'Use habitat for the place an organism lives and niche for how it lives and interacts there.',
  },
  'C1.1': {
    essentials: [
      ['Catalysis', 'Enzymes lower activation energy. Binding can change active-site shape through induced fit. Enzymes do not change the reaction equilibrium.'],
      ['Metabolism', 'Anabolism builds complex molecules and requires energy input. Catabolism breaks molecules down and can release energy.'],
      ['Rate curves', 'Higher temperature initially increases collisions. Beyond the optimum, denaturation can reduce activity. At high substrate concentration, active sites can become saturated.'],
    ],
    formula: ['Initial reaction rate', 'Use the magnitude of the gradient near the start of the product or substrate graph. Include the units given by its axes.'],
    exam: 'A plateau as substrate concentration rises can indicate saturated active sites. It does not by itself show denaturation.',
    hl: ['Inhibition and feedback', 'Competitive inhibitors interact at the active site. In feedback inhibition, a pathway product reduces activity of an earlier enzyme.'],
  },
  'C1.2': {
    essentials: [
      ['Energy transfer', 'ATP hydrolysis to ADP and phosphate can be coupled to processes such as active transport, movement and biosynthesis.'],
      ['Aerobic vs anaerobic', 'In humans, aerobic respiration yields more ATP per glucose and uses oxygen. Lactate formation regenerates NAD⁺ so glycolysis can continue without oxygen.'],
      ['Measuring respiration', 'Use changes in oxygen uptake or carbon dioxide output over time, with controls appropriate to the method.'],
    ],
    exam: 'Specify the organism when naming anaerobic products. Oxygen is used in aerobic respiration, and ATP is produced in both pathways.',
    hl: ['Aerobic pathway', 'Glycolysis produces pyruvate. The link reaction and Krebs cycle produce reduced carriers. Electron transport builds a proton gradient that drives ATP synthase.'],
  },
  'C1.3': {
    essentials: [
      ['Energy and matter', 'Light energy is transferred to chemical energy. Plants fix carbon dioxide into organic compounds, and oxygen released comes from water.'],
      ['Pigments and spectra', 'An absorption spectrum shows light absorbed by a pigment. An action spectrum shows how effectively wavelengths drive photosynthesis.'],
      ['Limiting factors', 'Light intensity, carbon dioxide and temperature can limit the rate. A plateau can occur when another factor becomes limiting.'],
    ],
    formula: ['Chromatography', 'Rf = distance travelled by pigment ÷ distance travelled by solvent front. Measure both from the origin.'],
    exam: 'When explaining a limiting-factor graph, identify which change still increases the rate under those conditions.',
    hl: ['Light reactions and carbon fixation', 'Light reactions supply ATP and reduced NADP. The Calvin cycle fixes CO₂, reduces intermediates and regenerates RuBP.'],
  },
  'C2.1': {
    essentials: [
      ['Specific reception', 'A target responds when it has a suitable receptor. Ligand binding changes receptor activity and initiates a cellular response.'],
      ['Receptor location', 'Many hydrophilic signals bind surface receptors. Lipid-soluble steroid signals can reach intracellular receptors and influence transcription.'],
      ['Transduction', 'An activated receptor may open a channel, activate a G protein or trigger a phosphorylation cascade. A small signal can produce a larger response.'],
    ],
    exam: 'Trace the path from ligand to receptor to intracellular event to response. The type of receptor determines the next step.',
  },
  'C2.2': {
    essentials: [
      ['Resting and action potentials', 'Ion gradients and selective membrane permeability create a resting potential. At threshold, an action potential travels along the axon.'],
      ['Speed of conduction', 'Myelination speeds conduction because action potentials regenerate at nodes. Larger axon diameter also generally increases speed.'],
      ['Chemical synapse', 'An incoming action potential triggers calcium entry and transmitter release. Transmitter binds postsynaptic receptors and changes membrane potential.'],
    ],
    exam: 'Separate electrical conduction along an axon from chemical transmission across a synapse.',
    hl: ['Voltage-gated channels', 'Na⁺ entry depolarizes the membrane; K⁺ exit repolarizes it. Channel inactivation contributes to the refractory period.'],
  },
  'C3.1': {
    essentials: [
      ['Coordination', 'Neural signals travel along defined pathways. Blood distributes hormones widely, and tissues respond when they have the relevant receptors.'],
      ['Reflex arc', 'Receptor → sensory neuron → central processing → motor neuron → effector. A withdrawal response can occur before conscious awareness.'],
      ['Feedback in organ systems', 'Sensors report changes, integrating centres process signals, and effectors adjust responses such as heart rate or ventilation.'],
    ],
    exam: 'Name the receptor or signal, coordinating centre and effector in the example given, then say what changes.',
    hl: ['Feedback direction', 'Negative feedback opposes a change. Positive feedback amplifies the initiating change until a limiting event intervenes.'],
  },
  'C3.2': {
    essentials: [
      ['First and innate defences', 'Skin and mucous membranes form barriers. Clotting seals wounds. Phagocytes engulf material as part of innate defence.'],
      ['Adaptive immunity', 'Activated B cells proliferate. Plasma cells secrete specific antibodies and memory cells enable a faster later response.'],
      ['Protection and resistance', 'Vaccination can build immune memory. Antibiotics act on bacteria, and selection can increase the frequency of resistant variants.'],
    ],
    exam: 'Antigens are recognized targets. Antibodies are proteins that bind specific antigens.',
  },
  'C4.1': {
    essentials: [
      ['Population sampling', 'Use random quadrats for sessile organisms and mark–release–recapture for many mobile populations. A sample is used to estimate the population.'],
      ['Growth and limits', 'Growth can be rapid when resources are abundant. Density-dependent effects such as competition can slow growth near carrying capacity.'],
      ['Species interactions', 'Mutualism benefits both partners. Predation, herbivory and parasitism benefit one partner at a cost to the other. Competition can reduce success for both.'],
    ],
    formula: ['Lincoln index', 'Estimated population = first catch × second catch ÷ marked individuals recaptured.'],
    exam: 'Check the sampling assumptions. An association between species does not by itself establish a causal interaction.',
  },
  'C4.2': {
    essentials: [
      ['Energy flows', 'Producers capture energy and make organic compounds. Feeding moves chemical energy between trophic levels. Respiration releases energy as heat.'],
      ['Matter cycles', 'Decomposers obtain energy from organic matter and return nutrients. Photosynthesis, respiration and combustion move carbon among reservoirs.'],
      ['Sources and sinks', 'A reservoir is a net carbon sink if it takes up more carbon than it releases over the stated interval.'],
    ],
    formula: ['Trophic transfer efficiency', 'Transfer efficiency = production at the next level ÷ production at the previous level × 100%. Use comparable units and intervals.'],
    exam: 'Food web arrows point from the resource to its consumer. Use units of energy per area per time for an energy pyramid.',
  },
  'D1.1': {
    essentials: [
      ['Semi-conservative replication', 'Each daughter DNA molecule contains one parental strand and one newly synthesized strand.'],
      ['Enzyme roles', 'Helicase separates strands. DNA polymerase builds a new strand using complementary base pairing.'],
      ['DNA analysis', 'PCR increases the amount of a selected DNA region. Gel electrophoresis separates DNA fragments, commonly by size.'],
    ],
    exam: 'Explain semi-conservative replication by identifying the old and new strands in each daughter molecule.',
    hl: ['Leading vs lagging', 'DNA synthesis proceeds 5′ → 3′. This makes leading-strand synthesis continuous and lagging-strand synthesis discontinuous at a replication fork.'],
  },
  'D1.2': {
    essentials: [
      ['DNA → RNA', 'RNA polymerase uses a DNA template to make complementary RNA. RNA uses uracil in place of thymine.'],
      ['RNA → polypeptide', 'A ribosome reads mRNA codons. tRNA anticodons pair with codons and deliver amino acids. Peptide bonds join the amino acids.'],
      ['Reading a codon table', 'Read mRNA 5′ → 3′, identify the reading frame and stop at a stop codon. Multiple codons can specify the same amino acid.'],
    ],
    exam: 'Use mRNA codons in the genetic-code table, rather than DNA triplets or tRNA anticodons.',
    hl: ['RNA processing', 'Eukaryotic pre-mRNA can be capped, polyadenylated and spliced. Alternative splicing allows one gene to produce different transcripts.'],
  },
  'D1.3': {
    essentials: [
      ['Substitutions', 'A substitution can leave an amino acid unchanged, change it or introduce a stop codon. Its effect depends on where it occurs.'],
      ['Insertions and deletions', 'An insertion or deletion within a coding region can shift the reading frame when the number of bases changed is not a multiple of three.'],
      ['Inheritance and selection', 'Germ-line mutations can be passed to descendants. Mutations generate variation without anticipating what will be advantageous.'],
    ],
    exam: 'Check the change in the reading frame and codons before predicting the effect on a polypeptide.',
    hl: ['Gene editing', 'Targeted editing aims to change a selected DNA sequence. Identifying the resulting sequence and phenotype are separate checks.'],
  },
  'D2.1': {
    essentials: [
      ['Before division', 'DNA replicates before mitosis or meiosis I. A replicated chromosome has two sister chromatids. Cytokinesis divides the cytoplasm.'],
      ['Mitosis vs meiosis', 'Mitosis separates sister chromatids and usually preserves chromosome number. Meiosis I separates homologues, and meiosis II separates sister chromatids.'],
      ['Sources of variation', 'Crossing over and independent assortment generate variation in meiosis. Nondisjunction can produce gametes with abnormal chromosome numbers.'],
    ],
    exam: 'Count chromosomes using centromeres. DNA replication doubles DNA content without changing chromosome number.',
    hl: ['Cell-cycle regulation', 'Checkpoints help control progression through the cell cycle. Loss of control can contribute to tumour formation.'],
  },
  'D2.2': {
    essentials: [
      ['Levels of control', 'DNA-binding regulatory proteins affect transcription. mRNA stability affects how long a transcript remains available for translation.'],
      ['Three information layers', 'Genome = DNA sequences. Transcriptome = RNAs expressed at a given time. Proteome = proteins present at a given time.'],
      ['Epigenetic effects', 'DNA methylation and histone modifications can change gene expression without changing the DNA base sequence.'],
    ],
    exam: 'A difference in expression does not by itself show a difference in DNA sequence. Use evidence at the relevant information layer.',
  },
  'D2.3': {
    essentials: [
      ['Osmosis', 'Water moves across a selectively permeable membrane towards lower water potential. In comparable conditions, dissolved solutes lower water potential.'],
      ['Cells without walls', 'An animal cell swells in a hypotonic solution and shrinks in a hypertonic solution. In an isotonic solution there is no net change in volume.'],
      ['Plant cells', 'Water entry increases turgor as the wall resists expansion. Water loss can lead to plasmolysis when the cell contents pull away from the wall.'],
    ],
    exam: 'Identify the reference cell or solution before using hypotonic, isotonic or hypertonic.',
    hl: ['Water potential equation', 'Ψ = Ψs + Ψp. Solute potential is zero or negative. Net water movement is from higher to lower total water potential.'],
  },
  'D3.1': {
    essentials: [
      ['Life cycles', 'Asexual reproduction uses one parent without gamete fusion. Sexual reproduction restores diploidy at fertilization and generates genetic variation.'],
      ['Human reproductive cycle', 'An LH surge triggers ovulation. Progesterone from the corpus luteum helps maintain the uterine lining after ovulation.'],
      ['Flowering plants', 'Pollination transfers pollen to a stigma. Fertilization occurs after a pollen tube delivers male gametes. The ovule develops into a seed.'],
    ],
    exam: 'Keep pollination, fertilization and dispersal distinct. Each moves or joins different structures at a different stage.',
    hl: ['Early pregnancy', 'The blastocyst implants in the endometrium. Early hCG maintains the corpus luteum, supporting continued progesterone secretion.'],
  },
  'D3.2': {
    essentials: [
      ['From alleles to traits', 'Meiosis separates alleles into gametes. Fertilization combines parental alleles. Phenotype can depend on both genotype and environment.'],
      ['Inheritance patterns', 'In codominance both alleles are expressed in the heterozygote. With incomplete dominance, the heterozygote has an intermediate phenotype.'],
      ['Pedigrees and variation', 'Test each proposed inheritance pattern against all individuals shown. Many genes and environmental effects can produce continuous variation.'],
    ],
    exam: 'Write parental genotypes and possible gametes before giving the expected ratio. State whether the ratio describes genotypes or phenotypes.',
    hl: ['Linkage', 'Genes on the same chromosome can be inherited together. Crossing over can generate recombinant allele combinations.'],
  },
  'D3.3': {
    essentials: [
      ['Negative feedback', 'A change from the normal range is detected. Effectors respond in a way that opposes the change.'],
      ['Blood glucose', 'Insulin lowers elevated blood glucose by promoting uptake and storage. Glucagon promotes glucose release when blood glucose falls.'],
      ['Thermoregulation', 'Sweating and skin vasodilation increase heat loss. Shivering increases heat production, while vasoconstriction reduces heat loss.'],
    ],
    exam: 'Name the original change and explain how the response acts in the opposite direction.',
    hl: ['Kidney regulation', 'When blood water potential falls, increased ADH makes collecting ducts more permeable to water, so more is reabsorbed.'],
  },
  'D4.1': {
    essentials: [
      ['Variation comes first', 'Mutation creates new alleles. Sexual reproduction reshuffles alleles. Selection acts on differences that already exist.'],
      ['Differential reproduction', 'Under a particular selection pressure, individuals with advantageous heritable traits tend to contribute more offspring to later generations.'],
      ['Population-level change', 'Over generations, alleles associated with greater reproductive success can become more frequent. A trait’s advantage depends on the environment.'],
    ],
    exam: 'Show variation, selection pressure, differential reproductive success and inheritance. Individuals do not evolve in response to need.',
    hl: ['Selection patterns', 'Directional selection favours one extreme, stabilizing selection favours intermediates, and disruptive selection favours both extremes.'],
  },
  'D4.2': {
    essentials: [
      ['Stability and thresholds', 'Ecosystems can recover from some disturbances. Large changes can push a system past a tipping point into a different state.'],
      ['Eutrophication', 'Nutrient input can promote algal growth. Decomposition increases oxygen demand, which can deplete dissolved oxygen.'],
      ['Human impacts and recovery', 'Persistent pollutants can biomagnify along food chains. Sustainable harvesting and rewilding can help restore ecological processes.'],
    ],
    exam: 'Bioaccumulation occurs within an organism over time. Biomagnification means concentrations rise across trophic levels.',
    hl: ['Succession', 'Primary succession begins on newly exposed substrate with little or no soil. Disturbance or grazing can arrest further community change.'],
  },
  'D4.3': {
    essentials: [
      ['Anthropogenic warming', 'Fossil fuel combustion and land-use change increase greenhouse gases, which reduce outgoing infrared energy to space until the system warms.'],
      ['Amplifying feedback', 'Loss of reflective snow or ice increases absorbed solar energy. Carbon loss from some ecosystems can also amplify warming.'],
      ['Ecological responses', 'Ranges can shift poleward or upslope. Heat can trigger coral bleaching. Forest regeneration and peatland restoration can support carbon storage.'],
    ],
    exam: 'For a positive feedback, trace the chain of changes all the way back to an increase in the original warming.',
    hl: ['Phenology', 'Warming can shift the timing of events such as flowering and pollinator activity. Different shifts can create ecological mismatches.'],
  },
};
