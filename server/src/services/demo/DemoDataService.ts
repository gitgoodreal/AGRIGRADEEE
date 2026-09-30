import { AIAnalysisResult } from '../../models/types';

export interface DemoSample {
  id: string;
  name: string;
  description: string;
  category: 'Grade A Candidate' | 'Grade B Candidate' | 'Reject Candidate' | 'Negative Control (Non-Potato)';
  expectedOutcome: string;
  mimeType: string;
  base64Data: string;
  dataUrl: string;
  groundTruthObservations: AIAnalysisResult;
}

// Function to generate crisp SVG data URLs of test targets
function createSvgDataUrl(svgContent: string): { dataUrl: string; base64Data: string } {
  const base64 = Buffer.from(svgContent).toString('base64');
  return {
    dataUrl: `data:image/svg+xml;base64,${base64}`,
    base64Data: base64,
  };
}

// 1. Grade A: Premium Clean Russet Potato
const gradeASvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#2d3748"/>
      <stop offset="100%" stop-color="#1a202c"/>
    </radialGradient>
    <radialGradient id="potatoSkin" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#d4a373"/>
      <stop offset="50%" stop-color="#b07d4c"/>
      <stop offset="85%" stop-color="#8a5a2a"/>
      <stop offset="100%" stop-color="#643b18"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="25" stdDeviation="15" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="600" height="450" fill="url(#bg)"/>
  <g opacity="0.15" stroke="#ffffff" stroke-width="1">
    <line x1="50" y1="0" x2="50" y2="450"/>
    <line x1="150" y1="0" x2="150" y2="450"/>
    <line x1="250" y1="0" x2="250" y2="450"/>
    <line x1="350" y1="0" x2="350" y2="450"/>
    <line x1="450" y1="0" x2="450" y2="450"/>
    <line x1="550" y1="0" x2="550" y2="450"/>
    <line x1="0" y1="75" x2="600" y2="75"/>
    <line x1="0" y1="175" x2="600" y2="175"/>
    <line x1="0" y1="275" x2="600" y2="275"/>
    <line x1="0" y1="375" x2="600" y2="375"/>
  </g>
  <path d="M 180,225 C 170,140 250,110 330,115 C 410,120 470,165 460,240 C 450,315 390,345 310,340 C 230,335 190,310 180,225 Z" 
        fill="url(#potatoSkin)" filter="url(#shadow)" stroke="#522f12" stroke-width="2"/>
  <circle cx="230" cy="180" r="3" fill="#522f12" opacity="0.6"/>
  <circle cx="290" cy="160" r="2.5" fill="#522f12" opacity="0.5"/>
  <circle cx="370" cy="200" r="3" fill="#522f12" opacity="0.6"/>
  <circle cx="260" cy="260" r="2.5" fill="#522f12" opacity="0.5"/>
  <circle cx="340" cy="280" r="3" fill="#522f12" opacity="0.6"/>
  <circle cx="410" cy="250" r="2.5" fill="#522f12" opacity="0.5"/>
  <ellipse cx="280" cy="160" rx="60" ry="25" fill="#ffffff" opacity="0.12" transform="rotate(-15 280 160)"/>
  <text x="300" y="420" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="bold">AGRIGRADE TEST SAMPLE: GRADE A RUSSET</text>
</svg>`;

// 2. Grade B: Commercial Potato with Surface Scabbing
const gradeBSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#2d3748"/>
      <stop offset="100%" stop-color="#1a202c"/>
    </radialGradient>
    <radialGradient id="potatoSkin2" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#c99665"/>
      <stop offset="50%" stop-color="#9d6b3c"/>
      <stop offset="85%" stop-color="#7a4c20"/>
      <stop offset="100%" stop-color="#553010"/>
    </radialGradient>
    <filter id="shadow2">
      <feDropShadow dx="0" dy="20" stdDeviation="14" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="600" height="450" fill="url(#bg2)"/>
  <path d="M 160,230 C 150,150 240,110 320,120 C 410,130 475,185 450,265 C 430,335 340,350 270,335 C 200,320 170,300 160,230 Z" 
        fill="url(#potatoSkin2)" filter="url(#shadow2)" stroke="#45240b" stroke-width="2"/>
  <g fill="#45240b" opacity="0.75">
    <ellipse cx="220" cy="220" rx="14" ry="9"/>
    <ellipse cx="235" cy="228" rx="8" ry="6"/>
    <ellipse cx="210" cy="235" rx="10" ry="7"/>
    <ellipse cx="360" cy="270" rx="12" ry="8"/>
    <ellipse cx="375" cy="265" rx="7" ry="5"/>
  </g>
  <ellipse cx="380" cy="165" rx="35" ry="20" fill="#688033" opacity="0.35" transform="rotate(10 380 165)"/>
  <text x="300" y="420" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="bold">AGRIGRADE TEST SAMPLE: GRADE B (SCABBING &amp; GREENING)</text>
</svg>`;

