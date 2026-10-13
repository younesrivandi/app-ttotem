# TTOTEM 0.13.0 — ضبط صوت و Haptics

پایه: نسخه تأییدشده 0.12.1. هیچ فاز بعدی پیاده‌سازی نشده است.

تغییرات: VoiceRecorder با expo-audio، درخواست اجازه، شروع/پایان، پخش، حذف و ضبط دوباره؛ تبدیل ضبط به Data URL/Base64 مطابق قرارداد نسخه Next.js؛ expo-haptics به‌صورت best-effort.

`npm install` سپس `npx expo install --fix` و `npm run typecheck`، `npm run lint -- --max-warnings=0`، `npm run test:engine` و `npx expo start --clear`.

**محدودیت:** این محیط تست Expo و سرور زنده را انجام نداده است. Web و Android و iOS حتماً باید واقعاً آزمایش شوند. روی iOS تنظیمات مجوز میکروفون از plugin در build جدید اعمال می‌شود.
