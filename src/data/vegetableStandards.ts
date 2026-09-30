export interface VegetableDefect {
  id: string;
  name: string;
  category: 'biological' | 'mechanical' | 'environmental' | 'physiological';
  description: string;
  visibleSymptoms: string;
  severityLevels: {
    minor: string;
    moderate: string;
    severe: string;
  };
  inspectionMethod: string;
  marketImpact: string;
}

export interface VegetableGradeSpec {
  gradeA: {
    title: string;
    marketName: string;
    summary: string;
    tolerances: string[];
    allowedDefects: string;
  };
  gradeB: {
    title: string;
    marketName: string;
    summary: string;
    tolerances: string[];
    allowedDefects: string;
  };
  reject: {
    title: string;
    marketName: string;
    summary: string;
    disqualifiers: string[];
  };
}

export interface VegetableStandard {
  id: 'potato' | 'tomato' | 'onion' | 'carrot' | 'bell_pepper' | 'cucumber';
  name: string;
  scientificName: string;
  emoji: string;
  family: string;
  usdaStandardCode: string;
  overview: string;
  idealStorage: {
    temperature: string;
    humidity: string;
    shelfLife: string;
  };
  keyQualityIndicators: string[];
  gradingSpec: VegetableGradeSpec;
  defects: VegetableDefect[];
  inspectionSteps: string[];
}