// 3. Reject: Severe Soft Rot & Growth Crack Potato
const rejectSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <radialGradient id="bg3" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#2d3748"/>
      <stop offset="100%" stop-color="#1a202c"/>
    </radialGradient>
    <radialGradient id="potatoSkin3" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ab7a4e"/>
      <stop offset="50%" stop-color="#84552b"/>
      <stop offset="85%" stop-color="#5a3414"/>
      <stop offset="100%" stop-color="#3d1f08"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg3)"/>
  <path d="M 170,240 C 150,150 210,120 280,140 C 320,110 380,120 420,170 C 470,220 450,290 410,330 C 370,360 300,320 250,340 C 190,350 180,310 170,240 Z" 
        fill="url(#potatoSkin3)" stroke="#2b1404" stroke-width="3"/>
  <path d="M 230,160 Q 250,220 240,290 Q 260,250 250,190 Z" fill="#1f0f04" stroke="#0f0702" stroke-width="2"/>
  <ellipse cx="370" cy="240" rx="38" ry="32" fill="#20150d" opacity="0.9"/>
  <ellipse cx="375" cy="245" rx="25" ry="20" fill="#140b06"/>
  <text x="300" y="420" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="14" font-weight="bold">AGRIGRADE TEST SAMPLE: REJECT (ROT &amp; CRACK)</text>
