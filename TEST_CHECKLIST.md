# Stage 04 — Acceptance Checklist

- [ ] `npm run typecheck` بدون خطا (رفع TS2367).
- [ ] `npm run lint` بدون حتی یک warning (رفع unused import).
- [ ] `npx expo install --check` بدون ناسازگاری.
- [ ] تب‌های خانه، سفرها، کودکان، والد و رتبه‌بندی در Web و Android کار می‌کنند.
- [ ] URLهای سابق تغییری نکرده‌اند؛ Refresh مستقیم `/journeys` و `/children` کار می‌کند.
- [ ] `/navigation-lab` بدون خطا باز می‌شود.
- [ ] Bottom Sheet باز می‌شود، دکمه بستن کار می‌کند، backdrop و swipe-down روی Android درستند.
- [ ] Bottom Sheet در Web نیز قابل باز و بسته‌شدن است.
- [ ] Dialog روی Web و Android باز/بسته می‌شود؛ Back اندروید آن را می‌بندد.
- [ ] Back از صفحه نمونه و بازگشت به خانه درست است؛ Modal ورود نیز برمی‌گردد.
- [ ] لینک `/join/demo` روی refresh مستقیم Web کار می‌کند و `ttotem://join/demo` روی نسخه Development Build با scheme پیکربندی‌شده قابل آزمایش است.
- [ ] Theme روشن/تیره و RTL در Tab، Dialog و Sheet خواناست.
- [ ] صفحه `/ui-kit` و مسیرهای مرحله ۰۳ بدون regression اجرا می‌شوند.

**توجه:** تست scheme روی Expo Go نماینده نهایی deep link نیست؛ در Dev Build و بعد در build انتشار بررسی شود. تأیید iOS روی macOS/دستگاه iOS جداگانه لازم است.
