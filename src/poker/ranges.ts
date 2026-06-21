import type { Card, Rank } from './types';
import { RANKS, rankValue } from './types';

/** Canonical 169-hand code, e.g. "AA", "AKs", "AKo" (higher rank always first). */
export type HandCode = string;

function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

export function handCodeFromCards(c1: Card, c2: Card): HandCode {
  const [hi, lo] = rankValue(c1.rank) >= rankValue(c2.rank) ? [c1, c2] : [c2, c1];
  if (hi.rank === lo.rank) return `${hi.rank}${lo.rank}`;
  const suited = hi.suit === lo.suit;
  return `${hi.rank}${lo.rank}${suited ? 's' : 'o'}`;
}

/**
 * Parses chart shorthand tokens into a set of 169-hand codes.
 * Supported forms: "AA" (pair), "22+" (pair and above), "AKs"/"AKo" (exact),
 * "A2s+"/"K9o+" (first rank fixed, second rank and above, suited/offsuit).
 */
export function parseRangeTokens(tokens: string[]): Set<HandCode> {
  const codes = new Set<HandCode>();

  for (const raw of tokens) {
    const token = raw.trim();
    if (!token) continue;

    const pairMatch = token.match(/^([2-9TJQKA])\1(\+)?$/);
    if (pairMatch) {
      const [, r, plus] = pairMatch;
      const startIdx = rankIndex(r as Rank);
      const end = plus ? RANKS.length - 1 : startIdx;
      for (let i = startIdx; i <= end; i++) {
        codes.add(`${RANKS[i]}${RANKS[i]}`);
      }
      continue;
    }

    const suitedMatch = token.match(/^([2-9TJQKA])([2-9TJQKA])(s|o)(\+)?$/);
    if (suitedMatch) {
      const [, r1, r2, so, plus] = suitedMatch;
      const hiIdx = rankIndex(r1 as Rank);
      const loIdx = rankIndex(r2 as Rank);
      if (loIdx >= hiIdx) {
        throw new Error(`Invalid range token "${token}": second rank must be lower than first`);
      }
      const endIdx = plus ? hiIdx - 1 : loIdx;
      for (let i = loIdx; i <= endIdx; i++) {
        codes.add(`${r1}${RANKS[i]}${so}`);
      }
      continue;
    }

    throw new Error(`Unrecognized range token: "${token}"`);
  }

  return codes;
}

export function isHandInRange(code: HandCode, range: Set<HandCode>): boolean {
  return range.has(code);
}

/** Ranks from A down to 2, the order used for grid rows/columns. */
export const RANKS_DESC: Rank[] = [...RANKS].reverse();

/**
 * All 169 starting-hand codes as a 13x13 grid (row-major, A..2 by A..2).
 * Diagonal entries are pairs, above-diagonal are suited, below-diagonal are offsuit.
 */
export function allHandCodes(): HandCode[] {
  const codes: HandCode[] = [];
  for (const rowRank of RANKS_DESC) {
    for (const colRank of RANKS_DESC) {
      const rowIdx = rankIndex(rowRank);
      const colIdx = rankIndex(colRank);
      if (rowIdx === colIdx) {
        codes.push(`${rowRank}${colRank}`);
      } else if (rowIdx > colIdx) {
        codes.push(`${rowRank}${colRank}s`);
      } else {
        codes.push(`${colRank}${rowRank}o`);
      }
    }
  }
  return codes;
}
