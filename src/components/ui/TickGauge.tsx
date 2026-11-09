/**
 * @file TickGauge.tsx
 * @description A gauge of 40 ticks for a reading from 0 to 100 (temperature, wear): green below 55%, orange to 75%, red above, the ticks past the value faded and a marker at the value. Decoration only (aria-hidden): the number always sits beside it.
 * Used by: detail facts.
 */
import { clampPercent } from './meter';
import { TICKS, tickHue } from './tickScale';

export function TickGauge({ value }: { value: number }) {
  const v = clampPercent(value);
  return (
    <span className="fr-ticks" aria-hidden="true">
      {Array.from({ length: TICKS }, (_, t) => {
        const pos = t * 2.5;
        return <i key={t} data-faded={pos > v} style={{ background: `var(--hue-${tickHue(pos)}-stroke)` }} />;
      })}
      <b style={{ left: `${v}%` }} />
    </span>
  );
}
