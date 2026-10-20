# TTOTEM — ممیزی تجربه Native و آمادگی نسخه آزمایشی

تاریخ: ۲۰ اکتبر ۲۰۲۶ · مبنا: شاخه `dev`، نسخه `0.16.0` · نوع بررسی: **ممیزی ایستای سورس و تنظیمات** (نه آزمایش روی گوشی/شبیه‌ساز).

## خلاصه وضعیت

| حوزه | یافته در کد | وضعیت |
| --- | --- | --- |
| معماری | Expo SDK 54 / React Native 0.81 / Expo Router، مدل مشترک برای سه پلتفرم | ساختار Native مناسب؛ build واقعی هنوز تأیید نشده |
| Status Bar (آنتن، ساعت، باتری) | قبلاً `<StatusBar hidden />` در کل اپ؛ اکنون نمایش فعال و رنگ آیکون با تم تطبیق داده شد | اصلاح کد انجام شد؛ باید روی Android/iOS تست شود |
| Android navigation / gesture | `edgeToEdgeEnabled: true` و `androidNavigationBar.visible: sticky-immersive` قبلی؛ حالت immersive سراسری برداشته شد، contrast فعال شد | ارزیابی بصری دستگاه، ژست back و گوشی سه‌دکمه‌ای ضروری |
| Safe Area | `SafeAreaProvider` در Root و `SafeAreaView` در AppScreen | موجود؛ بررسی تداخل با tab bar شناور و صفحه‌های خاص لازم |
| آیکون | `assets/image/logo.png` موجود بود ولی `expo.icon` تعریف نشده بود؛ اکنون برای icon و Android adaptive foreground و favicon معرفی شده | ابعاد، فضای خالی، crop دایره‌ای و شفافیت هنوز باید بررسی شوند؛ لوگو ممکن است asset نهایی مناسب نباشد |
| Splash Screen | پکیج/کانفیگ اختصاصی `expo-splash-screen` و تصویر اختصاصی در مخزن فعلی دیده نمی‌شود | **ناقص؛ مانع Release نهایی** |
| تصویر هنگام شروع | Root layout فوراً navigation و providers را mount می‌کند؛ سیاست کنترل splash تا آماده‌شدن فونت/نشست وجود ندارد | تکمیل پس از نصب splash module |
| صفحه تمام‌صفحه بازی | Status Bar قبلاً در همه اپ مخفی بود؛ اکنون روی همه مسیرها نمایش دارد | تصمیم محصول و پیاده‌سازی scopeشده فقط روی بازی، در صورت نیاز؛ از مخفی‌سازی عمومی پرهیز شود |
| مجوز میکروفون | `expo-audio` plugin با توضیح فارسی و background recording غیرفعال | موجود؛ تست deny/allow/revoke و ارسال پاسخ لازم |
| RTL / فارسی | ساختار فارسی، جلالی، نمایش ویژه و safe area | آزمون تصویری روی هر سه پلتفرم لازم |
| نرم‌افزار صفحه‌کلید | input و صفحه OTP؛ `AppScreen` از ScrollView استفاده می‌کند | مدیریت overlap، resize و sheet هنگام نمایش کیبورد باید تست شود |
| Bottom Tabs | Tabs استاندارد Expo Router و tab bar شناور با height ثابت | آزمون safe-area پایین iPhone و Android gesture/3-button لازم |
| Dark Mode | Expo `userInterfaceStyle: automatic`، اما ThemeProvider در `light` آغاز می‌شود | **ناهمگونی**؛ باید همگام‌سازی و persistence تم تصمیم‌گیری شود |
| Web | Expo Web، مسیرهای Expo Router و `output: single` | بررسی reload / deep links / responsive / CORS در hosting |
| امنیت Web | refresh token در JS-readable localStorage | **مانع انتشار عمومی**؛ `release:check` عمداً fail می‌شود |
| EAS | پروفایل‌های preview APK و production AAB/iOS | پیکربندی موجود؛ موفقیت build/امضا بررسی نشده |
| Accessibility | label در برخی controls موجود | VoiceOver/TalkBack، focus و حداقل سطح لمس هنوز تست نشده |
| Push Notification | ماژول یا سناریوی اعلان در قابلیت‌های فعلی شناسایی نشده | صرفاً در صورت نیاز محصول؛ برای نسخه موجود الزام قطعی نیست |
| Offline / Recovery | Query caching موجود | رفتار قطع شبکه، recover و resume باید تست شود |

## اصلاحات این دور

1. حذف مخفی‌سازی سراسری status bar: ساعت، باتری و آنتن مجدداً نمایش داده می‌شوند؛ رنگ متن با تم تطبیق می‌یابد.
2. حذف دستور سراسری `sticky-immersive` برای Android navigation bar و فعال‌کردن گزینه contrast؛ حرکت edge-to-edge حفظ شد.
3. افزودن آدرس فعلی PNG لوگو برای icon، adaptive icon و web favicon در Expo config؛ **کیفیت PNG موجود برای launcher هنوز تأیید نشده**.

توجه: تغییر `app.json` و منابع native معمولاً نیازمند **ساخت binary تازه** است؛ `expo start` به تنهایی آیکون launcher یا splash build را به‌روزرسانی نمی‌کند.

## فهرست کارهای لازم پیش از اولین نسخه تستی

### P0 — کارهای ضروری

