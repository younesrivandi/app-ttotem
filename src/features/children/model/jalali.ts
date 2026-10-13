import { isValidJalaaliDate, jalaaliMonthLength, toGregorian } from 'jalaali-js';

/** Converts a validated Persian calendar date to the Gregorian API date format. */
export function jalaliToIso(jy: number, jm: number, jd: number): string {
  if (!isValidJalaaliDate(jy, jm, jd)) {
    throw new RangeError('Invalid Jalaali date');
  }
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${String(gy).padStart(4, '0')}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
] as const;

export function daysInJalaliMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Invalid Jalaali year or month');
  }
  return jalaaliMonthLength(year, month);
}
