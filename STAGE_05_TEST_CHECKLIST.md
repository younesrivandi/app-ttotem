# مرحله ۰۵ — چک‌لیست تست

## نصب و ساخت
- [ ] `npm install`
- [ ] `npx expo install --fix` و `npx expo install --check`
- [ ] `npm run typecheck` بدون خطا
- [ ] `npm run lint` بدون خطا/هشدار
- [ ] `npm run web` و `npm run android` مانند مرحله ۰۴
- [ ] Navigation Lab و UI Kit بدون regression

## شبکه و احراز هویت (تست یکپارچگی با Mock/Backend در مرحله ۰۶)
- [ ] API base URL از `.env` خوانده شود (بعد از تغییر env، bundler restart)
- [ ] OTP و login درخواست عمومی بدون Bearer هستند
- [ ] درخواست‌های والد با parent token و کودک با child token ارسال می‌شوند
- [ ] 401 تنها یک refresh و یک retry ایجاد کند؛ درخواست‌های هم‌زمان تنها یک refresh برای هر نقش
- [ ] خطای 401 Refresh فقط نشست همان نقش را پاک کند؛ logout والد همه نشست‌ها را پاک می‌کند
- [ ] عدم دسترسی به شبکه هنگام refresh باعث حذف توکن معتبر نشود
- [ ] در Web reload باعث از دست رفتن session حافظه‌ای شود (محدودیت امنیتی فعلی، انتظار صحیح)
- [ ] روی Native token در SecureStore باقی بماند و پس از restart قابل بازیابی باشد
- [ ] خروج از حساب و تغییر کودک query cache وابسته به نشست را پاک/بازاعتبارسنجی کند (اتصال UI در مرحله ۰۶/۰۷)
- [ ] لاگ‌ها هیچ access/refresh token نداشته باشند

**نتیجه:** تا تست API با Mock و نمونه پاسخ واقعی تأیید نشود، مرحله ۰۵ از نظر integration نهایی نیست.
