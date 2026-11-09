/**
 * @file SegmentBar.tsx
 * @description One segmented bar: a rounded segment per part with a 3 px gap, the room left drawn as dots. It is a meter whose accessible description lists every segment; hovering or focusing a segment reports it through `onActive`, so the caller can show "Files 7.2 TB" in its own label line. Same behaviour as Drift's StorageBar, so that can use this later.
 * Used by: storage and quota readouts.
 */
import { useId } from 'react';
import type { MeterLevel } from './meter';

export interface BarSegment {
  id: string;
  label: string;
  value: number;
  /** Any CSS colour or `var(...)`. */
  color: string;
}

export interface SegmentBarProps<T extends BarSegment = BarSegment> {
  segments: readonly T[];
  /** What the whole bar stands for, in the segments' unit. */
  total: number;
  /** Bar thickness in px. */
  height?: number;
  /** What the meter measures, for screen readers. */
  label?: string;
  /** Formats a value for the screen-reader text ("2.4 TB"); defaults to the number. */
  format?: (value: number) => string;
  /** Set on the meter as `data-level`, so the segments' colours (CSS variables) can follow a level. */
  level?: MeterLevel;
  /** The segment under the pointer or focus, or null when none is. */
  onActive?: (segment: T | null) => void;
  className?: string;
}

export function SegmentBar<T extends BarSegment>({
  segments,
  total,
  height = 8,
  label = 'Used',
  format = String,
  level,
  onActive,
  className = '',
}: SegmentBarProps<T>) {
  const descriptionId = useId();
  const shown = segments.filter((s) => s.value > 0);
  const used = shown.reduce((sum, s) => sum + s.value, 0);
  const description = shown.map((s) => `${s.label} ${format(s.value)}`).join(', ');
  return (
    <div className={className}>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.max(total, used)}
        aria-valuenow={used}
        aria-describedby={description ? descriptionId : undefined}
        data-level={level}
        className="fr-bar"
        style={{ height }}
      >
        {shown.map((s) => (
          <i
            key={s.id}
            role="img"
            tabIndex={0}
            data-testid="bar-segment"
            aria-label={`${s.label}: ${format(s.value)}`}
            className="fr-seg"
            style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%`, background: s.color }}
            onMouseEnter={() => onActive?.(s)}
            onMouseLeave={() => onActive?.(null)}
            onFocus={() => onActive?.(s)}
            onBlur={() => onActive?.(null)}
          />
        ))}
        <b className="fr-free" aria-hidden="true" />
      </div>
      {description ? (
        <p id={descriptionId} className="sr-only">
          {description}
        </p>
      ) : null}
    </div>
  );
}
