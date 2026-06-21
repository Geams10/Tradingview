import { useMemo, useState } from 'react';
import type { Card, Position } from '../poker/types';
import { cardKey } from '../poker/deck';
import type { EquityResult, RangeSpec } from '../poker/equity';
import { simulateEquity } from '../poker/equity';
import { getRfiRange, POSITIONS, POSITION_LABELS } from '../poker/preflopCharts';
import { CardPicker } from './CardPicker';
import { CardRow } from './CardView';

type Target = 'hero' | 'villain' | 'board';
type VillainMode = 'exact' | 'range';

export function EquityCalculator() {
  const [target, setTarget] = useState<Target>('hero');
  const [heroCards, setHeroCards] = useState<Card[]>([]);
  const [villainMode, setVillainMode] = useState<VillainMode>('range');
  const [villainCards, setVillainCards] = useState<Card[]>([]);
  const [villainPosition, setVillainPosition] = useState<Position>('BTN');
  const [boardCards, setBoardCards] = useState<Card[]>([]);
  const [result, setResult] = useState<EquityResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const usedCards = useMemo(() => {
    const set = new Set<string>();
    heroCards.forEach((c) => set.add(cardKey(c)));
    if (villainMode === 'exact') villainCards.forEach((c) => set.add(cardKey(c)));
    boardCards.forEach((c) => set.add(cardKey(c)));
    return set;
  }, [heroCards, villainCards, villainMode, boardCards]);

  const handlePick = (card: Card) => {
    if (target === 'hero' && heroCards.length < 2) {
      setHeroCards((cs) => [...cs, card]);
    } else if (target === 'villain' && villainMode === 'exact' && villainCards.length < 2) {
      setVillainCards((cs) => [...cs, card]);
    } else if (target === 'board' && boardCards.length < 5) {
      setBoardCards((cs) => [...cs, card]);
    }
    setResult(null);
  };

  const canCalculate = heroCards.length === 2 && (villainMode === 'range' || villainCards.length === 2);

  const calculate = () => {
    if (!canCalculate) return;
    setCalculating(true);
    setResult(null);
    setTimeout(() => {
      const heroSpec: RangeSpec = { kind: 'exact', cards: [heroCards[0], heroCards[1]] };
      const villainSpec: RangeSpec =
        villainMode === 'exact'
          ? { kind: 'exact', cards: [villainCards[0], villainCards[1]] }
          : { kind: 'range', codes: getRfiRange(villainPosition) };
      const r = simulateEquity(heroSpec, villainSpec, boardCards, 4000);
      setResult(r);
      setCalculating(false);
    }, 10);
  };

  const reset = () => {
    setHeroCards([]);
    setVillainCards([]);
    setBoardCards([]);
    setResult(null);
  };

  return (
    <div className="trainer">
      <h2>Equity Calculator</h2>
      <p className="subtitle">Pick a hero hand, a villain hand or range, and an optional board. Monte Carlo simulated.</p>

      <div className="equity-section">
        <h3>Hero hand</h3>
        <CardRow cards={heroCards} size="md" />
        <button className={target === 'hero' ? 'target-active' : ''} onClick={() => setTarget('hero')}>
          Pick hero cards
        </button>
      </div>

      <div className="equity-section">
        <h3>Villain</h3>
        <div className="villain-mode-toggle">
          <label>
            <input
              type="radio"
              checked={villainMode === 'range'}
              onChange={() => {
                setVillainMode('range');
                setVillainCards([]);
                setResult(null);
              }}
            />
            Range
          </label>
          <label>
            <input
              type="radio"
              checked={villainMode === 'exact'}
              onChange={() => {
                setVillainMode('exact');
                setResult(null);
              }}
            />
            Exact hand
          </label>
        </div>

        {villainMode === 'range' ? (
          <select
            value={villainPosition}
            onChange={(e) => {
              setVillainPosition(e.target.value as Position);
              setResult(null);
            }}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {POSITION_LABELS[p]} RFI range
              </option>
            ))}
          </select>
        ) : (
          <>
            <CardRow cards={villainCards} size="md" />
            <button className={target === 'villain' ? 'target-active' : ''} onClick={() => setTarget('villain')}>
              Pick villain cards
            </button>
          </>
        )}
      </div>

      <div className="equity-section">
        <h3>Board ({boardCards.length}/5)</h3>
        <CardRow cards={boardCards} size="md" />
        <button className={target === 'board' ? 'target-active' : ''} onClick={() => setTarget('board')}>
          Pick board cards
        </button>
      </div>

      <CardPicker usedCards={usedCards} onPick={handlePick} />

      <div className="action-row">
        <button disabled={!canCalculate || calculating} onClick={calculate}>
          {calculating ? 'Calculating…' : 'Calculate equity'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      {result && result.trials > 0 && (
        <div className="equity-result">
          <div>Win: {result.win.toFixed(1)}%</div>
          <div>Tie: {result.tie.toFixed(1)}%</div>
          <div>Lose: {result.lose.toFixed(1)}%</div>
          <div className="chart-note">Based on {result.trials} simulated trials.</div>
        </div>
      )}
    </div>
  );
}
