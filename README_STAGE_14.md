# مرحله ۱۴ — نتایج و ثبت تلاش TTOTEM 0.14.0

این بسته نسخه 0.13.0 را حفظ می‌کند و مرحله ۱۴ را روی آن می‌سازد.

## تغییرات
- جلوگیری از درخواست‌های موازی Submit با قفل synchronous در صفحه بازی.
- Refresh کش مراحل، سفرها و نتیجه پس از پاسخ موفق سرور.
- `StageResultSheet` مبتنی بر `AppSheet` از مرحله ۰۴، بدون Drawer دست‌نویس.
- مدل Zod با فیلدهای مستند سورس قدیمی: `progress.stars`, `progress.score`, `progress.attemptCount`, `attempts[].isCorrect`.
- نتیجه فقط وقتی مرحله به تأیید داده‌های پیشرفت کامل است نمایش داده می‌شود.
- بازیابی URL نتیجه قدیمی به‌صورت Redirect و نمایش Bottom Sheet روی صفحه مرحله.

## تست
```powershell
npm install
npx expo install --check
npm run typecheck
npm run lint -- --max-warnings=0
npm run test:engine
npx expo start --clear
```

قرارداد پاسخ سرور هنوز باید با یک پاسخ واقعی بررسی شود. از محاسبه امتیاز در کلاینت خودداری شده است.