- [ ] فایل PNG اختصاصی برای آیکون: مربعی 1024×1024؛ تست در لانچرهای روشن/تیره و mask دایره‌ای Android. از PNG لوگوی موجود تنها در صورت مناسب‌بودن حاشیه‌ها استفاده شود.
- [ ] Android adaptive icon با foreground دارای safe padding و background هماهنگ؛ اگر لازم شد تصویر `monochromeImage` برای themed icons.
- [ ] نصب نسخه سازگار `expo-splash-screen` با `npx expo install expo-splash-screen`؛ افزودن plugin به `app.json`، تصویر PNG اختصاصی splash، پس‌زمینه روشن/تیره و تست build release. از افزودن dependency بدون به‌روزرسانی lockfile پرهیز شود.
- [ ] کنترل splash هنگام bootstrap (نشست/فونت): `preventAutoHideAsync` در سطح module و `hideAsync` پس از آماده‌شدن؛ با timeout/fallback مناسب برای جلوگیری از گیرکردن.
- [ ] تست edge-to-edge و رنگ status/navigation bar روی Android 13–16 و iOS، مخصوصاً گوشی با navigation سه‌دکمه‌ای و gesture.
- [ ] تست چسبیدن Tab Bar شناور به پایین صفحه و تداخل نداشتن با home indicator.
- [ ] `npm ci`، `npm run verify`، `npm run export:web`، و ساخت EAS preview و نصب روی گوشی واقعی.
- [ ] سناریوهای OTP والد، انتخاب کودک، بازی، نتایج، میکروفون، ضبط، gesture، برگشت، deep link و خروج تست شوند.

### P1 — تکمیل تجربه نیتیو

- [ ] هماهنگ‌کردن حالت اولیه ThemeProvider با system mode یا تنظیم ترجیح کاربر به‌همراه persistence؛ تست keyboard/dialog/sheets در dark mode.
- [ ] کنترل `KeyboardAvoidingView` و reflow فرم‌ها در iOS/Android؛ خصوصاً OTP و AddChildSheet.
- [ ] تصمیم درباره fullscreen **فقط در صفحه بازی**: در صورت نیاز StatusBar و System Navigation را در ورود/خروج صفحه مدیریت کنید، با cleanup قطعی. در Android 16 edge-to-edge مساوی immersive/hide-system-bars نیست.
- [ ] تست اندازه‌های کوچک، notch، tablet، cutout و landscape (اپ فعلاً `orientation: portrait` دارد).
- [ ] تست اعلان‌های خطا، قطع اینترنت، slow request، back gesture و background/foreground.
- [ ] بررسی accessibility: مقیاس فونت، TalkBack/VoiceOver، کنترل‌های drag با جایگزین دسترس‌پذیر، focus وب.
- [ ] تنظیم نسخه/نام بسته، privacy policy، فرم Data Safety و دستورالعمل محتوای کودک برای مارکت‌ها.

### P2 — بهبودهای پس از تست

- [ ] snapshot/visual regression برای login، tabs، game و نتیجه در عرض‌های متفاوت.
- [ ] E2E واقعی با Playwright Web و Maestro/ابزار native مناسب (پوشه `e2e` به تنهایی تست نیست).
- [ ] برنامه crash reporting و logging بدون توکن/اطلاعات حساس کودک.
- [ ] بررسی bundle size، performance، battery، animation و استراتژی update/rollback.

## سناریوهای تست دستگاه

| سناریو | انتظار |
| --- | --- |
| Cold start | صفحه خالی/flash سفید یا سیاه، flicker بین splash و login نداشته باشد |
| Launcher | icon sharp و بدون بریدگی در maskهای مختلف |
| StatusBar | ساعت/آنتن/باتری خوانا روی پس‌زمینه روشن و تیره |
| Android gesture | home/back و gesture navigation به‌درستی کار کند؛ محتوای تعاملی پشت system bar نماند |
| Android سه‌دکمه‌ای | tab bar و CTA تحت تأثیر ناحیه navigation bar قرار نگیرند |
| iPhone با Dynamic Island / notch | عنوان، دکمه و modal داخل safe area |
| صفحه OTP + keyboard | فیلد فعال و دکمه ثبت در دسترس، روی کیبورد پوشانده نشوند |
| Play + Voice | مجوز میکروفون و حالت deny/revoke/بازگشت به اپ درست باشد |
| Tab + sheet | اسکرول، drag و backdrop بدون تداخل |
| Deep link | `ttotem://join/...` و URL وب پس از ورود و refresh سناریو را حفظ کنند |
| Offline → Online | وضعیت خطای قابل بازگشت، بدون ارسال دوباره ناخواسته attempt |
| Background → Foreground | وضعیت session و ضبط صدا سازگار و بدون نشت |
| Dark mode | متن، status icons، dialog و tab bar contrast مناسب |

## اجرای تست

```bash
git checkout dev
git pull
npm ci
npx expo install --check
npm run verify
npm run export:web
npm run build:android:preview
```

برای iOS با حساب/امضای معتبر: `npm run build:ios:preview`.

## معیار تصمیم برای انتشار نسخه

**نسخه داخلی برای تست:** پس از موفقیت تست‌های static + ساخت و نصب preview + عبور از سناریوهای اصلی قابل ارزیابی است؛ موارد P0 بصری یا پلتفرمی باقی‌مانده باید شفاف ثبت شوند.

**نسخه عمومی:** علاوه بر موارد فوق، splash و icon نهایی، امنیت نشست Web، release audit، تست سه پلتفرم، privacy/store assets و buildهای امضاشده الزامی‌اند.

**محدودیت گزارش:** این بررسی با خواندن فایل‌های مخزن انجام شد. هیچ شبیه‌ساز، دستگاه واقعی، `npm ci`، `npm run verify`، EAS build یا screenshot عملی در این ارزیابی اجرا نشده؛ بنابراین وضعیت هیچ تستی «PASS» اعلام نشده است.
