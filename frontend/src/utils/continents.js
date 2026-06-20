export const CONTINENTS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

const RULES = [
  { continent: 'Africa',   keywords: ['lagos', 'cape town', 'marrakech', 'tanzania', 'kenya', 'nairobi', 'mara'] },
  { continent: 'Americas', keywords: ['new york', 'cuba', 'havana', 'varadero'] },
  { continent: 'Asia',     keywords: ['dubai', 'tokyo', 'bali', 'maldives', 'japan', 'kyoto', 'osaka', 'jordan', 'thailand', 'phuket'] },
  { continent: 'Europe',   keywords: ['lisbon', 'santorini', 'paris', 'barcelona', 'rome', 'iceland', 'amalfi', 'amsterdam', 'switzerland', 'bexley', 'london', 'uk'] },
  { continent: 'Oceania',  keywords: ['sydney', 'australia'] },
];

export function getContinent(destination) {
  const d = destination.toLowerCase();
  const match = RULES.find(r => r.keywords.some(k => d.includes(k)));
  return match ? match.continent : 'Other';
}
