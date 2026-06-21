import type { Card } from './types';
import { RANKS, SUITS } from './types';

export function freshDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function removeCards(deck: Card[], used: Card[]): Card[] {
  const usedKeys = new Set(used.map(cardKey));
  return deck.filter((c) => !usedKeys.has(cardKey(c)));
}

export function dealRandom(deck: Card[], count: number): Card[] {
  return shuffle(deck).slice(0, count);
}
