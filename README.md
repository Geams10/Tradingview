# Poker Trainer

A browser-based Texas Hold'em training app with three tools:

- **Preflop Range Trainer** — deals a random hand and position, you decide
  raise or fold against simplified 6-max RFI charts, with a visual range
  grid to review afterwards.
- **Postflop Decision Trainer** — generates a flop/turn/river scenario where
  villain has bet, and grades your fold/call/raise decision against
  Monte Carlo-simulated equity and pot odds.
- **Equity Calculator** — hand-vs-hand or hand-vs-range equity, computed via
  Monte Carlo simulation over a real 7-card hand evaluator.

The preflop charts are hand-built approximations of commonly published
solver-inspired ranges, meant for training intuition rather than exact
solver output. The equity numbers are real simulations, not heuristics.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # typecheck + production build
npm run lint      # eslint
npm run verify    # sanity-check the poker engine (hand evaluator, ranges, equity)
```