</svg>`;

// 4. Non-Potato: Red Apple (Negative Control)
const nonPotatoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <radialGradient id="bg4" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#2d3748"/>
      <stop offset="100%" stop-color="#1a202c"/>
    </radialGradient>
    <radialGradient id="appleGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ff4d4d"/>
      <stop offset="40%" stop-color="#d61a1a"/>
      <stop offset="85%" stop-color="#990000"/>
      <stop offset="100%" stop-color="#590000"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg4)"/>
  <path d="M 300,140 Q 295,90 325,75" stroke="#4a2e12" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M 315,90 Q 360,70 355,105 Q 330,110 315,90 Z" fill="#48bb78" stroke="#276749" stroke-width="2"/>
  <path d="M 300,145 C 230,105 160,180 180,270 C 195,340 250,365 300,350 C 350,365 405,340 420,270 C 440,180 370,105 300,145 Z" 
        fill="url(#appleGrad)" stroke="#400000" stroke-width="3"/>
  <ellipse cx="240" cy="200" rx="30" ry="60" fill="#ffffff" opacity="0.25" transform="rotate(-20 240 200)"/>
  <text x="300" y="420" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="14" font-weight="bold">AGRIGRADE NEGATIVE CONTROL: RED APPLE</text>
</svg>`;

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'demo_grade_a',
    name: 'Sample 1: Premium Russet (Grade A)',
    description: 'Uniform oval contour, clear skin with standard lenticels, zero structural cracks or rot.',
    category: 'Grade A Candidate',
    expectedOutcome: 'Expected Result: Grade A (High Confidence > 92%)',
    mimeType: 'image/svg+xml',
    ...createSvgDataUrl(gradeASvg),
    groundTruthObservations: {
      vegetableType: 'potato',
      detected: true,
      detectionConfidence: 0.98,
      defects: [],
      shape: {
        category: 'regular',
        confidence: 0.95,
        description: 'Symmetric oval contour characteristic of premium market Russet Burbank.',
      },
      size: {
        category: 'medium',
        confidence: 0.91,
        qualitativeNotes: 'Visual qualitative estimate based on frame framing; physical millimeters cannot be claimed without calibrated reference.',
      },
      surface: {
        condition: 'clean',
        confidence: 0.94,
      },
      overallConfidence: 0.96,
      imageQualityOk: true,
      imageQualityIssues: [],
      rawObservationsSummary: 'Symmetric, smooth epidermis with standard shallow eyes. Zero structural cracks, rot lesions, or greening.',
    },
  },
  {
    id: 'demo_grade_b',
    name: 'Sample 2: Processing Russet (Grade B)',
    description: 'Slightly irregular tapering with minor surface scabbing and light shoulder greening.',
    category: 'Grade B Candidate',
    expectedOutcome: 'Expected Result: Grade B (Commercial tolerance acceptable)',
    mimeType: 'image/svg+xml',
    ...createSvgDataUrl(gradeBSvg),
    groundTruthObservations: {
      vegetableType: 'potato',
      detected: true,
      detectionConfidence: 0.96,
      defects: [
        {
          id: 'def_b1',
          type: 'scab',
          label: 'Common Scab',
          severity: 'minor',
          confidence: 0.92,
          visibleEvidence: 'Superficial corky scabbing lesions covering <5% of lateral surface area',
        },
        {
          id: 'def_b2',
          type: 'greening',
          label: 'Surface Greening',
          severity: 'minor',
          confidence: 0.88,
          visibleEvidence: 'Visible chlorophyll pigmentation on upper apical shoulder',
        },
      ],
      shape: {
        category: 'slightly_irregular',
        confidence: 0.89,
        description: 'Minor tapering towards stem end, well within standard processing limits.',
      },
      size: {
        category: 'medium',
        confidence: 0.88,
        qualitativeNotes: 'Visual qualitative estimate based on frame framing; physical millimeters cannot be claimed without calibrated reference.',
      },
      surface: {
        condition: 'blemished',
        confidence: 0.91,
      },
      overallConfidence: 0.90,
      imageQualityOk: true,
      imageQualityIssues: [],
      rawObservationsSummary: 'Minor superficial common scab blemishes and localized light greening. Acceptable for secondary commercial processing.',
    },
  },
  {
    id: 'demo_reject',
    name: 'Sample 3: Defective Tuber (Reject)',
    description: 'Severe deep tissue growth crack and dark rot/blight necrotic lesion.',
    category: 'Reject Candidate',
    expectedOutcome: 'Expected Result: Reject (Triggered by severe rot & deep crack)',
    mimeType: 'image/svg+xml',
    ...createSvgDataUrl(rejectSvg),
    groundTruthObservations: {
      vegetableType: 'potato',
      detected: true,
      detectionConfidence: 0.94,
      defects: [
        {
          id: 'def_r1',
          type: 'rot',
          label: 'Soft Rot / Late Blight Necrosis',
          severity: 'severe',
          confidence: 0.95,
          visibleEvidence: 'Dark sunken rot lesion penetrating dermal barrier with soft decay indicators',
        },
        {
          id: 'def_r2',
          type: 'cracks',
          label: 'Deep Structural Growth Crack',
          severity: 'severe',
          confidence: 0.93,
          visibleEvidence: 'Longitudinal structural fissure penetrating internal flesh tissue',
        },
      ],
      shape: {
        category: 'irregular',
        confidence: 0.92,
        description: 'Severely deformed tuber body with knobby malformations.',
      },
      size: {
        category: 'large',
        confidence: 0.85,
        qualitativeNotes: 'Visual qualitative estimate based on frame framing; physical millimeters cannot be claimed without calibrated reference.',
      },
      surface: {
        condition: 'blemished',
        confidence: 0.95,
      },
      overallConfidence: 0.93,
      imageQualityOk: true,
      imageQualityIssues: [],
      rawObservationsSummary: 'Severe biological decay lesions and deep structural fissure detected. Quarantined from human consumption.',
    },
  },
  {
    id: 'demo_non_potato',
    name: 'Sample 4: Red Apple (Negative Control)',
    description: 'Non-potato object used to test the potato detection gate and prevent false grading.',
    category: 'Negative Control (Non-Potato)',
    expectedOutcome: 'Expected Result: "Potato not detected" — No grade assigned',
    mimeType: 'image/svg+xml',
    ...createSvgDataUrl(nonPotatoSvg),
    groundTruthObservations: {
      vegetableType: 'potato',
      detected: false,
      detectionConfidence: 0.04,
      detectionMessage: 'Object is identified as a red apple (Malus domestica), not a potato (Solanum tuberosum). AgriGrade currently supports only potatoes.',
      defects: [],
      shape: {
        category: 'unknown',
        confidence: 0,
      },
      size: {
        category: 'unknown',
        confidence: 0,
        qualitativeNotes: 'Non-potato object cannot be sized under potato criteria.',
      },
      surface: {
        condition: 'unknown',
        confidence: 0,
      },
      overallConfidence: 0.04,
      imageQualityOk: true,
      imageQualityIssues: [],
      rawObservationsSummary: 'Negative control check: non-potato object properly rejected at intake gate.',
    },
  },
];
