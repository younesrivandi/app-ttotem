# TTOTEM — ورودی‌های موردنیاز مالک محصول برای Native Polish

نسخه: 2026-10-20 · شاخه هدف: `dev`

این سند ترتیب کار را مشخص می‌کند. **هیچ‌یک از فایل‌های گرافیکی یا APIهای پیشنهادی هنوز نهایی یا تأیید نشده‌اند.**

## 1) آیکون اپ (اولویت اول)

**از مالک محصول می‌خواهیم:**
- فایل اصلی لوگو/هویت بصری، ترجیحاً SVG قابل‌ویرایش یا PNG شفاف باکیفیت.
- تأیید رنگ پس‌زمینه آیکون Android/iOS (پیشنهاد پیش‌فرض: `#F6F8F6`).
- تأیید اینکه لوگوی فعلی `assets/image/logo.png` برند نهایی است یا موقت.
- در صورت وجود، نمونه اپ آیکون رسمی برند.

**خروجی که توسعه آماده می‌کند:** `assets/branding/app-icon.png` مربع 1024×1024، `adaptive-foreground.png` با safe padding، در صورت امکان monochrome icon، و favicon وب. بازبینی crop روی maskهای مختلف الزامی است. فعلاً در `app.json` به لوگوی قدیمی ارجاع داده شده و آماده تأیید بصری نیست.

## 2) Splash Screen

**از مالک محصول می‌خواهیم:**
- لوگوی تأییدشده برای splash، ترجیحاً SVG یا PNG شفاف.
- رنگ پس‌زمینه حالت روشن و تاریک (پیشنهاد روشن `#F6F8F6`، تاریک `#101A18`).
- انتخاب: splash ساده و سریع با لوگوی وسط (پیشنهادی) یا تصویرسازی اختصاصی؛ فایل‌های مربوط را در `assets/branding/` بگذارید.

**خروجی توسعه:** نصب نسخه سازگار `expo-splash-screen` همراه با تغییر `package-lock.json`، افزودن config plugin و asset واقعی، کنترل hide پس از bootstrap و فونت، بررسی cold start در release build. ساخت splash از `ImageBackground` داخل React جایگزین system splash نیست.

## 3) تمام‌صفحه بودن بازی

**تصمیم پیشنهادی برای تأیید:** فقط در مسیر `/play/[stageId]/[challengeId]` نوار **Status** پنهان شود، صفحه ورود/والد/سفرها نوار ساعت و آنتن را نشان دهند. این حالت در این دور به‌صورت route-scoped اعمال شده؛ برگشت از بازی باید نوار را برگرداند.

**از مالک محصول می‌خواهیم:** آیا لازم است نوار پایین Android (gesture navigation / دکمه‌های سه‌گانه) نیز حین بازی پنهان شود؟ توصیه پیش‌فرض: **خیر**؛ edge-to-edge با safe area مناسب و status bar پنهان کفایت می‌کند. اگر immersive کامل لازم است، باید سناریو خروج از بازی، سه‌دکمه‌ای و سیاست Android 15/16 جدا تست شود.

**خروجی توسعه باقیمانده:** آزمون touch hit-area، back، sheet، orientation و cutout روی گوشی. هیچ پنهان‌سازی سراسری برای فرم والد نباید برگردد.

## 4) کیبورد نیتیو

**از مالک محصول ورودی لازم نیست.** در کد login و AppScreen، keyboard avoidance/scroll dismissal فعال شده و `AppSheet` حالت interactive keyboard و Android adjustResize دارد.

**باقیمانده توسعه:** تست OTP، Add Child، sheet، اندازه‌های کوچک، IME Android، iOS و keyboard attached/detached؛ در صورت لزوم اصلاح screen-specific بدون gesture سفارشی.

## 5) امنیت نشست Web (وابسته به backend)

**اطلاعات موردنیاز از تیم Backend:**
- آیا API می‌تواند روی وب نشست با **Secure + HttpOnly + SameSite cookie** و refresh rotation/revoke ارائه کند؟ پاسخ روشن و مستند.
- دامنه دقیق وب production و API و اینکه same-site یا cross-site هستند (برای انتخاب SameSite، CORS و CSRF).
- قرارداد endpointهای `/api/v1/auth/login`، `/api/v1/auth/refresh`، logout/revoke و `/api/v1/children/:id/select` (روش، request/response نمونه *بدون توکن واقعی*، role semantics).
- آیا backend/BFF امکان تفکیک نشست والد و کودک را دارد؟ نحوه logout مستقل و invalidation.
- محدودیت‌های CSRF، cookie Path/Domain، credentialed fetch و سیاست عمر نشست.

**خروجی توسعه پس از دریافت:** adapter وب بدون JS-readable refresh token، fetch با credentials و CSRF در صورت نیاز، refresh single-flight نقش‌ها، بازنگری logout/switch child و contract/integration tests؛ پس از آن `npm run release:check` باید بدون حذف قفل امنیتی پاس شود.

**وضعیت فعلی:** refresh token وب در localStorage ذخیره می‌شود؛ این نقص هنوز رفع نشده و انتشار عمومی Web مسدود است. حذف ناگهانی refresh بدون قرارداد backend ممکن است login/resume را بشکند و رفع امنیت کامل نیست.

## فایل‌هایی که مالک محصول در پروژه بگذارد

```text
assets/branding/
  source-logo.svg             # یا فایل طراحی اصلی
  app-icon-reference.png      # اختیاری
  splash-artwork.png          # فقط اگر تصویر اختصاصی مدنظر است
docs/backend/
  web-session-contract.md     # توضیح backend بدون هیچ secret/token واقعی
```

**احتیاط:** فایل‌های logo عمومی قابل commit هستند، اما رمزها، نمونه token واقعی، کلید امضا و اطلاعات ورود را در Git ثبت نکنید.

## وضعیت کار

- [x] گزارش نیازمندی مالک محصول
- [x] نمایش status bar در صفحات معمولی
- [x] status bar مخفی فقط در route بازی برای Native
- [x] KeyboardAvoidingView روی login و AppScreen + تنظیم keyboard در Sheet
- [ ] دریافت/بررسی آیکون نهایی
- [ ] ساخت و نصب splash واقعی همراه lockfile
- [ ] آزمون layout روی دستگاه
- [ ] دریافت قرارداد نشست وب از backend
- [ ] رفع امنیت web refresh و تست end-to-end
- [ ] موفقیت `npm run verify`، Expo export و بیلد آزمایشی native

**توجه:** تغییرات UI هنوز با npm، Expo یا دستگاه واقعی در این نوبت تست نشده‌اند. تکمیل پنج مورد فقط با تست عملی و رفع موانع مشخص‌شده قابل اعلام است.
