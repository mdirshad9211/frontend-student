const STATE_PATTERNS = [
  ['All India', /\b(all\s*india|pan\s*india|india\s*wide)\b/i],
  ['Andhra Pradesh', /\b(andhra\s*pradesh|\bap\b)\b/i],
  ['Arunachal Pradesh', /\barunachal\s*pradesh\b/i],
  ['Assam', /\bassam\b/i],
  ['Bihar', /\bbihar\b/i],
  ['Chhattisgarh', /\bchhattisgarh\b/i],
  ['Delhi', /\b(delhi|nct\s*delhi)\b/i],
  ['Goa', /\bgoa\b/i],
  ['Gujarat', /\bgujarat\b/i],
  ['Haryana', /\bharyana\b/i],
  ['Himachal Pradesh', /\bhimachal\s*pradesh\b/i],
  ['Jammu and Kashmir', /\b(jammu\s*&\s*kashmir|jammu\s*and\s*kashmir|jk\b)\b/i],
  ['Jharkhand', /\bjharkhand\b/i],
  ['Karnataka', /\bkarnataka\b/i],
  ['Kerala', /\bkerala\b/i],
  ['Madhya Pradesh', /\bmadhya\s*pradesh\b/i],
  ['Maharashtra', /\bmaharashtra\b/i],
  ['Odisha', /\b(odisha|orissa)\b/i],
  ['Punjab', /\bpunjab\b/i],
  ['Rajasthan', /\brajasthan\b/i],
  ['Tamil Nadu', /\btamil\s*nadu\b/i],
  ['Telangana', /\btelangana\b/i],
  ['Uttar Pradesh', /\buttar\s*pradesh\b|\bup\b/i],
  ['Uttarakhand', /\buttarakhand\b/i],
  ['West Bengal', /\bwest\s*bengal\b/i],
];

function inferExamStates(input) {
  const text = String(input || '').replace(/\s+/g, ' ').trim();
  if (!text) return [];

  const out = [];
  for (const [state, re] of STATE_PATTERNS) {
    if (re.test(text)) out.push(state);
  }

  return [...new Set(out)];
}

module.exports = { inferExamStates };
