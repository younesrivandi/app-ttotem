# TTOTEM — اپلیکیشن چندسکویی آموزش و بازی

> نسخه `0.16.0` · Expo SDK 54 · React Native · TypeScript · Android / iOS / Web

TTOTEM اپلیکیشنی فارسی و راست‌به‌چپ برای تجربه سفرها، مراحل و چالش‌های تعاملی کودکان، همراه با حساب والد، مدیریت پروفایل کودک، آمار، نتایج، رتبه‌بندی و عضویت گروهی است. این مخزن بازنویسی چندسکویی کلاینت با Expo و React Native است و از API موجود استفاده می‌کند.

**وضعیت:** کد و پیکربندی توسعه و بیلد در مخزن موجود است، اما وجود فایل‌های EAS به معنی ساخته‌شدن یا تأیید APK/AAB/IPA انتشار نیست. پیش از انتشار، بررسی‌های [چک‌لیست نسخه ۱۶](STAGE_16_TEST_CHECKLIST.md) و رفع مانع امنیتی نشست وب الزامی است.

## فهرست راهنما

- [پیش‌نیازها](#پیشنیازها)
- [نصب سریع](#نصب-سریع)
- [تنظیم متغیرهای محیطی](#تنظیم-متغیرهای-محیطی)
- [اجرای Web / Android / iOS](#اجرای-برنامه)
- [اسکریپت‌ها و تست](#اسکریپتها-و-تست)
- [بیلد و انتشار](#بیلد-و-انتشار)
- [ساختار و معماری](#ساختار-و-معماری)
- [قابلیت‌ها و مسیرها](#قابلیتها-و-مسیرها)
- [API و احراز هویت](#api-و-احراز-هویت)
- [عیب‌یابی](#عیبیابی)
- [چک‌لیست انتشار](#چکلیست-انتشار)

## پیش‌نیازها

- **Node.js:** نسخه LTS سازگار با Expo SDK 54 (ترجیحاً Node.js 20.19.x یا جدیدتر از سری پشتیبانی‌شده). نسخه فعال را با `node -v` بررسی کنید.
- **npm:** پروژه فایل `package-lock.json` دارد؛ برای نصب تکرارپذیر از `npm ci` استفاده کنید.
- **Git** برای دریافت سورس.
- **Android:** Android Studio و Android SDK/Platform-Tools برای شبیه‌ساز یا دستگاه واقعی؛ یا Expo Go برای تست توسعه در صورت سازگاری با SDK.
- **iOS:** macOS + Xcode برای شبیه‌ساز و بیلد محلی؛ برای EAS cloud build لزوماً macOS محلی لازم نیست. انتشار در App Store به حساب Apple Developer و تنظیمات امضا نیاز دارد.
- **Web:** مرورگر به‌روز.
- **بیلد ابری:** حساب Expo/EAS و دسترسی به پروژه؛ برای نصب CLI می‌توانید از `npx eas-cli` استفاده کنید.

## نصب سریع

~~~bash
git clone --branch dev https://github.com/younesrivandi/app-ttotem.git
cd app-ttotem
npm ci
cp .env.example .env
npx expo install --check
npm start
~~~

در ویندوز PowerShell به جای دستور کپی:

~~~powershell
Copy-Item .env.example .env
~~~

اگر `npm ci` به دلیل ناسازگاری lockfile شکست خورد، پیش از تغییر وابستگی‌ها دلیل را بررسی کنید؛ اجرای `npm install` می‌تواند lockfile را تغییر دهد. پروژه را با همان package manager ثبت‌شده نگه دارید.

## تنظیم متغیرهای محیطی

محتوای نمونه در [`.env.example`](.env.example) قرار دارد.

~~~dotenv
EXPO_PUBLIC_API_BASE_URL=https://api.ttotem.ir
~~~

`EXPO_PUBLIC_API_BASE_URL` در کد کلاینت استفاده می‌شود و در bundle قابل مشاهده است؛ **هیچ رمز، توکن، private key یا secret را با پیشوند `EXPO_PUBLIC_` تعریف نکنید.** در صورت عدم تعریف متغیر، کد فعلی به `https://api.ttotem.ir` بازمی‌گردد. برای محیط‌های staging/production، آدرس و دسترسی واقعی API، HTTPS و سیاست CORS را بررسی کنید.

متغیرهای مخصوص پیکربندی انتشار:

| متغیر | کاربرد |
| --- | --- |
| `APP_ENV` | وقتی `production` باشد، اعتبارسنجی سخت‌گیرانه در `app.config.js` فعال می‌شود |
| `TTOTEM_ANDROID_PACKAGE` | شناسه یکتای Android، مانند `ir.example.ttotem` |
| `TTOTEM_IOS_BUNDLE_ID` | Bundle Identifier واقعی iOS |
| `EAS_PROJECT_ID` | شناسه پروژه Expo/EAS |
| `EXPO_PUBLIC_API_BASE_URL` | نشانی API قابل استفاده در نسخه انتشار، با HTTPS |

**نکته:** مقادیر مثال را عیناً برای انتشار استفاده نکنید. متغیرهای موردنیاز را در محیط بیلد EAS نیز تنظیم کنید. `APP_ENV=production` بدون سه شناسه انتشار بالا باعث خطای عمدی در `app.config.js` می‌شود. شناسه‌ها قبل از اولین انتشار باید نهایی شوند.

## اجرای برنامه

### وب (Web)

~~~bash
npm run web
~~~

برای شروع تمیز، به‌ویژه پس از تغییر Babel یا وابستگی‌ها:

~~~bash
npx expo start --web --clear
~~~

سرور آدرس محلی را در ترمینال نمایش می‌دهد (اغلب `http://localhost:8081`؛ پورت قطعی نیست). برای API ریموت، دسترسی شبکه و CORS مرورگر را کنترل کنید.

### اندروید (Android)

ابتدا Android Studio، SDK و یک شبیه‌ساز را راه‌اندازی کنید یا گوشی با USB debugging / اتصال مناسب آماده کنید. با `adb devices` وضعیت دستگاه را ببینید؛ سپس:

~~~bash
npm run android
~~~

این اسکریپت معادل `expo start --android` است و **به‌تنهایی APK انتشار تولید نمی‌کند**. برای تست با Expo Go، `npm start` را اجرا و QR را با گوشی باز کنید. گوشی و سیستم توسعه ترجیحاً در یک شبکه باشند.

در صورت بروز مشکل اتصال Metro:

~~~bash
npx expo start --tunnel
~~~

قابلیت‌های native و مجوزهای دستگاه، به‌خصوص ضبط صدا و ژست‌های بازی، باید روی build واقعی نیز آزمایش شوند.

### آیفون / iOS

روی macOS با Xcode و iOS Simulator نصب‌شده:

~~~bash
npm run ios
~~~

این دستور Expo را برای اجرای توسعه در شبیه‌ساز/دستگاه در دسترس باز می‌کند، **IPA نمی‌سازد**. می‌توانید در محیط توسعه با `npm start` و ابزار سازگار Expo نیز اجرا کنید. تست build واقعی iOS به امضا و provisioning مناسب نیاز دارد.

### انتخاب پلتفرم از ترمینال

~~~bash
npm start
~~~

طبق امکانات محیط، از میانبرهای Expo برای Web، Android یا iOS استفاده کنید. برای مشکلات cache:

~~~bash
npx expo start --clear
~~~

## اسکریپت‌ها و تست

اسکریپت‌های زیر در `package.json` شاخه `dev` نسخه ۰.۱۶ تعریف شده‌اند:

| دستور | کاربرد |
| --- | --- |
| `npm start` | اجرای Expo dev server |
| `npm run web` | توسعه وب |
| `npm run android` | توسعه اندروید |
| `npm run ios` | توسعه iOS |
| `npm run typecheck` | TypeScript بدون خروجی فایل |
| `npm run lint` | اجرای ESLint |
| `npm run format:check` | کنترل Prettier |
| `npm run format` | اعمال قالب‌بندی |
| `npm run doctor` | بررسی سازگاری Expo |
| `npm run test:engine` | تست موتور بازی |
| `npm run test:auth` | تست احراز هویت و نشست |
| `npm run test:puzzle` | تست پازل |
| `npm run test:matching` | تست Matching |
| `npm run test:path` | تست Path |
| `npm run test:sheets` | تست Sheet |
| `npm run test:stages` | تست مراحل |
| `npm run verify:static` | ممیزی ایستای مسیرها و وابستگی‌ها |
| `npm run verify` | TypeScript + lint + تست‌ها + ممیزی ایستا |
| `npm run release:check` | ممیزی سخت‌گیرانه پیش از انتشار |
| `npm run export:web` | export نسخه وب به `dist/` |
| `npm run build:android:preview` | بیلد APK آزمایشی با EAS |
| `npm run build:android:production` | بیلد AAB انتشار با EAS |
| `npm run build:ios:preview` | بیلد iOS با پروفایل preview |
| `npm run build:ios:production` | بیلد iOS با پروفایل production |

پیشنهاد کنترل قبل از هر merge یا بیلد:

~~~bash
npm ci
npx expo install --check
npm run doctor
npm run format:check
npm run verify
~~~

`verify` تست‌های موجود را اجرا می‌کند، اما **جای تست عملی روی Web، Android و iOS را نمی‌گیرد**. وجود پوشه `e2e/` به معنی راه‌اندازی کامل تست E2E نیست.

## بیلد و انتشار

### مرحله ۱: آماده‌سازی EAS

به حساب Expo وارد شوید و پروژه EAS را متصل کنید:

~~~bash
npx eas-cli login
npx eas-cli project:init
~~~

در پروژه‌ای که از قبل به EAS متصل است، تنظیمات موجود را حفظ کنید و از ساخت پروژه تکراری خودداری کنید. سپس متغیرهای محیطی و شناسه‌های بسته/Bundle را در محیط بیلد تنظیم کنید. `eas.json` سه profile دارد: `development`، `preview` و `production`.

### مرحله ۲: ساخت APK آزمایشی Android

~~~bash
npm run build:android:preview
~~~

پروفایل `preview` با `distribution: internal` و `android.buildType: apk` تنظیم شده است؛ برای نصب و تست داخلی است، نه انتشار Play Store. پس از اتمام موفق build، لینک artifact توسط EAS ارائه می‌شود.

### مرحله ۳: ساخت AAB اندروید برای Google Play

~~~bash
npm run release:check
npm run build:android:production
~~~

پروفایل `production` برای Android از `app-bundle` استفاده می‌کند (خروجی AAB). قبل از آن، شناسه `TTOTEM_ANDROID_PACKAGE`، کلیدهای امضا، متغیرهای EAS، سیاست‌های فروشگاه و تست دستگاه را تأیید کنید. ساخت AAB به معنی آپلود یا انتشار خودکار در Google Play نیست.

### مرحله ۴: ساخت iOS

بیلد تست داخلی:

~~~bash
npm run build:ios:preview
~~~

بیلد انتشار:

~~~bash
npm run release:check
npm run build:ios:production
~~~

پروفایل preview دارای `distribution: internal` است؛ نصب روی دستگاه‌های iOS نیازمند provisioning مناسب و دستگاه‌های مجاز است. پروفایل production به تنظیمات امضای Apple و دسترسی‌های مربوطه نیاز دارد. توزیع TestFlight/App Store یک مرحله جدا پس از build است. در صورت پیکربندی کامل EAS Submit و حساب فروشگاه، می‌توانید از `npx eas-cli submit --platform ios --profile production` استفاده کنید؛ این اقدام را مستقل از build بررسی کنید.

برای هر دو پلتفرم:

~~~bash
npx eas-cli build --platform all --profile production
~~~

این دستور build ابری هر دو پلتفرم را درخواست می‌کند و ممکن است بر اساس حساب، امضا و متغیرهای محیطی نیازمند تعامل یا تنظیمات اضافی باشد.

### مرحله ۵: ساخت نسخه وب

~~~bash
npm run export:web
~~~

خروجی static در `dist/` قرار می‌گیرد. محتوای آن را روی میزبان فایل استاتیک/وب‌سرور موردنظر منتشر کنید. به علت تنظیم `web.output: single`، باید SPA fallback برای مسیرهایی مثل `/login` و `/join/:slug` و بارگذاری مستقیم/refresh آن‌ها در سرور مقصد بررسی شود. دامنه، TLS، CORS، headerهای امنیتی و رفتار API باید مستقل از موفقیت export تست شوند.

**هشدار حیاتی انتشار وب:** در نسخه فعلی `src/services/storage/credentialStore.web.ts`، نشست و refresh token در `localStorage` قابل دسترسی JavaScript نگهداری می‌شود. این شیوه در معرض سرقت ناشی از XSS است و برای انتشار عمومی پذیرفته نشده است. `release:check` برای همین موضوع عمداً fail می‌شود. قبل از انتشار عمومی، با backend یک جریان امن refresh مبتنی بر cookieهای `HttpOnly`/`Secure`/`SameSite` یا BFF پیاده‌سازی و تأیید کنید. **برای سبز کردن چک، شرط امنیتی را حذف نکنید.**

## ساختار و معماری

~~~text
app/                         # Expo Router؛ مسیرها و layoutها
  (tabs)/                    # تب‌های اصلی
  login.tsx                  # ورود والد
  journeys/[journeyId].tsx   # جزئیات سفر
  stages/[stageId].tsx       # مراحل
  play/[stageId]/[challengeId].tsx
  result/[stageId].tsx
  join/[slug].tsx            # لینک دعوت گروه
src/
  bootstrap/providers/       # Providerهای سطح اپ
  components/
    ui/                      # AppButton، AppText، AppInput، ...
    layout/                  # AppScreen، ...
    navigation/              # سربرگ و ناوبری
    overlays/                # AppDialog، AppSheet
  features/
    auth/                    # OTP و login
    children/                # پروفایل کودک
    parent/                  # داشبورد والد
    journeys/                # سفرها
    stages/                  # مراحل و چالش‌ها
    challenges/              # engine، renderer، ضبط و media
    results/                 # نتیجه مرحله
    leaderboard/             # رتبه‌بندی
    groups/                  # دعوت و عضویت
  services/
    api/                     # HTTP client، endpointها، قراردادها
    auth/                    # نشست والد/کودک
    storage/                 # پیاده‌سازی‌های web/native
  theme/                     # توکن‌ها و ThemeProvider
  i18n/                      # تنظیم زبان/جهت
assets/                      # تصاویر، آواتارها، فونت‌ها
tests/                       # تست‌های Node و موتور بازی
e2e/                         # فضای اختصاصی E2E
scripts/release-audit.cjs    # ممیزی پیش از انتشار
app.json                     # تنظیمات Expo
app.config.js                # مقادیر وابسته به محیط
eas.json                     # پروفایل‌های بیلد
~~~

**قواعد معماری:** مسیرها در `app/` به صفحات featureها وصل می‌شوند؛ منطق چالش و ارسال پاسخ داخل `features/challenges` است؛ منطق محاسبات بازی تا جای ممکن TypeScript مستقل از پلتفرم است؛ UI مشترک در `components` قرار دارد. برای تفاوت واقعی پلتفرم از فایل‌های `.native.ts` و `.web.ts` استفاده شده است. از بازپیاده‌سازی مستقیم کد DOM/Next.js در کد مشترک پرهیز کنید.

تکنولوژی‌های کلیدی: Expo 54، React 19.1، React Native 0.81.5، Expo Router 6، TanStack Query 5، Zod 4، Gesture Handler، Reanimated 4، SVG، Gorhom Bottom Sheet، Expo Audio/Video، Secure Store و `jalaali-js`. برای نسخه دقیق، `package.json` و lockfile مرجع هستند.

## قابلیت‌ها و مسیرها

| قابلیت | مسیر اصلی |
| --- | --- |
| خانه | `/` |
| ورود والد با OTP | `/login` |
| مدیریت کودکان | `/children` |
| داشبورد والد | `/parent` |
| لیست سفرها | `/journeys` |
| جزئیات سفر | `/journeys/:journeyId` |
| چالش‌های مرحله | `/stages/:stageId` |
| اجرای چالش | `/play/:stageId/:challengeId` |
| نتیجه مرحله | `/result/:stageId` |
| رتبه‌بندی | `/leaderboard` |
| پیوستن از طریق لینک دعوت | `/join/:slug` |

موتور بازی از گونه‌های Puzzle، Choice، Sorting، Matching، Path، Voice و محتوای صوتی/ویدیویی پشتیبانی می‌کند. زمان، خطاها و پاسخ برای backend ارسال می‌شوند؛ صحت پاسخ و پیشرفت باید با پاسخ سرور تطبیق داده شود. امکان ضبط صدا به مجوز میکروفون نیاز دارد. مسیریابی deep link از scheme `ttotem` استفاده می‌کند؛ برای لینک‌های HTTPS واقعی در موبایل، پیکربندی Universal Links / App Links جداگانه لازم است.

## API و احراز هویت

آدرس پایه پیش‌فرض: `https://api.ttotem.ir`. endpointهای تعریف‌شده در `src/services/api/endpoints.ts` شامل این گروه‌ها هستند:

| گروه | نمونه endpoint |
| --- | --- |
| احراز هویت | `/api/v1/auth/otp/request`, `/api/v1/auth/login` |
| کودکان | `/api/v1/children`, `/api/v1/children/:id/select` |
| آمار والد | `/api/v1/children/:id/statistics` |
| سفرها | `/api/v1/child/journeys` |
| مراحل | `/api/v1/child/journeys/:id/stages` |
| چالش‌ها | `/api/v1/child/stages/:id/challenges` |
| ارسال فعالیت و تلاش | `.../challenges/:challengeId/activities`, `.../attempts` |
| نتیجه و رتبه | `/api/v1/child/stages/:id/result`, `/api/v1/child/leaderboard` |
| گروه | `/api/v1/groups/join/:slug` |

درخواست OTP و تأیید OTP برای ورود والد استفاده می‌شوند؛ نشست کودک و والد از هم جدا هستند. روی native از adapter ذخیره اعتبارنامه مبتنی بر Secure Store استفاده می‌شود. روی وب، ذخیره توکن فعلی **صرفاً برای توسعه** پذیرفته شده و مانع انتشار است. قرارداد قطعی payload و status code را از source و backend بررسی کنید؛ README جای مستندات رسمی API نیست.

## عیب‌یابی

**خطای `Cannot find module babel-preset-expo` یا مشکلات cache:**

~~~bash
npm ci
npx expo install --check
npx expo start --clear
~~~

**خطای `Using src/app as the root directory`:** پوشه `src/app` نباید با ریشه مسیرهای `app/` رقابت کند. نسخه فعلی bootstrap را زیر `src/bootstrap/providers` قرار داده است.

**Android device not found:** شبیه‌ساز را از Android Studio اجرا، سپس `adb devices` را بررسی کنید. برای گوشی واقعی USB debugging / مجوز اتصال یا Expo Go و شبکه مناسب را چک کنید.

**مشکل دسترسی از گوشی به Metro:** اتصال شبکه مشترک، firewall و در صورت لزوم `npx expo start --tunnel` را امتحان کنید.

**خطای درخواست API در Web:** مقدار `EXPO_PUBLIC_API_BASE_URL`، HTTPS و CORS را بررسی کنید. CORS مسئله مرورگر است و موفقیت همان درخواست روی Android تضمین‌کننده کارکرد وب نیست.

**خطای `Production requires TTOTEM_ANDROID_PACKAGE...`:** مقدارهای `TTOTEM_ANDROID_PACKAGE`، `TTOTEM_IOS_BUNDLE_ID` و `EAS_PROJECT_ID` را در محیط بیلد وارد کنید.

**رد شدن `npm run release:check`:** علاوه بر متغیرهای انتشار و HTTPS، ممیزی وب وجود `localStorage` برای refresh token را بررسی می‌کند. راه‌حل، اصلاح امنیت نشست وب در کد و backend است، نه غیرفعال کردن تست.

راهنمای تکمیلی Windows: [FIX_WINDOWS.md](FIX_WINDOWS.md).

## چک‌لیست انتشار

- [ ] `npm ci`، `npx expo install --check`، `npm run verify` و `npm run format:check` بدون خطا هستند.
- [ ] `npm run release:check` پس از رفع مانع امنیت نشست وب سبز است.
- [ ] تمام متغیرهای environment و شناسه‌های واقعی package/bundle تنظیم شده‌اند.
- [ ] API، OTP، refresh/logout و تفکیک نشست والد/کودک روی هر سه پلتفرم تست شده‌اند.
- [ ] مسیرهای مستقیم وب، reload و دعوت گروه بدون 404 کار می‌کنند.
- [ ] همه چالش‌ها (به‌خصوص drag & drop، پازل، مسیر، صوت و ویدیو) روی دستگاه واقعی تست شده‌اند.
- [ ] RTL فارسی، تقویم جلالی، فونت، Safe Area، back navigation و accessibility بررسی شده‌اند.
- [ ] دسترسی میکروفون و عملکرد بدون اجازه آن کنترل شده است.
- [ ] خروجی Web در `dist/` روی میزبان واقعی آزمایش شده است.
- [ ] APK آزمایشی، AAB اندروید و build امضاشده iOS با موفقیت ساخته و نصب/بررسی شده‌اند.
- [ ] حساب‌های فروشگاه، privacy policy، قوانین محتوای کودک و متادیتای انتشار آماده‌اند.

برای سناریوهای دقیق‌تر، [STAGE_16_TEST_CHECKLIST.md](STAGE_16_TEST_CHECKLIST.md)، [TEST_CHECKLIST.md](TEST_CHECKLIST.md)، [PUZZLE_PLATFORM_TEST_CHECKLIST.md](PUZZLE_PLATFORM_TEST_CHECKLIST.md) و [CHANGELOG.md](CHANGELOG.md) را ببینید.

## مشارکت و توسعه

توسعه روی شاخه `dev` انجام می‌شود. پیشنهاد می‌شود تغییرات جدید در شاخه feature مجزا ایجاد شوند، پس از گذر از `npm run verify` و تست دستی پلتفرم‌های مرتبط به `dev` ادغام شوند. تغییر API، رفتار چالش یا سیاست ذخیره نشست باید همراه با تست رگرسیون باشد. از ثبت فایل `.env`، توکن، keystore، provisioning profile یا کلید خصوصی در Git خودداری کنید.

---

**Repo:** https://github.com/younesrivandi/app-ttotem · **Development branch:** [dev](https://github.com/younesrivandi/app-ttotem/tree/dev) · **Current version:** 0.16.0

> وضعیت اجرای واقعی buildها و تأیید انتشار فقط با نتایج CI/EAS و آزمون دستگاه قابل اعلام است؛ این سند دستورالعمل اجرای آن‌هاست.
