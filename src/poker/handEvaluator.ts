import type { Card } from './types';
import { rankValue } from './types';

// Hand class, higher is better: 0 high card ... 8 straight flush
const HAND_CLASS = {
  HIGH_CARD: 0,
  PAIR: 1,
  TWO_PAIR: 2,
  TRIPS: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  QUADS: 7,
  STRAIGHT_FLUSH: 8,
};

const BASE = 15; // > max rank value (14), used to encode tiebreakers in one number
const MAX_TIEBREAKERS = 5;

function encodeScore(handClass: number, tiebreakers: number[]): number {
  let score = handClass;
  for (let i = 0; i < MAX_TIEBREAKERS; i++) {
    score = score * BASE + (tiebreakers[i] ?? 0);
  }
  return score;
}

function evaluate5(cards: Card[]): number {
  const values = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);

  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const groups = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  // straight check (with wheel A-2-3-4-5)
  const uniqueDesc = Array.from(new Set(values)).sort((a, b) => b - a);
  let straightHigh = -1;
  if (uniqueDesc.length >= 5) {
    for (let i = 0; i <= uniqueDesc.length - 5; i++) {
      if (uniqueDesc[i] - uniqueDesc[i + 4] === 4) {
        straightHigh = uniqueDesc[i];
        break;
      }
    }
  }
  if (straightHigh === -1 && uniqueDesc.includes(14) && [2, 3, 4, 5].every((v) => uniqueDesc.includes(v))) {
    straightHigh = 5; // wheel
  }

  if (isFlush && straightHigh !== -1) {
    return encodeScore(HAND_CLASS.STRAIGHT_FLUSH, [straightHigh]);
  }
  if (groups[0][1] === 4) {
    const kicker = groups.find((g) => g[1] === 1)?.[0] ?? 0;
    return encodeScore(HAND_CLASS.QUADS, [groups[0][0], kicker]);
  }
  if (groups[0][1] === 3 && groups[1]?.[1] === 2) {
    return encodeScore(HAND_CLASS.FULL_HOUSE, [groups[0][0], groups[1][0]]);
  }
  if (isFlush) {
    return encodeScore(HAND_CLASS.FLUSH, values);
  }
  if (straightHigh !== -1) {
    return encodeScore(HAND_CLASS.STRAIGHT, [straightHigh]);
  }
  if (groups[0][1] === 3) {
    const kickers = groups.filter((g) => g[1] === 1).map((g) => g[0]);
    return encodeScore(HAND_CLASS.TRIPS, [groups[0][0], ...kickers]);
  }
  if (groups[0][1] === 2 && groups[1]?.[1] === 2) {
    const pairs = [groups[0][0], groups[1][0]].sort((a, b) => b - a);
    const kicker = groups.find((g) => g[1] === 1)?.[0] ?? 0;
    return encodeScore(HAND_CLASS.TWO_PAIR, [...pairs, kicker]);
  }
  if (groups[0][1] === 2) {
    const kickers = groups.filter((g) => g[1] === 1).map((g) => g[0]);
    return encodeScore(HAND_CLASS.PAIR, [groups[0][0], ...kickers]);
  }
  return encodeScore(HAND_CLASS.HIGH_CARD, values);
}

function combinations<T>(items: T[], k: number): T[][] {
  const results: T[][] = [];
  const combo: T[] = [];
  function recurse(start: number) {
    if (combo.length === k) {
      results.push(combo.slice());
      return;
    }
    for (let i = start; i < items.length; i++) {
      combo.push(items[i]);
      recurse(i + 1);
      combo.pop();
    }
  }
  recurse(0);
  return results;
}

/** Evaluates the best 5-card hand score out of 5, 6, or 7 cards. Higher score wins. */
export function evaluateBestHand(cards: Card[]): number {
  if (cards.length === 5) return evaluate5(cards);
  const combos = combinations(cards, 5);
  let best = -Infinity;
  for (const combo of combos) {
    const score = evaluate5(combo);
    if (score > best) best = score;
  }
  return best;
}

export const HAND_CLASS_NAMES = [
  'High Card',
  'Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
];

export function handClassName(score: number): string {
  const classIndex = Math.floor(score / Math.pow(BASE, MAX_TIEBREAKERS));
  return HAND_CLASS_NAMES[classIndex] ?? 'High Card';
}
