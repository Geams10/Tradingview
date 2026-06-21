import type { Position } from './types';
import type { HandCode } from './ranges';
import { parseRangeTokens } from './ranges';

/**
 * Simplified 6-max, 100bb cash-game raise-first-in (RFI) charts.
 * These are hand-built approximations of commonly published solver-inspired
 * opening ranges, intended for training intuition rather than exact solver output.
 */
const RFI_TOKENS: Record<Position, string[]> = {
  UTG: ['22+', 'A2s+', 'ATo+', 'K9s+', 'KJo+', 'Q9s+', 'QJo+', 'J9s+', 'JTo', 'T9s', '98s', '87s', '76s'],
  HJ: [
    '22+', 'A2s+', 'A9o+', 'K8s+', 'KTo+', 'Q9s+', 'QTo+', 'J8s+', 'JTo', 'T8s+', '98s', '87s', '76s', '65s',
  ],
  CO: [
    '22+', 'A2s+', 'A7o+', 'K5s+', 'K9o+', 'Q8s+', 'QTo+', 'J7s+', 'J9o+', 'T7s+', 'T9o', '96s+', '86s+', '75s+',
    '65s', '54s',
  ],
  BTN: [
    '22+', 'A2s+', 'A2o+', 'K2s+', 'K7o+', 'Q3s+', 'Q8o+', 'J5s+', 'J8o+', 'T5s+', 'T8o+', '94s+', '97o+', '84s+',
    '86o', '74s+', '64s+', '53s+', '43s',
  ],
  SB: [
    '22+', 'A2s+', 'A4o+', 'K3s+', 'K9o+', 'Q5s+', 'QTo+', 'J6s+', 'J9o+', 'T6s+', 'T9o', '95s+', '85s+', '75s+',
    '64s+', '54s',
  ],
};

const RFI_RANGES: Record<Position, Set<HandCode>> = Object.fromEntries(
  Object.entries(RFI_TOKENS).map(([pos, tokens]) => [pos, parseRangeTokens(tokens)])
) as Record<Position, Set<HandCode>>;

export function getRfiRange(position: Position): Set<HandCode> {
  return RFI_RANGES[position];
}

export const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];

export const POSITION_LABELS: Record<Position, string> = {
  UTG: 'Under the Gun',
  HJ: 'Hijack',
  CO: 'Cutoff',
  BTN: 'Button',
  SB: 'Small Blind',
};
