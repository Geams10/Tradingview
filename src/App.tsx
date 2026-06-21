import { useState } from 'react';
import './App.css';
import { PreflopTrainer } from './components/PreflopTrainer';
import { PostflopTrainer } from './components/PostflopTrainer';
import { EquityCalculator } from './components/EquityCalculator';

type Tab = 'preflop' | 'postflop' | 'equity';

const TABS: { id: Tab; label: string }[] = [
  { id: 'preflop', label: 'Preflop Trainer' },
  { id: 'postflop', label: 'Postflop Trainer' },
  { id: 'equity', label: 'Equity Calculator' },
];

function App() {
  const [tab, setTab] = useState<Tab>('preflop');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Poker Trainer</h1>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'tab-active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'preflop' && <PreflopTrainer />}
        {tab === 'postflop' && <PostflopTrainer />}
        {tab === 'equity' && <EquityCalculator />}
      </main>
    </div>
  );
}

export default App;
