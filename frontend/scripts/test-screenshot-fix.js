const fs = require('fs');
const path = require('path');
const http = require('http');

// We test risk-engine on screenshot texts
const { assess } = require('../lib/risk-engine.ts');

console.log('--- Testing Screenshot OCR Text Evaluation in Heuristic Engine ---');

const scamScenarios = [
  {
    name: 'Electricity Disconnection Notice',
    text: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from the electric office because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210. BESCOM.',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'SBI YONO KYC Suspension Threat',
    text: 'Dear SBI User, your YONO account has been suspended. Please click http://sbi-kyc-verify.vip to update your PAN and Aadhaar immediately.',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'Digital Arrest / TRAI Police Threat',
    text: 'TRAI Warning: An illegal parcel containing contraband has been intercepted in your name. A digital arrest warrant has been issued by CBI. Do not disconnect this call.',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'India Post Courier Hold',
    text: 'India Post: Your package shipment failed delivery due to incomplete house number. Update your address within 24 hours at http://indiapost-parcel.top to reschedule delivery.',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'Unsolicited Prize / Lottery',
    text: 'Congratulations! You have won a 1st prize cash reward of Rs 25,00,000 in KBC Lucky Draw. Call WhatsApp manager to claim your prize.',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'Legitimate Safe Notification',
    text: 'Your electricity bill of Rs 1,250 for September has been paid successfully via BESCOM portal. Transaction ID: TXN987654321. Thank you.',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'Hindi Electricity Disconnection Scam',
    text: 'प्रिय ग्राहक, आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा क्योंकि पिछले महीने का बिल अपडेट नहीं हुआ है। तुरंत बिजली अधिकारी से 9876543210 पर संपर्क करें।',
    lang: 'hi',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'Kannada Electricity Disconnection Scam',
    text: 'ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿಯಾಗದ ಕಾರಣ ಇಂದೇ ರಾತ್ರಿ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಲಾಗುವುದು. ತಕ್ಷಣ ನಮ್ಮ ಅಧಿಕಾರಿಗೆ 9876543210 ಗೆ ಕರೆ ಮಾಡಿ.',
    lang: 'kn',
    expectedNot: 'CANNOT_DETERMINE',
  },
  {
    name: 'Telugu Electricity Disconnection Scam',
    text: 'ప్రియమైన వినియోగదారుడా, మీ విద్యుత్ బిల్లు చెల్లించనందున ఈ రాత్రే విద్యుత్ కనెక్షన్ నిలిపివేయబడుతుంది. వెంటనే మా అధికారిని 9876543210 నంబర్‌లో సంప్రదించండి.',
    lang: 'te',
    expectedNot: 'CANNOT_DETERMINE',
  },
];

let failed = 0;
for (const sc of scamScenarios) {
  const result = assess(sc.text, 'SCREENSHOT', sc.lang || 'en');
  console.log(`[${sc.name}] (${sc.lang || 'en'}) -> RiskLevel: ${result.riskLevel}, Score: ${result.riskScore}, Classification: "${result.classification}"`);
  if (result.riskLevel === sc.expectedNot) {
    console.error(`FAILED: ${sc.name} returned ${sc.expectedNot}!`);
    failed++;
  } else {
    console.log(`  ✓ Passed: Detected as ${result.riskLevel}`);
  }
}

if (failed === 0) {
  console.log('\n✓ ALL SCREENSHOT TEXT SCENARIOS PASSED WITH ZERO "CANNOT_DETERMINE" FALSE POSITIVES!');
} else {
  console.error(`\nFAILED: ${failed} scenarios failed.`);
  process.exit(1);
}