export const VEGETABLE_STANDARDS: Record<string, VegetableStandard> = {
  potato: {
    id: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    emoji: '🥔',
    family: 'Solanaceae (Tuber)',
    usdaStandardCode: '7 CFR § 51.1540 (U.S. No. 1 / No. 2)',
    overview:
      'Standardized visual quality grading for raw russet, round white, red, and yellow flesh potatoes destined for fresh retail packing or french fry/chip processing.',
    idealStorage: {
      temperature: '7°C - 10°C (45°F - 50°F)',
      humidity: '90% - 95% RH',
      shelfLife: '3 - 5 months cured',
    },
    keyQualityIndicators: [
      'Firm tuber flesh with intact outer periderm',
      'Zero greening (chlorophyll / solanine glycoalkaloids)',
      'Clean surface with no wet bacterial decay',
      'Regular oval/round varietal shape symmetry',
    ],
    gradingSpec: {
      gradeA: {
        title: 'Grade A (Premium Retail Market)',
        marketName: 'U.S. No. 1 Extra',
        summary:
          'Firm, clean, well-shaped tubers free from black heart, late blight, freezing, soft rot, and greening. Maximum 1 superficial minor defect permitted.',
        tolerances: [
          'Max 1 minor surface defect per tuber',
          '0% tolerance for wet soft rot or late blight decay',
          'Max 5% surface area affected by superficial common scab',
        ],
        allowedDefects: 'Only superficial healed scuffs or minor skin netting variations.',
      },
      gradeB: {
        title: 'Grade B (Commercial / Processing)',
        marketName: 'U.S. No. 2 Commercial',
        summary:
          'Fairly well-shaped tubers suitable for industrial peeling, french fry processing, or dehydrated flakes. Tolerates minor healed cuts or slight sunburn.',
        tolerances: [
          'Up to 2 moderate defects or 3 minor defects',
          'Cuts covering less than 10% of total surface area',
          'Slight apical greening under 5% surface area',
        ],
        allowedDefects: 'Healed growth cracks under 12mm depth, light scab, slight shape taper.',
      },
      reject: {
        title: 'Cull / Reject (Quarantined)',
        marketName: 'Substandard / Cull',
        summary:
          'Severe physical decay, bacterial contamination, or structural deformities rendering the lot unfit for sale.',
        disqualifiers: [
          'Active wet soft rot (Pectobacterium / Dickeya decay)',
          'Late blight lesions with brown necrotic flesh',
          'Extensive deep growth cracks > 15mm or hollow heart exposure',
          'Extensive greening exceeding 10% surface (solanine hazard)',
          'Active sprouting with eyes exceeding 12mm in length',
        ],
      },
    },
    defects: [
      {
        id: 'pot_greening',
        name: 'Greening (Solanine Accumulation)',
        category: 'physiological',
        description: 'Light-induced chlorophyll and toxic glycoalkaloid (solanine) synthesis.',
        visibleSymptoms: 'Greenish tint or deep emerald patch on tuber shoulders or apical end.',
        severityLevels: {
          minor: 'Faint greenish tint covering < 3% surface area.',
          moderate: 'Distinct green patch penetrating 2mm into periderm.',
          severe: 'Deep green discoloration covering > 8% of tuber surface.',
        },
        inspectionMethod: 'Visual inspection under 1000 lux daylight-spectrum illumination.',
        marketImpact: 'Severe health hazard if high; mandatory rejection for retail tables.',
      },
      {
        id: 'pot_rot',
        name: 'Bacterial Soft Rot (Pectobacterium)',
        category: 'biological',
        description: 'Enzymatic tissue maceration turning tuber flesh into slimy, foul-smelling pulp.',
        visibleSymptoms: 'Water-soaked soft lesions, cream-to-tan ooze, collapsed skin.',
        severityLevels: {
          minor: 'Not permitted in Grade A; pinpoint soft spot < 3mm.',
          moderate: 'Water-soaked lesion 3mm - 10mm across.',
          severe: 'Spreading wet decay, skin rupture, foul odor.',
        },
        inspectionMethod: 'Tactile surface pressure check and visual detection of macerated tissue.',
        marketImpact: 'Total lot quarantine; spreads rapidly in transit and storage.',
      },
      {
        id: 'pot_cracks',
        name: 'Growth Cracks & Fissures',
        category: 'environmental',
        description: 'Rapid tuber expansion following sudden irrigation or rainfall spikes.',
        visibleSymptoms: 'Longitudinal or transverse splits in the tuber skin and outer cortex.',
        severityLevels: {
          minor: 'Healed superficial fissure < 8mm long, < 2mm deep.',
          moderate: 'Healed crack 8mm - 20mm long, < 5mm deep.',
          severe: 'Deep open unhealed split > 5mm depth exposing inner flesh.',
        },
        inspectionMethod: 'Stereoscopic or vision depth profiling across the longitudinal axis.',
        marketImpact: 'Causes high peeling waste in processing plants; Grade B or Reject.',
      },
      {
        id: 'pot_scab',
        name: 'Common Scab (Streptomyces scabies)',
        category: 'biological',
        description: 'Bacterial infection producing corky, pitted, or raised lesions on the skin.',
        visibleSymptoms: 'Rough, brown, corky crusts or circular star-burst crater pits.',
        severityLevels: {
          minor: 'Superficial russet scab covering < 5% of tuber surface.',
          moderate: 'Pitted scab craters 1mm - 3mm deep covering 5% - 15% surface.',
          severe: 'Deep coalesced pitted lesions covering > 15% surface area.',
        },
        inspectionMethod: 'Macro surface visual texture analysis.',
        marketImpact: 'Downgrades fresh table stock to processing Grade B or animal feed.',
      },
    ],
    inspectionSteps: [
      'Position tuber under uniform non-glare diffuse white illumination.',
      'Check entire 360° perimeter for greening on shoulders and apical eye clusters.',
      'Examine for wet bacterial lesions, soft water-soaked depressions, or fungal mycelium.',
      'Measure length and depth of any mechanical harvesting cuts or growth cracks.',
      'Assess shape symmetry ratio (length to width) against varietal standards.',
    ],
  },

  tomato: {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    emoji: '🍅',
    family: 'Solanaceae (Nightshade Fruit)',
    usdaStandardCode: '7 CFR § 51.1855 (U.S. No. 1 / No. 2)',
    overview:
      'Quality grading standards for vine-ripened, greenhouse, and field round/roma tomatoes evaluating firmness, color stage, radial fissures, and blossom-end rot.',
    idealStorage: {
      temperature: '12°C - 15°C (54°F - 59°F)',
      humidity: '85% - 90% RH',
      shelfLife: '1 - 3 weeks (Never refrigerate below 10°C to avoid chilling injury)',
    },
    keyQualityIndicators: [
      'Firm pericarp wall without softening or water-logging',
      'Uniform color transition matching target maturity index (breaker to red)',
      'Smooth cuticle without radial or concentric cracking',
      'Intact calyx stem (for vine-on varieties)',
    ],
    gradingSpec: {
      gradeA: {
        title: 'Grade A (U.S. No. 1 Premium Fresh)',
        marketName: 'U.S. No. 1 Vine Ripe',
        summary:
          'Firm, well-developed, fairly smooth fruit free from blossom-end rot, sunscald, freezing injury, catfacing, and open cracks.',
        tolerances: [
          'Max 1 minor healed micro-crack (< 5mm)',
          'Zero tolerance for open unhealed skin punctures or soft rot',
          'Slight yellow/green shoulder allowed only if firm and < 10% surface area',
        ],
        allowedDefects: 'Clean blossom scar < 3mm diameter; minor superficial scuffing.',
      },
      gradeB: {
        title: 'Grade B (Processing / Commercial)',
        marketName: 'U.S. No. 2 Salad / Canning',
        summary:
          'Fairly firm fruit suitable for culinary slicing, food service sauce, or dicing. May show moderate catfacing or healed concentric rings.',
        tolerances: [
          'Healed radial cracks up to 15mm combined length',
          'Moderate catfacing or ribbing if not deeply indented',
          'Up to 15% surface showing uneven color ripening (blotchy ripening)',
        ],
        allowedDefects: 'Healed scars not interfering with peeling or mechanical slicing.',
      },
      reject: {
        title: 'Cull / Reject (Quarantined)',
        marketName: 'Substandard / Cull',
        summary:
          'Soft, decaying, leaking, or severely scarred fruit unfit for human consumption.',
        disqualifiers: [
          'Blossom-end rot (dark, leathery sunken black lesion at base)',
          'Active soft rot, sour rot (Geotrichum), or gray mold (Botrytis)',
          'Open unhealed radial tears leaking juice or attracting drosophila flies',
          'Sunscald with bleached, papery, blistered cuticle tissue',
          'Extreme puffiness or hollow locule cavities (> 25% interior volume)',
        ],
      },
    },
    defects: [
      {
        id: 'tom_blossom_rot',
        name: 'Blossom-End Rot (Calcium Deficiency)',
        category: 'physiological',
        description: 'Localized calcium deficiency during rapid cell expansion causing blossom end collapse.',
        visibleSymptoms: 'Depressed, dark brown to black leathery lesion at the blossom apex.',
        severityLevels: {
          minor: 'Not allowed in Grade A; pinpoint dark fleck < 2mm.',
          moderate: 'Sunken leathery brown patch 3mm - 10mm wide.',
          severe: 'Deep black crater > 10mm diameter with secondary fungal mold.',
        },
        inspectionMethod: 'Direct visual exam of the fruit blossom pole opposite the stem.',
        marketImpact: 'Immediate rejection for retail table market; cull category.',
      },
      {
        id: 'tom_cracking',
        name: 'Radial & Concentric Cracking',
        category: 'environmental',
        description: 'Cuticle splitting from sudden water influx and rapid internal pulp expansion.',
        visibleSymptoms: 'Fissures radiating outward from stem scar or concentric rings circling shoulder.',
        severityLevels: {
          minor: 'Well-healed corky micro-fissure < 6mm long, zero juice exudate.',
          moderate: 'Healed cracks 6mm - 18mm long without exposed red pulp.',
          severe: 'Open, wet, unhealed tear leaking locular gel.',
        },
        inspectionMethod: 'Examine shoulders and stem scar perimeter under side-angled light.',
        marketImpact: 'Open cracks introduce pathogens; causes fruit collapse in transit.',
      },
      {
        id: 'tom_catfacing',
        name: 'Catfacing (Floral Distortion)',
        category: 'physiological',
        description: 'Abnormal floral development triggered by low temperatures during bloom.',
        visibleSymptoms: 'Deep indents, convolutions, corky ridges, and scarred folds on blossom end.',
        severityLevels: {
          minor: 'Slightly enlarged corky button < 4mm across without deep crevices.',
          moderate: 'Irregular ridges and indentations covering up to 10mm area.',
          severe: 'Deep cavernous folds penetrating inner locule walls.',
        },
        inspectionMethod: 'Inspect fruit contour and bottom half geometry.',
        marketImpact: 'Downgrades fruit to sauce processing Grade B or reject.',
      },
      {
        id: 'tom_sunscald',
        name: 'Sunscald (Solar Radiation Injury)',
        category: 'environmental',
        description: 'Direct solar radiation overheating unprotected fruit after defoliation.',
        visibleSymptoms: 'Bleached, pale yellow or parchment-white sunken papery patch on shoulder.',
        severityLevels: {
          minor: 'Pale bleached spot < 8mm without tissue thinning.',
          moderate: 'White papery patch 8mm - 20mm with sunken cuticle.',
          severe: 'Extensive papery blister > 20mm with secondary black mold colonization.',
        },
        inspectionMethod: 'Visual inspection of upper illuminated shoulders.',
        marketImpact: 'Affects flavor and shelf-life; disqualifies from Grade A.',
      },
    ],
    inspectionSteps: [
      'Evaluate overall firmness by gentle non-destructive bilateral tactile gauge.',
      'Classify color stage on USDA 1-6 scale (Green, Breaker, Turning, Pink, Light Red, Red).',
      'Inspect blossom pole for dark sunken blossom-end rot lesions.',
      'Check stem shoulders for open radial splits or circular concentric rings.',
      'Verify absence of insect puncture stippling or ghost spotting (Botrytis spores).',
    ],
  },

  onion: {
    id: 'onion',
    name: 'Onion',
    scientificName: 'Allium cepa',
    emoji: '🧅',
    family: 'Amaryllidaceae (Allium Bulb)',
    usdaStandardCode: '7 CFR § 51.2830 (U.S. No. 1 / Commercial)',
    overview:
      'Commercial inspection specification for cured yellow, red, and white dry onions focusing on neck tightness, outer tunic scale retention, translucent scale, and basal rot.',
    idealStorage: {
      temperature: '0°C - 2°C (32°F - 35°F)',
      humidity: '65% - 70% RH (Dry airflow essential)',
      shelfLife: '6 - 9 months fully cured',
    },
    keyQualityIndicators: [
      'Thoroughly dried, tightly closed neck with no internal moisture',
      'Dry, papery, intact outer protective tunic scales',
      'Firm basal plate with no soft tissue breakdown',
      'Single growing center with no internal sprouting',
    ],
    gradingSpec: {
      gradeA: {
        title: 'Grade A (U.S. No. 1 Premium Market)',
        marketName: 'U.S. No. 1 Dry Bulb',
        summary:
          'Firm, mature bulbs with tight, dry necks and intact skins. Free from soft rot, neck rot, black mold, seedstems, doubles, and sprouting.',
        tolerances: [
          'Max 1 broken or partially split outer skin scale per bulb',
          'Zero tolerance for wet neck rot or active green sprouts',
          'Max 2% surface area with dry superficial black mold dust',
        ],
        allowedDefects: 'Minor dry peeling of first outer tunic scale; clean dry roots.',
      },
      gradeB: {
        title: 'Grade B (Commercial / Peeling)',
        marketName: 'U.S. Commercial / Industrial',
        summary:
          'Bulbs suitable for commercial peeling, food manufacturing, or dehydration. May have minor split skins or slight shape irregularity.',
        tolerances: [
          'Up to 30% of outer papery tunic scales missing (partially bald)',
          'Slight bottlenecks or mild shape deviation',
          'Dry outer scale staining or superficial mold dust under 8% area',
        ],
        allowedDefects: 'Single split dry scale; dry root stubble up to 20mm.',
      },
      reject: {
        title: 'Cull / Reject (Quarantined)',
        marketName: 'Substandard / Cull',
        summary:
          'Decaying, sprouting, or soft bulbs that spoil neighboring stock in bins or sacks.',
        disqualifiers: [
          'Botrytis neck rot (soft, watery neck with brown inner scales)',
          'Internal sprouting with green leaves emerging from neck',
          'Extensive black mold (Aspergillus niger) forming soot layers under scales',
          'Basal plate rot (Fusarium oxysporum) with soft white/pink fungal decay',
          'Translucent / watery scales resembling freezing injury',
          'Double or split bulbs with loose centers that harbor moisture',
        ],
      },
    },
    defects: [
      {
        id: 'on_neck_rot',
        name: 'Botrytis Neck Rot (Botrytis allii)',
        category: 'biological',
        description: 'Fungal infection entering improperly cured necks during harvest and curing.',
        visibleSymptoms: 'Soft, sunken neck tissue; water-soaked brown inner scale rot; gray mycelium.',
        severityLevels: {
          minor: 'Not permitted; any neck softness triggers cull classification.',
          moderate: 'Soft neck tissue extending 10mm down into bulb crown.',
          severe: 'Extensive gray mold, collapsed neck, foul smell.',
        },
        inspectionMethod: 'Gentle thumb compression of the neck 15mm above the bulb shoulder.',
        marketImpact: 'Leading cause of postharvest onion bin loss; immediate reject.',
      },
      {
        id: 'on_black_mold',
        name: 'Black Mold (Aspergillus niger)',
        category: 'biological',
        description: 'Postharvest fungal colonizer prevalent in warm, humid storage environments.',
        visibleSymptoms: 'Powdery black soot-like spore clusters along outer scale veins.',
        severityLevels: {
          minor: 'Faint isolated black specks on outermost disposable scale (< 3%).',
          moderate: 'Black powder patches on second scale layer covering 3% - 10%.',
          severe: 'Dense black sooty crust penetrating edible fleshy scales.',
        },
        inspectionMethod: 'Examine outer tunic and neck perimeter under bright daylight.',
        marketImpact: 'Downgrades retail bag presentation; triggers rejection if penetrating fleshy scales.',
      },
      {
        id: 'on_sprouting',
        name: 'Sprouting (End of Dormancy)',
        category: 'physiological',
        description: 'Breaking of bulb dormancy due to warmth or prolonged storage time.',
        visibleSymptoms: 'Green sprout tip protruding through the neck or swollen neck center.',
        severityLevels: {
          minor: 'Visible green sprout tip < 5mm inside neck orifice.',
          moderate: 'Green sprout extending 5mm - 20mm beyond neck.',
          severe: 'Multiple vigorous green shoots > 20mm; bulb flesh turning soft.',
        },
        inspectionMethod: 'Inspect neck aperture for green chlorophyll coloration or swollen center.',
        marketImpact: 'Depletes bulb sugars and firmness; rejected from retail grade.',
      },
      {
        id: 'on_translucent',
        name: 'Translucent Scale Breakdown',
        category: 'physiological',
        description: 'Physiological disorder resembling freezing injury caused by high storage temperature.',
        visibleSymptoms: 'Outer fleshy scales become clear, watery, grayish, and glassy.',
        severityLevels: {
          minor: 'Single outer fleshy scale showing partial translucency.',
          moderate: 'Two consecutive fleshy scales watery and glassy.',
          severe: 'Three or more scales affected, giving bulb soft spongy feel.',
        },
        inspectionMethod: 'Cut sample cross-section or detect soft wateriness through outer tunic.',
        marketImpact: 'Leads to rapid bacterial rot; severe market penalty.',
      },
    ],
    inspectionSteps: [
      'Firmly press the neck with thumb and index finger to test for spongy softness or moisture.',
      'Check outer dry tunic scales for integrity (must retain at least 70% papery coverage).',
      'Inspect root basal plate for white Fusarium mycelium, rot, or active root regrowth.',
      'Examine neck tip under light for early emerging green sprout shoots.',
      'Check for black sooty Aspergillus mold lines along scale striations.',
    ],
  },

  carrot: {
    id: 'carrot',
    name: 'Carrot',
    scientificName: 'Daucus carota',
    emoji: '🥕',
    family: 'Apiaceae (Taproot)',
    usdaStandardCode: '7 CFR § 51.495 (U.S. Extra No. 1 / No. 1)',
    overview:
      'Rigorous quality grading criteria for fresh bunched, topped, and cello-packed carrots assessing root straightness, crown greening, cavity spot, and growth fissures.',
    idealStorage: {
      temperature: '0°C - 1°C (32°F - 34°F)',
      humidity: '98% - 100% RH (Moisture retention critical)',
      shelfLife: '4 - 6 months topped in cold storage',
    },
    keyQualityIndicators: [
      'Firm, crisp, turgid root with zero rubbery flexibility',
      'Vibrant uniform orange beta-carotene pigmentation',
      'Straight cylindrical or conical taper without forks or branch roots',
      'Cleanly trimmed crown with minimal green shoulder exposure',
    ],
    gradingSpec: {
      gradeA: {
        title: 'Grade A (U.S. Extra No. 1 Retail)',
        marketName: 'U.S. Extra No. 1 Cello',
        summary:
          'Firm, straight, well-formed roots with smooth skin. Free from soft rot, greening > 12mm, forking, growth cracks, and cavity spot.',
        tolerances: [
          'Crown greening or purple shoulder < 12mm from top',
          'Root curvature less than 10 degrees from straight line',
          'Zero tolerance for cottony white rot or soft rot lesions',
        ],
        allowedDefects: 'Superficial root hair scars; minor tip curvature under 10mm.',
      },
      gradeB: {
        title: 'Grade B (Processing / Dicing)',
        marketName: 'U.S. No. 2 Processing',
        summary:
          'Fairly well-formed roots suitable for industrial peeling, crinkle slicing, dicing, or juicing. Permits healed cracks and moderate curvature.',
        tolerances: [
          'Root curvature up to 25 degrees',
          'Crown greening up to 25mm from top',
          'Healed growth cracks under 3mm depth and < 35mm length',
        ],
        allowedDefects: 'Slightly rough skin; small dry secondary root scars.',
      },
      reject: {
        title: 'Cull / Reject (Quarantined)',
        marketName: 'Substandard / Cull',
        summary:
          'Severely deformed, woody, rotting, or flaccid roots unfit for commercial distribution.',
        disqualifiers: [
          'Cottony soft rot (Sclerotinia sclerotiorum) with white fungus and black sclerotia',
          'Bacterial soft rot (Pectobacterium carotovorum) turning root to mush',
          'Forked or branched roots with multiple taproots',
          'Severe longitudinal growth cracks exposing inner xylem core',
          'Flaccid, rubbery root structure due to severe desiccation',
          'Woody or fibrous pithy core texture caused by over-maturity',
        ],
      },
    },
    defects: [
      {
        id: 'car_forking',
        name: 'Forking & Secondary Branching',
        category: 'physiological',
        description: 'Taproot tip death or compaction during early growth forcing lateral roots.',
        visibleSymptoms: 'Split taproot forming two, three, or multiple twisted legs.',
        severityLevels: {
          minor: 'Faint double tip branching in bottom 10% of root.',
          moderate: 'Fork starting in middle third of root.',
          severe: 'Severe branching into multiple claw-like roots from top third.',
        },
        inspectionMethod: 'Examine entire longitudinal silhouette for single taproot integrity.',
        marketImpact: 'Cannot be processed by mechanical peeler; automatic Grade B/Reject.',
      },
      {
        id: 'car_greening',
        name: 'Crown Greening (Sunburn / Exposure)',
        category: 'environmental',
        description: 'Exposure of the carrot crown to sunlight resulting in chlorophyll and bitter terpenes.',
        visibleSymptoms: 'Emerald green or purplish ring circling the top crown below the foliage.',
        severityLevels: {
          minor: 'Green collar extending < 8mm down from crown edge.',
          moderate: 'Green collar extending 8mm - 20mm down root shoulder.',
          severe: 'Greening extending > 20mm down into primary edible root.',
        },
        inspectionMethod: 'Measure linear distance of green pigment from top crown rim.',
        marketImpact: 'Imparts bitter off-flavor; restricted under retail table grade.',
      },
      {
        id: 'car_cavity_spot',
        name: 'Cavity Spot (Pythium violae)',
        category: 'biological',
        description: 'Soil-borne fungal pathogen causing sunken elliptical lesions on root skin.',
        visibleSymptoms: 'Small horizontal sunken dark brown lesions across the root circumference.',
        severityLevels: {
          minor: 'Pinpoint elliptical lesion < 3mm length, < 1mm depth.',
          moderate: 'Multiple dark lesions 3mm - 8mm length.',
          severe: 'Deep pitted craters > 8mm coalescing into necrotic bands.',
        },
        inspectionMethod: 'Inspect root perimeter under diffuse high-contrast lighting.',
        marketImpact: 'Ruins cello-pack visual appeal; leads to high trimming waste.',
      },
      {
        id: 'car_soft_rot',
        name: 'Cottony Soft Rot (Sclerotinia sclerotiorum)',
        category: 'biological',
        description: 'Devastating postharvest storage rot producing fluffy white fungal mats.',
        visibleSymptoms: 'Watery soft root breakdown covered with white cottony mold and black sclerotia.',
        severityLevels: {
          minor: 'Zero tolerance; any lesion triggers rejection.',
          moderate: 'Watery rot spot 5mm - 15mm with white hyphae.',
          severe: 'Complete root liquefaction, dense cottony fungal mat.',
        },
        inspectionMethod: 'Tactile firmness and visual inspection for white hyphal mycelium.',
        marketImpact: 'Causes "nesting" rot in storage bins; immediate cull and quarantine.',
      },
    ],
    inspectionSteps: [
      'Gently flex root to confirm crisp turgidity (flaccid rubbery carrots indicate desiccation).',
      'Check root alignment against a straight reference axis (reject if curvature > 25°).',
      'Measure crown greening or purpling distance from top rim.',
      'Inspect root skin for horizontal elliptical cavity spots or brown sunken pits.',
      'Check tip for forking, blunt stubbing, or mechanical digger cuts.',
    ],
  },

  bell_pepper: {
    id: 'bell_pepper',
    name: 'Bell Pepper',
    scientificName: 'Capsicum annuum',
    emoji: '🫑',
    family: 'Solanaceae (Sweet Pepper)',
    usdaStandardCode: '7 CFR § 51.3175 (U.S. Fancy / No. 1)',
    overview:
      'Commercial visual grading standards for green, red, yellow, and orange bell peppers evaluating pericarp wall thickness, blocky lobe formation, sunscald, and blossom-end rot.',
    idealStorage: {
      temperature: '7°C - 10°C (45°F - 50°F)',
      humidity: '90% - 95% RH',
      shelfLife: '2 - 3 weeks (Sensitive to chilling injury below 7°C)',
    },
    keyQualityIndicators: [
      'Firm, thick-walled pericarp that snaps upon cutting',
      'Characteristic blocky 3-to-4 lobe symmetrical morphology',
      'Fresh, green, cleanly cut calyx stem attached',
      'Glossy, uniform cuticle without water-soaked pitting',
    ],
    gradingSpec: {
      gradeA: {
        title: 'Grade A (U.S. Fancy / No. 1 Premium)',
        marketName: 'U.S. Fancy Bell Pepper',
        summary:
          'Firm, thick-fleshed, well-shaped peppers with intact green stems. Free from sunscald, blossom-end rot, freezing, bacterial spot, and deep bruises.',
        tolerances: [
          'Max 1 minor superficial healed scratch < 10mm length',
          'Zero tolerance for open punctures or bacterial soft rot',
          'Slight color change (breaking) allowed only if uniformly transitioning',
        ],
        allowedDefects: 'Clean calyx stem trimmed to 15mm - 25mm length.',
      },
      gradeB: {
        title: 'Grade B (Commercial / Foodservice)',
        marketName: 'U.S. No. 2 Slicing / Dicing',
        summary:
          'Fairly well-shaped peppers suitable for commercial slicing, pizza toppings, or fajita strips. May have slight shape curvature or wall thinning.',
        tolerances: [
          'Slightly curved or pointed shape (2 lobes instead of 4)',
          'Healed superficial scratches covering < 5% surface area',
          'Minor bleached sunscald patch < 12mm without flesh thinning',
        ],
        allowedDefects: 'Healed stem-end micro-cracks not leaking locular moisture.',
      },
      reject: {
        title: 'Cull / Reject (Quarantined)',
        marketName: 'Substandard / Cull',
        summary:
          'Decaying, punctured, or severely deformed peppers that spoil quickly in retail bins.',
        disqualifiers: [
          'Bacterial soft rot (Pectobacterium) turning pepper to watery liquid',
          'Blossom-end rot with dark sunken leathery crater on bottom lobes',
          'Anthracnose (Colletotrichum) lesions with circular salmon-pink spore rings',
          'Chilling injury pitting (water-soaked sunken spots after cold storage)',
          'Deep mechanical punctures or crushed lobes leaking seed cavity juice',
        ],
      },
    },
    defects: [
      {
        id: 'pep_blossom_rot',
        name: 'Blossom-End Rot (Calcium Deficiency)',
        category: 'physiological',
        description: 'Inadequate calcium transport during peak fruit development.',
        visibleSymptoms: 'Depressed, dark brown, papery or leathery sunken area between lobes at blossom apex.',
        severityLevels: {
          minor: 'Small light brown dry spot < 4mm diameter.',
          moderate: 'Depressed dark brown leathery lesion 4mm - 15mm diameter.',
          severe: 'Large sunken black crater > 15mm with secondary Alternaria mold.',
        },
        inspectionMethod: 'Examine between the bottom lobes at the fruit apex.',
        marketImpact: 'Unfit for retail sale; automatic rejection.',
      },
      {
        id: 'pep_sunscald',
        name: 'Sunscald (Solar Overheating)',
        category: 'environmental',
        description: 'Excessive solar heat destroying chlorophyll and cellular tissue.',
        visibleSymptoms: 'Bleached, parchment-white, transparent papery patch on upper shoulder.',
        severityLevels: {
          minor: 'Faint bleached patch < 10mm without skin thinning.',
          moderate: 'Parchment-like bleached patch 10mm - 25mm diameter.',
          severe: 'Large papery sunken area > 25mm with secondary fungal invasion.',
        },
        inspectionMethod: 'Inspect upper sun-facing wall shoulders.',
        marketImpact: 'Dries out pepper and attracts black mold; Grade B or Reject.',
      },
      {
        id: 'pep_anthracnose',
        name: 'Anthracnose (Colletotrichum spp.)',
        category: 'biological',
        description: 'Fungal fruit rot causing circular sunken water-soaked target lesions.',
        visibleSymptoms: 'Circular sunken spots with concentric rings of salmon/black spore masses.',
        severityLevels: {
          minor: 'Pinpoint water-soaked spot < 2mm.',
          moderate: 'Sunken circular lesion 3mm - 8mm with dark center.',
          severe: 'Spreading target lesions > 8mm with salmon-colored spore rings.',
        },
        inspectionMethod: 'Check lateral pericarp walls under angled light.',
        marketImpact: 'Spreads rapidly postharvest; immediate quarantine.',
      },
      {
        id: 'pep_chilling',
        name: 'Chilling Injury (Low Temperature Pitting)',
        category: 'environmental',
        description: 'Cell membrane damage from storage below 7°C (45°F).',
        visibleSymptoms: 'Numerous sheet-like water-soaked pits and calyx browning.',
        severityLevels: {
          minor: 'Faint scattered surface pits < 1mm diameter.',
          moderate: 'Numerous sunken pits coalescing into broad depressive patches.',
          severe: 'Widespread water-soaked decay; calyx completely blackened and rotting.',
        },
        inspectionMethod: 'Examine surface sheen and calyx greenness.',
        marketImpact: 'Destroys crispness and invites secondary soft rot.',
      },
    ],
    inspectionSteps: [
      'Gently compress sides to verify wall thickness and firm crisp structural resistance.',
      'Check calyx stem: should be fresh, green, and firmly attached without black decay.',
      'Inspect bottom apex between lobes for sunken dark blossom-end rot lesions.',
      'Check shoulders for bleached papery sunscald patches.',
      'Examine lateral walls for sunken circular anthracnose lesions or chilling pits.',
    ],
  },

  cucumber: {
    id: 'cucumber',
    name: 'Cucumber',
    scientificName: 'Cucumis sativus',
    emoji: '🥒',
    family: 'Cucurbitaceae (Gourd Family)',
    usdaStandardCode: '7 CFR § 51.2220 (U.S. Fancy / No. 1)',
    overview:
      'Defect classification and quality standards for slicing, greenhouse (English long), and pickling cucumbers assessing straightness, rind yellowing, belly rot, and spongy texture.',
    idealStorage: {
      temperature: '10°C - 12°C (50°F - 54°F)',
      humidity: '90% - 95% RH',
      shelfLife: '10 - 14 days (Extreme chilling sensitivity below 10°C)',
    },
    keyQualityIndicators: [
      'Firm, rigid fruit with crisp, juicy endocarp',
      'Uniform deep green rind without yellowing (over-maturity indicator)',
      'Straight cylindrical geometry with uniform diameter from stem to blossom end',
      'Intact skin without water-soaked pitting or soft spots',
    ],
    gradingSpec: {
      gradeA: {
        title: 'Grade A (U.S. Fancy / No. 1 Premium Slicing)',
        marketName: 'U.S. Fancy Slicer',
        summary:
          'Firm, fresh, well-colored dark green cucumbers. Practically straight (curvature arc < 15°), well-trimmed, free from yellowing, soft rot, cuts, and belly rot.',
        tolerances: [
          'Max 15 degree curvature arc from longitudinal straight line',
          'Zero yellowing on rind (uniform green required)',
          'Zero soft rot, pitting, or sunken decay',
        ],
        allowedDefects: 'Faint ground spot (pale green/cream) under 15% surface area.',
      },
      gradeB: {
        title: 'Grade B (Commercial / Processing)',
        marketName: 'U.S. No. 2 Commercial',
        summary:
          'Fairly well-formed cucumbers suitable for commercial salad bars, relish, or dicing. Allows moderate curvature or slight tapering.',
        tolerances: [
          'Curvature arc between 15 and 30 degrees',
          'Slight tapering at blossom or stem end (bottleneck)',
          'Healed superficial scratches or scarring < 8% surface area',
        ],
        allowedDefects: 'Ground spot covering up to 25% of one side; minor skin netting.',
      },
      reject: {
        title: 'Cull / Reject (Quarantined)',
        marketName: 'Substandard / Cull',
        summary:
          'Over-mature, yellow, spongy, rotting, or severely crooked fruit unsuitable for retail.',
        disqualifiers: [
          'Belly rot (Rhizoctonia solani) with water-soaked brown rind decay',
          'Severe yellowing indicating advanced maturity and hard, bitter seeds',
          'Severe crooking with curvature arc exceeding 30 degrees (C-shaped or hook)',
          'Spongy, hollow, or flaccid endocarp texture from extreme desiccation',
          'Watery soft rot (Pectobacterium) with skin liquefaction and foul leakage',
          'Chilling injury breakdown with translucent sunken craters',
        ],
      },
    },
    defects: [
      {
        id: 'cuc_crooking',
        name: 'Crooking & Curvature Deformity',
        category: 'physiological',
        description: 'Uneven pollination, physical foliage obstruction, or feeding insect stings during growth.',
        visibleSymptoms: 'Cucumber bends into a crescent, banana, or hook shape.',
        severityLevels: {
          minor: 'Gentle curve with arc < 15 degrees from straight center line.',
          moderate: 'Moderate bend with arc between 15 and 30 degrees.',
          severe: 'Severe hook or crescent with arc > 30 degrees (Grade B or Reject).',
        },
        inspectionMethod: 'Lay cucumber on flat plane and measure apex deflection distance.',
        marketImpact: 'Difficult to pack into standard cartons; rejected from Grade A.',
      },
      {
        id: 'cuc_yellowing',
        name: 'Yellowing (Advanced Maturity)',
        category: 'physiological',
        description: 'Senescence and over-maturity leading to tough rind, woody seeds, and bitter flavor.',
        visibleSymptoms: 'Rind turns from dark green to lime, yellow-green, or bright yellow.',
        severityLevels: {
          minor: 'Faint yellowish cast at blossom tip only.',
          moderate: 'Yellowing covering 10% - 25% of rind surface.',
          severe: 'Prominent yellow rind across > 25% of fruit; hard bitter seeds.',
        },
        inspectionMethod: 'Examine rind color under 1000 lux diffuse white light.',
        marketImpact: 'Strong consumer rejection; indicates bitter, seedy, inedible texture.',
      },
      {
        id: 'cuc_belly_rot',
        name: 'Belly Rot (Rhizoctonia solani)',
        category: 'biological',
        description: 'Soil-borne fungal pathogen attacking the side of the cucumber touching moist soil.',
        visibleSymptoms: 'Yellowish-brown water-soaked spots on the underside that turn into dry brown crusts.',
        severityLevels: {
          minor: 'Superficial tan ground blemish < 5mm without soft tissue breakdown.',
          moderate: 'Water-soaked brown lesion 5mm - 15mm diameter.',
          severe: 'Extensive sunken brown rot crater > 15mm with fungal crust.',
        },
        inspectionMethod: 'Examine the ground spot side of the cucumber.',
        marketImpact: 'Causes rapid decay in retail cartons; triggers rejection.',
      },
      {
        id: 'cuc_sponginess',
        name: 'Spongy / Hollow Center Breakdown',
        category: 'environmental',
        description: 'Moisture loss during storage or high temperatures during fruit sizing.',
        visibleSymptoms: 'Cucumber yields to light finger pressure; internal cavity forms inside pulp.',
        severityLevels: {
          minor: 'Slight softness at blossom end; interior intact.',
          moderate: 'Noticeable sponge-like compressibility across middle third.',
          severe: 'Extremely soft, flaccid, collapsible fruit with hollow center.',
        },
        inspectionMethod: 'Gentle manual compression along longitudinal axis.',
        marketImpact: 'Indicates old or dehydrated stock; unacceptable for retail.',
      },
    ],
    inspectionSteps: [
      'Assess straightness by testing if curvature arc exceeds 15 degrees.',
      'Check entire rind circumference for any yellowing or over-mature discoloration.',
      'Perform bilateral tactile compression to verify crisp firmness and absence of sponginess.',
      'Inspect the ground contact zone for water-soaked belly rot lesions or brown cratering.',
      'Check blossom end for shriveling, necking, or bacterial soft rot.',
    ],
  },
};
