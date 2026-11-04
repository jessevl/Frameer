/**
 * @file dates.test.ts
 * @description Wall-date arithmetic, typed times and labels of the pickers.
 */
import { describe, expect, it } from 'vitest';
import {
  addDays, addMonths, clampDate, daysBetween, formatDayLong, formatDayShort, formatLength, fromMinutes, isIsoDate, monthDays, nextMonday, parseTime, startOfWeek, toMinutes,
} from './dates';

describe('parseTime', () => {
  it.each([
    ['830', '08:30'],
    ['0830', '08:30'],
    ['8:30', '08:30'],
    ['8.30', '08:30'],
    ['8', '08:00'],
    ['20', '20:00'],
    ['1730', '17:30'],
    ['8pm', '20:00'],
    ['8 PM', '20:00'],
    ['8:30pm', '20:30'],
    ['8p', '20:00'],
    ['8am', '08:00'],
    ['12am', '00:00'],
    ['12pm', '12:00'],
    [' 08:30 ', '08:30'],
    ['0:00', '00:00'],
    ['23:59', '23:59'],
  ])('reads %j as %s', (text, time) => {
    expect(parseTime(text)).toBe(time);
  });

  it.each(['', 'noon', '25', '24:00', '8:60', '13pm', '0am', '8:3', '12345', '8:30:00'])('does not read %j', (text) => {
    expect(parseTime(text)).toBeNull();
  });
});

describe('wall dates', () => {
  it('adds days across months, years and daylight-saving changes', () => {
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('keeps a month step inside the month', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-11-15', -12)).toBe('2025-11-15');
  });

  it('counts days and finds week starts', () => {
    expect(daysBetween('2026-11-10', '2026-11-13')).toBe(3);
    expect(startOfWeek('2026-11-04', 1)).toBe('2026-11-02');
    expect(startOfWeek('2026-11-04', 0)).toBe('2026-11-01');
    expect(nextMonday('2026-11-04')).toBe('2026-11-09');
    expect(nextMonday('2026-11-09')).toBe('2026-11-16');
  });

  it('lays out six weeks from the week holding the 1st', () => {
    const days = monthDays('2026-11-18', 1);
    expect(days).toHaveLength(42);
    expect(days[0]).toBe('2026-10-26');
    expect(days[6]).toBe('2026-11-01');
    expect(monthDays('2026-11-18', 0)[0]).toBe('2026-11-01');
  });

  it('clamps and validates', () => {
    expect(clampDate('2026-11-01', '2026-11-04')).toBe('2026-11-04');
    expect(clampDate('2026-12-01', undefined, '2026-11-30')).toBe('2026-11-30');
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2028-02-29')).toBe(true);
  });

  it('labels a day short, with the year only when it is not this year, and long for screen readers', () => {
    expect(formatDayShort('2026-11-10', '2026-11-04')).toBe('Tue 10 Nov');
    expect(formatDayShort('2027-01-05', '2026-11-04')).toBe('Tue 5 Jan 2027');
    expect(formatDayLong('2026-11-10')).toBe('Tuesday 10 November 2026');
  });
});

describe('wall times', () => {
  it('converts minutes and labels lengths', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(fromMinutes(570)).toBe('09:30');
    expect(fromMinutes(24 * 60 + 30)).toBe('23:59');
    expect(formatLength(30)).toBe('30 min');
    expect(formatLength(60)).toBe('1 h');
    expect(formatLength(90)).toBe('1 h 30');
  });
});
