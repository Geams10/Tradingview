import { useState } from 'react';
import type { PostflopDecision, PostflopScenario } from '../poker/postflopScenario';
import { generateScenario } from '../poker/postflopScenario';
import { CardRow } from './CardView';

export function PostflopTrainer() {
  const [scenario, setScenario] = useState<PostflopScenario>(() => generateScenario());
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<PostflopDecision | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const nextScenario = () => {
    setLoading(true);
    setAnswer(null);
    setTimeout(() => {
      setScenario(generateScenario());
      setLoading(false);
    }, 10);
  };

  const submit = (choice: PostflopDecision) => {
    if (answer) return;
    setAnswer(choice);
    const correct = choice === scenario.correctDecision;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="trainer">
      <h2>Postflop Decision Trainer</h2>
      <p className="subtitle">
        Villain bets into you. Decide fold, call, or raise using equity vs. pot odds.
      </p>

      {loading ? (
        <p>Dealing scenario…</p>
      ) : (
        <>
          <div className="hand-display">
            <h3>Your hand</h3>
            <CardRow cards={scenario.hero} size="lg" />
            <h3>Board</h3>
            <CardRow cards={scenario.board} size="lg" />
          </div>

          <div className="pot-info">
            <div>Pot before bet: {scenario.potBeforeBet}</div>
            <div>Villain bets: {scenario.villainBet}</div>
            <div>Pot odds breakeven equity: {scenario.breakeven.toFixed(1)}%</div>
          </div>

          <div className="action-row">
            <button className="btn-fold" disabled={!!answer} onClick={() => submit('fold')}>
              Fold
            </button>
            <button className="btn-call" disabled={!!answer} onClick={() => submit('call')}>
              Call
            </button>
            <button className="btn-raise" disabled={!!answer} onClick={() => submit('raise')}>
              Raise
            </button>
          </div>

          {answer && (
            <div className={`feedback ${answer === scenario.correctDecision ? 'feedback-correct' : 'feedback-wrong'}`}>
              {answer === scenario.correctDecision ? 'Correct!' : 'Not quite.'} Your equity vs. villain's estimated
              range is <strong>{scenario.equity.toFixed(1)}%</strong>, and you need{' '}
              <strong>{scenario.breakeven.toFixed(1)}%</strong> to break even on a call.{' '}
              {scenario.correctDecision === 'fold' && 'Equity is below breakeven, so folding is best.'}
              {scenario.correctDecision === 'call' &&
                'Equity clears the pot-odds threshold but isn\'t strong enough to raise for value, so calling is best.'}
              {scenario.correctDecision === 'raise' &&
                'Equity is strong enough to raise for value rather than just calling.'}
              <div>
                <button onClick={nextScenario}>Next scenario</button>
              </div>
            </div>
          )}

          <div className="score">
            Score: {score.correct} / {score.total}
          </div>

          <p className="chart-note">
            Villain's range is approximated as a wide continuing range for training purposes, not a hand-read solver
            output — this trainer focuses on the equity-vs-pot-odds math.
          </p>
        </>
      )}
    </div>
  );
}
