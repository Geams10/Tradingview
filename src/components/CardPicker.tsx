import type { Card } from '../poker/types';
import { RANKS, SUITS } from '../poker/types';
import { cardKey } from '../poker/deck';
import { CardView } from './CardView';

interface CardPickerProps {
  usedCards: Set<string>;
  onPick: (card: Card) => void;
}

export function CardPicker({ usedCards, onPick }: CardPickerProps) {
  return (
    <div className="card-picker">
      {[...RANKS].reverse().map((rank) => (
        <div className="card-picker-row" key={rank}>
          {SUITS.map((suit) => {
            const card: Card = { rank, suit };
            const used = usedCards.has(cardKey(card));
            return (
              <button
                key={suit}
                className="card-picker-cell"
                disabled={used}
                onClick={() => onPick(card)}
              >
                <CardView card={card} size="sm" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
