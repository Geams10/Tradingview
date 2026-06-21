import type { Card } from '../poker/types';

const SUIT_SYMBOL: Record<Card['suit'], string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const RED_SUITS = new Set(['h', 'd']);

interface CardViewProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
}

export function CardView({ card, size = 'md' }: CardViewProps) {
  const isRed = RED_SUITS.has(card.suit);
  return (
    <div className={`card-view card-${size} ${isRed ? 'card-red' : 'card-black'}`}>
      <span className="card-rank">{card.rank}</span>
      <span className="card-suit">{SUIT_SYMBOL[card.suit]}</span>
    </div>
  );
}

export function CardRow({ cards, size = 'md' }: { cards: Card[]; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="card-row">
      {cards.map((c, i) => (
        <CardView key={i} card={c} size={size} />
      ))}
    </div>
  );
}
