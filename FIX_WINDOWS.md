# رفع خطاهای مرحله ۰۱ — ویندوز

## خطای Web: `Cannot find module babel-preset-expo`
در نسخه قبلی preset در `babel.config.js` استفاده شده بود ولی در `package.json` موجود نبود. در نسخه اصلاح‌شده اضافه شده است.

در مسیر پروژه اصلاح‌شده در PowerShell:

```powershell
npm install
npx expo install --fix
npx expo install --check
npm run typecheck
npm run lint
npx expo start --clear
```

پس از اجرای Expo کلید `w` را برای باز کردن Web بزن. در دفعات بعد `npm run web` کافی است. اگر هنوز پکیج پیدا نشد، `npm ls babel-preset-expo` و `node -v` را اجرا و خروجی را ارسال کن.

**توجه:** به جای جایگزینی یک فایل، برای جلوگیری از تداخل بهتر است پوشه ZIP اصلاح‌شده را در یک پوشه تازه استخراج و نصب کنی.

## مشکل دوم کشف‌شده: تعارض مسیرهای Expo Router
`src/app` حتی وقتی فقط `providers` داشته باشد، نسبت به `app/` اولویت دارد. این پوشه حذف و محل bootstrap به `src/bootstrap/providers` تغییر یافته است. پس از اجرا پیام `Using src/app as the root directory` دیگر نباید دیده شود.

## Android: دستگاه پیدا نشده است
این پیام خطای کد اپ نیست. باید یکی از این دو روش را انجام دهی:

**روش A — گوشی واقعی:** Expo Go را نصب کن. گوشی و کامپیوتر را به یک Wi-Fi وصل کن؛ `npx expo start --clear` را اجرا کن و QR را با Expo Go اسکن کن. اگر شبکه مانع اتصال بود `npx expo start --tunnel` را امتحان کن.

**روش B — شبیه‌ساز:** Android Studio را نصب کن، از Device Manager یک Virtual Device با image اندروید بساز، آن را Start کن. سپس `adb devices` را در ترمینال اجرا کن و باید یک دستگاه با وضعیت `device` ببینی. بعد `npm run android` را اجرا کن. اگر دستور `adb` شناخته نشد، Android SDK Platform-Tools و PATH را تنظیم کن.

## معیار عبور از مرحله ۰۱
- [ ] وب بدون خطای Babel اجرا شود
- [ ] صفحه اصلی و مسیرهای /login، /journeys/demo و /play/demo/demo باز شوند
- [ ] رفرش مستقیم deep link روی وب کار کند
- [ ] Android با گوشی یا شبیه‌ساز اجرا شود و ناوبری/back بررسی شود
- [ ] `npm run typecheck` و `npm run lint` پاس شوند
- [ ] lockfile پس از نصب ذخیره شود

این نسخه هنوز روی npm یا دستگاه واقعی در محیط تولید سند تست نشده و نیازمند اجرای توست. مرحله ۰۲ آغاز نشده است.
