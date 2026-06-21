import type { Card } from './types';
import { freshDeck, dealRandom, removeCards } from './deck';
import type { RangeSpec } from './equity';
import { simulateEquity } from './equity';
import { getRfiRange } from './preflopCharts';

export type PostflopDecision = 'fold' | 'call' | 'raise';

export interface PostflopScenario {
  hero: [Card, Card];
  board: Card[];
  potBeforeBet: number;
  villainBet: number;
  equity: number;
  breakeven: number;
  correctDecision: PostflopDecision;
}

/** Stand-in for the opponent's betting range: a wide-ish range used purely for training math. */
function villainRangeSpec(): RangeSpec {
  return { kind: 'range', codes: getRfiRange('CO') };
}

function decisionFor(equity: number, breakeven: number): PostflopDecision {
  if (equity < breakeven) return 'fold';
  if (equity >= 65) return 'raise';
  return 'call';
}

export function generateScenario(): PostflopScenario {
  const deck = freshDeck();
  const dealt = dealRandom(deck, 2);
  const hero: [Card, Card] = [dealt[0], dealt[1]];
  const remaining = removeCards(deck, hero);

  const streetRoll = Math.random();
  const boardSize = streetRoll < 0.5 ? 3 : streetRoll < 0.8 ? 4 : 5;
  const board = dealRandom(remaining, boardSize);

  const potBeforeBet = Math.round((20 + Math.random() * 180) / 5) * 5;
  const betFraction = 0.33 + Math.random() * 0.67; // 33%-100% pot
  const villainBet = Math.max(5, Math.round((potBeforeBet * betFraction) / 5) * 5);

  const breakeven = (villainBet / (potBeforeBet + 2 * villainBet)) * 100;

  const heroSpec: RangeSpec = { kind: 'exact', cards: hero };
  const result = simulateEquity(heroSpec, villainRangeSpec(), board, 4000);

  const correctDecision = decisionFor(result.win + result.tie / 2, breakeven);

  return {
    hero,
    board,
    potBeforeBet,
    villainBet,
    equity: result.win + result.tie / 2,
    breakeven,
    correctDecision,
  };
}
