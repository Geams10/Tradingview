import { evaluateBestHand, handClassName } from '../src/poker/handEvaluator';
import { cardFromString } from '../src/poker/types';
import { parseRangeTokens, handCodeFromCards, allHandCodes } from '../src/poker/ranges';
import { getRfiRange, POSITIONS } from '../src/poker/preflopCharts';
import { simulateEquity } from '../src/poker/equity';

function cards(s: string) {
  return s.split(' ').map(cardFromString);
}

function holeCards(s: string): [ReturnType<typeof cardFromString>, ReturnType<typeof cardFromString>] {
  const parsed = cards(s);
  return [parsed[0], parsed[1]];
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exitCode = 1;
  } else {
    console.log('OK:', msg);
  }
}

// --- Hand evaluator tests ---
const royalFlush = evaluateBestHand(cards('Ah Kh Qh Jh Th 2c 3d'));
assert(handClassName(royalFlush) === 'Straight Flush', 'royal flush detected as straight flush');

const quads = evaluateBestHand(cards('Ah Ad Ac As Kh 2c 3d'));
assert(handClassName(quads) === 'Four of a Kind', 'quads detected');

const wheelStraight = evaluateBestHand(cards('Ah 2d 3c 4s 5h 9c 9d'));
assert(handClassName(wheelStraight) === 'Straight', 'wheel (A-5) straight detected');

const fullHouse = evaluateBestHand(cards('Kh Kd Kc 2s 2h 9c 3d'));
assert(handClassName(fullHouse) === 'Full House', 'full house detected');

const flush = evaluateBestHand(cards('2h 5h 9h Jh Kh 3c 4d'));
assert(handClassName(flush) === 'Flush', 'flush detected');

const highCard = evaluateBestHand(cards('2h 5d 9c Jc Ks 3s 7d'));
assert(handClassName(highCard) === 'High Card', 'high card detected (no pair)');

// AA beats KK
const aces = evaluateBestHand(cards('Ah Ad 2c 5d 9h Jc Ks'));
const kings = evaluateBestHand(cards('Kh Kd 2c 5d 9h Jc 7s'));
assert(aces > kings, 'pair of aces beats pair of kings on same board');

// straight beats trips
const straightHand = evaluateBestHand(cards('5h 6d 7c 8s 9h 2c 2d'));
const tripsHand = evaluateBestHand(cards('2h 2d 2c 8s 9h 5c 6d'));
assert(straightHand > tripsHand, 'straight beats three of a kind');

// --- Range parser tests ---
const r1 = parseRangeTokens(['22+']);
assert(r1.has('AA') && r1.has('22') && r1.has('77') && !r1.has('AKs'), '"22+" expands to all pairs 22-AA');

const r2 = parseRangeTokens(['A2s+']);
assert(r2.has('A2s') && r2.has('AKs') && !r2.has('AA') && !r2.has('A2o'), '"A2s+" expands suited aces, excludes pairs/offsuit');

const r3 = parseRangeTokens(['KTo+']);
assert(r3.has('KTo') && r3.has('KQo') && !r3.has('K9o') && !r3.has('KTs'), '"KTo+" expands offsuit kings KT-KQ only');

assert(allHandCodes().length === 169, 'grid has all 169 starting hands');

assert(handCodeFromCards(cardFromString('Ah'), cardFromString('Kh')) === 'AKs', 'AhKh is coded as AKs');
assert(handCodeFromCards(cardFromString('Ah'), cardFromString('Kd')) === 'AKo', 'AhKd is coded as AKo');
assert(handCodeFromCards(cardFromString('7h'), cardFromString('7d')) === '77', '7h7d is coded as 77');

for (const pos of POSITIONS) {
  const range = getRfiRange(pos);
  assert(range.has('AA'), `${pos} RFI range includes AA`);
  assert(!range.has('72o'), `${pos} RFI range excludes 72o`);
}
assert(getRfiRange('UTG').size < getRfiRange('BTN').size, 'UTG range is tighter than BTN range');

// --- Equity sanity checks (Monte Carlo, so use loose tolerance) ---
function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

const aaVsRandom = simulateEquity(
  { kind: 'exact', cards: holeCards('Ah Ad') },
  { kind: 'range', codes: new Set(allHandCodes()) },
  [],
  6000
);
console.log('AA vs random range equity:', pct(aaVsRandom.win + aaVsRandom.tie / 2));
assert(
  aaVsRandom.win + aaVsRandom.tie / 2 > 80 && aaVsRandom.win + aaVsRandom.tie / 2 < 90,
  'AA vs full random range is ~85% equity (known benchmark)'
);

const aaVsKk = simulateEquity(
  { kind: 'exact', cards: holeCards('Ah Ad') },
  { kind: 'exact', cards: holeCards('Kh Kd') },
  [],
  6000
);
console.log('AA vs KK equity:', pct(aaVsKk.win + aaVsKk.tie / 2));
assert(
  aaVsKk.win + aaVsKk.tie / 2 > 78 && aaVsKk.win + aaVsKk.tie / 2 < 86,
  'AA vs KK preflop is ~82% equity (known benchmark)'
);

const flushDrawOnFlop = simulateEquity(
  { kind: 'exact', cards: holeCards('Ah Kh') },
  { kind: 'exact', cards: holeCards('Qc Qd') },
  cards('2h 7h 9c'),
  6000
);
console.log('Nut flush draw + overcards vs QQ on flop:', pct(flushDrawOnFlop.win + flushDrawOnFlop.tie / 2));
assert(
  flushDrawOnFlop.win + flushDrawOnFlop.tie / 2 > 48 && flushDrawOnFlop.win + flushDrawOnFlop.tie / 2 < 60,
  'AKhh flush draw (4 hearts + 2 overcards) vs QQ on 2h7h9c is in the expected ~50-56% range'
);

if (process.exitCode === 1) {
  console.error('\nSome checks failed.');
} else {
  console.log('\nAll checks passed.');
}
