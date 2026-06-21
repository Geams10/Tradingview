import type { HandCode } from '../poker/ranges';
import { allHandCodes } from '../poker/ranges';

interface RangeGridProps {
  range: Set<HandCode>;
  highlight?: HandCode;
}

export function RangeGrid({ range, highlight }: RangeGridProps) {
  const codes = allHandCodes();
  return (
    <div className="range-grid">
      {codes.map((code) => {
        const inRange = range.has(code);
        const isHighlight = code === highlight;
        return (
          <div
            key={code}
            className={`range-cell ${inRange ? 'in-range' : 'out-range'} ${isHighlight ? 'highlight' : ''}`}
            title={code}
          >
            {code}
          </div>
        );
      })}
    </div>
  );
}
