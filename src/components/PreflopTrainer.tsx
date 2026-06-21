import { useCallback, useState } from 'react';
import type { Card, PreflopAction, Position } from '../poker/types';
import { freshDeck, dealRandom } from '../poker/deck';
import { handCodeFromCards } from '../poker/ranges';
import { getRfiRange, POSITIONS, POSITION_LABELS } from '../poker/preflopCharts';
import { CardRow } from './CardView';
import { RangeGrid } from './RangeGrid';

interface Round {
  position: Position;
  hand: [Card, Card];
}

function randomRound(): Round {
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const dealt = dealRandom(freshDeck(), 2);
  return { position, hand: [dealt[0], dealt[1]] };
}

export function PreflopTrainer() {
  const [round, setRound] = useState<Round>(() => randomRound());
  const [answer, setAnswer] = useState<PreflopAction | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showChart, setShowChart] = useState(false);

  const handCode = handCodeFromCards(round.hand[0], round.hand[1]);
  const range = getRfiRange(round.position);
  const isRaise = range.has(handCode);

  const nextRound = useCallback(() => {
    setRound(randomRound());
    setAnswer(null);
  }, []);

  const submit = (choice: PreflopAction) => {
    if (answer) return;
    setAnswer(choice);
    const correct = choice === (isRaise ? 'raise' : 'fold');
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="trainer">
      <h2>Preflop Range Trainer</h2>
      <p className="subtitle">
        You're first to act, folded to you in <strong>{POSITION_LABELS[round.position]}</strong>. Raise or fold?
      </p>

      <div className="hand-display">
        <CardRow cards={round.hand} size="lg" />
      </div>

      <div className="action-row">
        <button disabled={!!answer} onClick={() => submit('raise')}>
          Raise
        </button>
        <button disabled={!!answer} onClick={() => submit('fold')}>
          Fold
        </button>
      </div>

      {answer && (
        <div className={`feedback ${answer === (isRaise ? 'raise' : 'fold') ? 'feedback-correct' : 'feedback-wrong'}`}>
          {answer === (isRaise ? 'raise' : 'fold') ? 'Correct!' : 'Not quite.'} {handCode} is{' '}
          {isRaise ? 'inside' : 'outside'} the {POSITION_LABELS[round.position]} opening range.
          <div>
            <button onClick={nextRound}>Next hand</button>
          </div>
        </div>
      )}

      <div className="score">
        Score: {score.correct} / {score.total}
      </div>

      <div className="chart-toggle">
        <button onClick={() => setShowChart((v) => !v)}>{showChart ? 'Hide' : 'Show'} {round.position} chart</button>
      </div>

      {showChart && (
        <>
          <RangeGrid range={range} highlight={handCode} />
          <p className="chart-note">
            Simplified training charts, approximate solver-inspired 6-max RFI ranges — not exact GTO output.
          </p>
        </>
      )}
    </div>
  );
}
