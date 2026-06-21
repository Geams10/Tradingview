export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

export function rankValue(rank: Rank): number {
  return RANKS.indexOf(rank) + 2;
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function cardFromString(s: string): Card {
  return { rank: s[0] as Rank, suit: s[1] as Suit };
}

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB';

export type PreflopAction = 'raise' | 'fold';

export type PostflopAction = 'check' | 'bet' | 'call' | 'raise' | 'fold';

export type Street = 'flop' | 'turn' | 'river';
