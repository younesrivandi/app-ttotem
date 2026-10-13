# TTOTEM 0.12.0 — مرحله ۱۲

این ZIP بر مبنای نسخه 0.11.0 ساخته شده و شامل همه مراحل پیشین است.

## اجرا

```powershell
npm install
npx expo install --fix
npm run typecheck
npm run lint -- --max-warnings=0
npm run test:engine
npx expo start --clear
```

**دامنه:** نمایش و تعامل Choice / Sorting / Matching / Path / Content / Video و ثبت تلاش توسط API مرحله قبل. سرور مسئول تشخیص صحت پاسخ است.

**مرزهای شناخته‌شده:** ضبط Voice و پخش/ثبت media واقعی و haptics در مرحله ۱۳ تکمیل می‌شوند. در مرحله ۱۲ محتوا با Linking باز می‌شود و تأیید مشاهده دستی است؛ این به‌عنوان برابری کامل نسخه قدیم محسوب نمی‌شود. نتیجه نهایی و Sheet مرحله ۱۴ است. Sorting فعلاً کنترل جابه‌جایی accessible دارد، نه drag.

به دلیل نبود node_modules نصب‌شده در این محیط، typecheck و اجرای نیتیو این بسته باید روی دستگاه کاربر بررسی شوند.

### اصلاح نهایی v0.12.1
- Sorting Drag: دستگیره ☰ را بگیر و عمودی بکش؛ سپس رها کن. جابه‌جایی بالا/پایین نیز باقی مانده است.
- پخش داخلی ویدیو/صوت به‌ترتیب با `expo-video` و `expo-audio`؛ اتمام فقط با event واقعی player.
- دستور نصب بسته‌های سازگار در صورت نیاز: `npx expo install expo-video expo-audio`.
- آزمون‌های دستی و محدودیت‌های تأیید در `STAGE_12_FINAL_TEST_CHECKLIST.md` آمده است.
