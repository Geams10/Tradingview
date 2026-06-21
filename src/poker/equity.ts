import type { Card } from './types';
import { freshDeck, cardKey, shuffle } from './deck';
import { evaluateBestHand } from './handEvaluator';
import type { HandCode } from './ranges';
import { handCodeFromCards } from './ranges';

export interface EquityResult {
  win: number;
  tie: number;
  lose: number;
  trials: number;
}

export type RangeSpec =
  | { kind: 'exact'; cards: [Card, Card] }
  | { kind: 'range'; codes: Set<HandCode> };

function cardsAvailable(deck: Card[], dead: Set<string>): Card[] {
  return deck.filter((c) => !dead.has(cardKey(c)));
}

/** Picks a random 2-card combo for a range spec that doesn't clash with dead cards. */
function sampleHandFromRange(
  spec: RangeSpec,
  available: Card[],
  dead: Set<string>
): [Card, Card] | null {
  if (spec.kind === 'exact') {
    const [a, b] = spec.cards;
    if (dead.has(cardKey(a)) || dead.has(cardKey(b))) return null;
    return [a, b];
  }

  const pool = shuffle(available);
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const c1 = pool[i];
      const c2 = pool[j];
      if (spec.codes.has(handCodeFromCards(c1, c2))) {
        return [c1, c2];
      }
    }
  }
  return null;
}

/**
 * Monte Carlo equity simulation between two hands/ranges given a (possibly partial) board.
 * Runs `trials` random rollouts of the remaining board and, for range specs, a random
 * compatible hand combo each trial.
 */
export function simulateEquity(
  heroSpec: RangeSpec,
  villainSpec: RangeSpec,
  board: Card[],
  trials = 5000
): EquityResult {
  let win = 0;
  let tie = 0;
  let lose = 0;
  let completed = 0;

  const fullDeck = freshDeck();

  for (let t = 0; t < trials; t++) {
    const dead = new Set<string>(board.map(cardKey));

    const available = cardsAvailable(fullDeck, dead);

    const hero = sampleHandFromRange(heroSpec, available, dead);
    if (!hero) continue;
    const heroDead = new Set(dead);
    heroDead.add(cardKey(hero[0]));
    heroDead.add(cardKey(hero[1]));

    const villainAvailable = cardsAvailable(fullDeck, heroDead);
    const villain = sampleHandFromRange(villainSpec, villainAvailable, heroDead);
    if (!villain) continue;

    const usedKeys = new Set(heroDead);
    usedKeys.add(cardKey(villain[0]));
    usedKeys.add(cardKey(villain[1]));

    const remainingDeck = shuffle(cardsAvailable(fullDeck, usedKeys));
    const missing = 5 - board.length;
    const runout = remainingDeck.slice(0, missing);
    const fullBoard = [...board, ...runout];

    const heroScore = evaluateBestHand([...hero, ...fullBoard]);
    const villainScore = evaluateBestHand([...villain, ...fullBoard]);

    if (heroScore > villainScore) win++;
    else if (heroScore === villainScore) tie++;
    else lose++;
    completed++;
  }

  if (completed === 0) {
    return { win: 0, tie: 0, lose: 0, trials: 0 };
  }

  return {
    win: (win / completed) * 100,
    tie: (tie / completed) * 100,
    lose: (lose / completed) * 100,
    trials: completed,
  };
}
