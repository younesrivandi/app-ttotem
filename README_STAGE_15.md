# مرحله ۱۵ — رتبه‌بندی، گروه‌ها و Deep Link

نسخه: 0.15.0. بر مبنای مرحله ۱۴. مرحله ۱۶ هنوز انجام نشده است.

## رفتارهای منتقل‌شده از Next.js
- `GET /api/v1/child/leaderboard` با توکن کودک: پاسخ می‌تواند آرایه، `entries` یا `items` باشد. `rank`، `displayName/name`، `score` و `isCurrentChild` همان فیلدهای قبلی‌اند.
- `GET /api/v1/groups/join/{slug}` بدون توکن: نام، شرح، آدرس و خدمات گروه.
- `POST /api/v1/groups/join/{slug}` با توکن والد، `{childProfileId}`: پس از موفقیت، انتخاب کودک و رفتن به `/coming-soon`.
- بدون نشست والد، لینک دعوت به `/login` می‌رود؛ پس از OTP به همان لینک دعوت برمی‌گردد.

## ذخیره‌سازی pending join
- Web: sessionStorage فقط برای slug غیرحساس؛ توکن‌ها همچنان در آن ذخیره نمی‌شوند.
- Native: expo-secure-store.
- پاک‌سازی slug فقط پس از موفقیت درخواست join. اگر انتخاب کودک پس از join شکست بخورد، عضویت موفق ثبت شده ولی تغییر نشست کامل نشده است؛ تکرار join ممکن است نیازمند idempotency سمت سرور باشد.

## مواردی که هنوز با سرور واقعی تأیید نشده‌اند
- نمونه پاسخ موفق join و پاسخ گروه.
- سیاست خطا برای گروه منقضی/تکراری.
- پیکربندی Universal/App Links دامنه واقعی نیازمند مالکیت دامنه و فایل‌های apple-app-site-association / assetlinks.json است. Scheme `ttotem://join/{slug}` از Expo Router قابل آزمایش است.
- persistence پس از بستن کامل Web tab در این طراحی تضمین نشده است.

## اجرا
```powershell
npm install
npx expo install --check
npm run typecheck
npm run lint -- --max-warnings=0
npm run test:engine
npx expo start --clear
```

مرحله بعد فقط پس از تأیید تست‌های این مرحله آغاز شود.
