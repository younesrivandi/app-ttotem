// Stage 02: stable Persian copy and direction helpers; translation engine belongs to later implementation.
export const locale = 'fa-IR' as const;
export const textDirection = 'rtl' as const;
export const localeStrings = {
  stage: 'مرحله ۰۲', paths: 'مسیرهای قابل بررسی',
  description: 'مسیر صفحه آماده است؛ منطق اصلی در مرحله مربوط به آن منتقل می‌شود.',
  offline: 'این نسخه نمایشی هیچ درخواست شبکه‌ای ارسال نمی‌کند.',
} as const;
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}
