# TTOTEM — مرحله ۱۶: کنترل نهایی و انتشار

## وضعیت واقعی
- مبنا: نسخه 0.15.0 که روی Web/Android توسط مالک تأیید شده بود.
- این خروجی نسخه 0.16.0 **آماده اجرای کنترل‌ها و فرآیند Build** است؛ APK، AAB، IPA یا انتشار Web در این محیط تولید یا تأیید نشده‌اند.
- محیط ساخت فاقد دسترسی به npm registry است. **فایل package-lock.json موجود نیست**؛ برای انتشار ابتدا آن را روی دستگاه دارای اینترنت تولید و commit کنید.
- تست iOS فقط در محیط توسعه مجهز به iOS simulator/TestFlight و حساب Apple قابل اعتبارسنجی است.

## روی Windows (PowerShell)
```powershell
cd ttotem-stage-16
npm install
npx expo install --fix
npm install --package-lock-only
npm ci
npx expo install --check
npm run verify
npm run export:web
npx expo start --clear
```
`npm run verify` شامل `typecheck`، `lint --max-warnings=0`، هشت تست موتور و audit ایستا است. خروجی وب در `dist/` ساخته می‌شود. برای تست رفتاری یک سرور استاتیک با fallback مناسب مسیرهای SPA لازم است.

## Android
- برای تست development به گوشی یا emulator متصل نیاز است.
- نام بسته واقعی را پیش از انتشار تعیین کنید؛ از شناسه نمونه در تنظیمات فروشگاه استفاده نکنید.
```powershell
npm install -g eas-cli
eas login
eas init
$env:TTOTEM_ANDROID_PACKAGE="ir.yourorg.ttotem"
$env:TTOTEM_IOS_BUNDLE_ID="ir.yourorg.ttotem"
$env:EAS_PROJECT_ID="UUID-from-eas-init"
$env:EXPO_PUBLIC_API_BASE_URL="https://api.ttotem.ir"
$env:APP_ENV="production"
npm run release:check
npm run build:android:preview
npm run build:android:production
```
**هشدار:** `preview` در این پیکربندی APK تستی و `production` AAB فروشگاه است؛ build واقعی به EAS account و credential نیاز دارد. محیط ساخت EAS باید همان env vars را هم دریافت کند؛ متغیرهای صرفاً PowerShell به EAS Cloud منتقل نمی‌شوند. گزینه مطلوب مدیریت این متغیرها، EAS Environment Variables است.

## iOS
```powershell
npm run build:ios:preview
npm run build:ios:production
```
این فرمان‌ها می‌توانند build ابری iOS را از Windows درخواست کنند؛ تست روی شبیه‌ساز Xcode نیازمند macOS است. ثبت برنامه، امضای معتبر Apple Developer، مجوز میکروفون، TestFlight و آزمون روی iPhone واقعی لازم‌اند. `preview` با توزیع داخلی iOS نیازمند provisioning دستگاه‌های مجاز است.

## Web
```powershell
npm run export:web
```
پوشه `dist/` را روی هاست با rewrite مسیرهای کلاینت به `index.html` مستقر کنید. `/join/:slug` و رفرش عمیق مسیرهای دیگر را جداگانه بررسی کنید. CORS و سیاست نشست HttpOnly / BFF از الزامات بک‌اند قبل از Production هستند. Expo Web جایگزین تضمین‌شده SSR/SEO نسخه Next نیست.

## معیارهای توقف انتشار (Release blockers)
1. TypeScript، ESLint، هشت تست موتور یا `expo install --check` ناموفق.
2. نبود lockfile و نصب غیرقابل بازتولید.
3. نبود شناسه بسته Android، bundle ID iOS و EAS project ID نهایی.
4. عدم موفقیت E2E روی Android، iOS و Web یا مغایرت بازی‌ها و ثبت امتیاز با بک‌اند.
5. نداشتن راهکار نشست امن و پایدار Web (Cookie HttpOnly/BFF) و بررسی CORS/CSRF.
6. نبود تأیید App Links / Universal Links روی دامنه واقعی.
7. نبود دسترسی/موافقت‌های لازم برای انتشار شامل حساب‌های فروشگاه، حریم خصوصی کودک و دسترسی میکروفون.
8. آپلود فایل‌های خام ضبط صدا در گزارش خطا یا لاگ مجاز نیست.

## بررسی عملکرد/امنیت روی دستگاه
- بازی Sorting/Matching/Path با ۳۰ تلاش و بازگشت سریع، بدون قفل لمس و پرش آیتم‌ها.
- پخش صوت و ویدیو و ضبط میکروفون پس از Background/Foreground و قطع مجوز.
- تغییر کودک/والد در هنگام پاسخ در حال ارسال، عدم نشت نتایج/کش.
- شبکه کند، قطع/وصل شبکه هنگام ثبت تلاش، refresh هم‌زمان و logout.
- حافظه، frame drops و زمان شروع با profiler واقعی اندازه‌گیری شود؛ در این مرحله هیچ ادعای عددی درباره بهبود performance وجود ندارد.

## نگهداری و تحویل
`eas.json` پروفایل‌های development/preview/production، `app.config.js` تنظیم شناسه‌های انتشار، `.github/workflows/quality.yml` کنترل کیفیت و `scripts/release-audit.cjs` بررسی‌های ایستا را فراهم می‌کنند.

پس از اجرای تست‌ها روی سیستم خود و ارائه خروجی فرمان‌ها، در صورت بروز اشکال نسخه 0.16.x اصلاح می‌شود؛ بدون این تأیید، مرحله ۱۶ بسته یا اپ آماده انتشار اعلام نمی‌شود.

## یافته ممیزی ذخیره‌سازی وب
`deviceInfo.web.ts` شناسه تصادفی دستگاه (غیر از توکن و credential) را در `localStorage` نگه می‌دارد؛ این استثنا فقط برای این فایل در audit ایستا مجاز شده است. برای حریم خصوصی کودکان و قوانین رضایت/نگهداری داده باید قبل از انتشار بررسی شود.
