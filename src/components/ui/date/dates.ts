/**
 * @file dates.ts
 * @description Wall dates and wall times for the pickers, without a date library: `IsoDate` is `YYYY-MM-DD`, `WallTime` is `HH:MM` on a 24-hour clock. Day arithmetic runs on UTC midnights, so no local time zone or daylight-saving change can shift a day; time zones stay in the app.
 * Used by: CalendarGrid, DateField, TimeField, TimeRangeFields, DateRangeFields, DateTimeField; exported for apps that need the same reading of typed times.
 */

/** A calendar day, `YYYY-MM-DD`. */
export type IsoDate = string;
/** A time of day, `HH:MM` on a 24-hour clock. */
export type WallTime = string;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** The UTC midnight of a day, or NaN when the text is not a real day. */
function utc(iso: IsoDate): number {
  const m = ISO_RE.exec(iso);
  if (!m) return Number.NaN;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  // Date.UTC rolls 31 February over into March; a day that does not exist is not a day.
  return back.getUTCFullYear() === y && back.getUTCMonth() === mo - 1 && back.getUTCDate() === d ? t : Number.NaN;
}

function fromUtc(t: number): IsoDate {
  const d = new Date(t);
  return `${String(d.getUTCFullYear()).padStart(4, '0')}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** True for a real day written `YYYY-MM-DD`. */
export function isIsoDate(text: string): boolean {
  return !Number.isNaN(utc(text));
}

/** The day `n` days later (earlier for a negative `n`). */
export function addDays(iso: IsoDate, n: number): IsoDate {
  return fromUtc(utc(iso) + n * DAY_MS);
}

/** The same day `n` months later, kept inside the month (31 January plus one month is 28 or 29 February). */
export function addMonths(iso: IsoDate, n: number): IsoDate {
  const d = new Date(utc(iso));
  const first = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
  const f = new Date(first);
  const last = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth() + 1, 0)).getUTCDate();
  return fromUtc(Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), Math.min(d.getUTCDate(), last)));
}

/** The first day of the day's month. */
export function startOfMonth(iso: IsoDate): IsoDate {
  return `${iso.slice(0, 7)}-01`;
}

/** 0 for Sunday to 6 for Saturday. */
export function weekday(iso: IsoDate): number {
  return new Date(utc(iso)).getUTCDay();
}

/** Whole days from `a` to `b` (negative when `b` is earlier). */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((utc(b) - utc(a)) / DAY_MS);
}

/** The first day of the week holding `iso`. */
export function startOfWeek(iso: IsoDate, weekStartsOn: 0 | 1): IsoDate {
  return addDays(iso, -((weekday(iso) - weekStartsOn + 7) % 7));
}

/** The six weeks a month grid shows: 42 days from the start of the week holding the 1st. */
export function monthDays(month: IsoDate, weekStartsOn: 0 | 1): IsoDate[] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

/** `iso` held between `min` and `max` (either may be absent). */
export function clampDate(iso: IsoDate, min?: IsoDate, max?: IsoDate): IsoDate {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** The next Monday strictly after `today` (a week later when today is a Monday). */
export function nextMonday(today: IsoDate): IsoDate {
  return addDays(today, ((8 - weekday(today)) % 7) || 7);
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale ?? ''}|${JSON.stringify(options)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
    formatters.set(key, f);
  }
  return f;
}

/** Formats a wall day with Intl, read at UTC midnight so the day never shifts. */
export function formatDate(iso: IsoDate, options: Intl.DateTimeFormatOptions, locale?: string): string {
  return formatter(locale, options).format(new Date(utc(iso)));
}

/** The parts of a date in the locale's order, joined by spaces: Intl puts a comma after the weekday when a year follows. */
function spaced(iso: IsoDate, options: Intl.DateTimeFormatOptions, locale: string): string {
  return formatter(locale, options)
    .formatToParts(new Date(utc(iso)))
    .filter((p) => p.type !== 'literal')
    .map((p) => p.value)
    .join(' ');
}

/** The short label of a field: "Tue 10 Nov", with the year when it is not today's year ("Tue 10 Nov 2027"). */
export function formatDayShort(iso: IsoDate, today: IsoDate, locale = 'en-GB'): string {
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return spaced(iso, { weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }, locale);
}

/** The full name of a day for a screen reader: "Tuesday 10 November 2026". */
export function formatDayLong(iso: IsoDate, locale = 'en-GB'): string {
  return spaced(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, locale);
}

// ---------------------------------------------------------------------------
// Wall times
// ---------------------------------------------------------------------------

/** Minutes since midnight of a `HH:MM` time. */
export function toMinutes(time: WallTime): number {
  const [h, m] = time.split(':');
  return Number(h) * 60 + Number(m);
}

/** `HH:MM` for minutes since midnight, held inside the day (0 to 23:59). */
export function fromMinutes(minutes: number): WallTime {
  const m = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/**
 * Reads a typed time: "830", "0830", "8:30", "8.30", "8", "20", "8pm", "8:30 pm", "8p", "12am".
 * Returns `HH:MM`, or null when the text is not a time of day.
 */
export function parseTime(text: string): WallTime | null {
  const s = text.trim().toLowerCase().replace(/\s+/g, '');
  const m = /^(\d{1,4})(?:[:.h](\d{1,2}))?(am?|pm?)?$/.exec(s);
  if (!m) return null;
  const digits = m[1] ?? '';
  let hours: number;
  let minutes: number;
  if (m[2] !== undefined) {
    if (digits.length > 2 || m[2].length !== 2) return null;
    hours = Number(digits);
    minutes = Number(m[2]);
  } else if (digits.length <= 2) {
    hours = Number(digits);
    minutes = 0;
  } else {
    // "830" is 8:30 and "1730" is 17:30: the last two digits are the minutes.
    hours = Number(digits.slice(0, -2));
    minutes = Number(digits.slice(-2));
  }
  const half = m[3]?.[0];
  if (half) {
    if (hours < 1 || hours > 12) return null;
    if (half === 'a') hours = hours === 12 ? 0 : hours;
    else hours = hours === 12 ? 12 : hours + 12;
  }
  if (hours > 23 || minutes > 59) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

/** A length in words: "30 min", "1 h", "1 h 30". */
export function formatLength(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${pad(m)}`;
}
