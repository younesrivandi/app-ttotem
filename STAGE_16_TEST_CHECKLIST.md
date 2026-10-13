# Stage 16 — Acceptance checklist

- [ ] `npm ci` با lockfile commit شده موفق است.
- [ ] `npx expo install --check` موفق است.
- [ ] `npm run verify` (TS, ESLint, engine, static audit) موفق است.
- [ ] `npm run export:web` موفق است و `dist/` وجود دارد.
- [ ] Web: refresh تمام routeها و دعوت گروه بدون 404 است.
- [ ] Android: نصب و اجرا، navigation/back، RTL و تاریک/روشن صحیح است.
- [ ] iOS: نصب و اجرا روی TestFlight/Simulator، Safe Area و gesture صحیح است.
- [ ] OTP/نشست کودک و والد + Refresh و خروج بدون نشت اطلاعات است.
- [ ] سفرها، مراحل و هفت نوع چالش با سرور مقایسه شده‌اند.
- [ ] Sorting drag, Matching, Path، صوت/ویدیو و میکروفون روی هر پلتفرم تست شده‌اند.
- [ ] نتایج مرحله، چندبار لمس ارسال پاسخ، امتیاز و ستاره مطابق سرور است.
- [ ] leaderboard، عضویت و pending join پس از ورود صحیح‌اند.
- [ ] دوربین/میکروفون فقط مجوزهای موردنیاز را درخواست می‌کنند (در پروژه فعلی فقط میکروفون).
- [ ] پروفایلینگ روی گوشی میان‌رده انجام شده؛ خطاهای حافظه یا frame drop بحرانی وجود ندارد.
- [ ] لینک‌های واقعی HTTPS App/Universal Links پس از پیکربندی دامنه تست شده‌اند.
- [ ] API/CORS/CSRF و نشست پایدار Web با بک‌اند تأیید شده است.
- [ ] Release Android AAB و iOS IPA موفق و توسط دستگاه واقعی تأیید شده‌اند.
- [ ] سیاست حریم خصوصی، مجوزهای صدا، محتوای کودک و اسناد فروشگاه کامل‌اند.
