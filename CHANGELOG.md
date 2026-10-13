# Changelog

## 0.16.0 — Release foundation
- Added EAS build profiles and environment-based release identifiers.
- Added fail-fast production configuration checks and static route/dependency audit.
- Added GitHub Actions checks and Web export pipeline (requires committed lockfile).
- Added cross-platform release documentation and acceptance checklist.
- No changes to gameplay semantics, backend contracts, or existing features.

# Changelog

## 0.14.0
- Stage 14: attempts concurrency guard, cache invalidation, result model/API, stage result sheet, result route redirect.

# Changelog

## 0.13.0
- Voice recording, preview, retake and microphone permissions using expo-audio.
- Web/native recording conversion into legacy Base64 data URL attempt payload.
- Nonblocking haptic feedback for selection/recording and server-confirmed correct/incorrect attempts.
- Added Stage 13 checklist.

# v0.11.0 — Stage 11

- Pure TypeScript engine for classification, choice, sorting, matching, path, voice/media gating, payload and next-step resolution.
- Added backend adapter and 8 Node regression tests.
- No DOM, scores guessed on client, or Stage 12 renderers.

# Changes

## 0.10.0 — Stage 10
- Journey stage listing, ordering, locking and star summary.
- Stage challenge listing, completion and resume selection, protected navigation.
- Typed Zod schema for stage/challenge API, query keys per child.
- Stage 09 and earlier features preserved.
- Result sheet and game remain later milestones.

## 0.12.0 — Stage 12
- صفحه اجرای بازی به API و موتور مرحله ۱۱ وصل شد.
- Choice، Sorting، Matching، Path و Content/Video renderers اضافه شدند.
- Matching دارای انتخاب دو مرحله‌ای و کشیدن لمسی؛ Path دارای رسم با PanResponder و SVG.
- پرهیز از ثبت ساختگی جواب Voice تا مرحله ۱۳.
- وضعیت‌های loading، error، بازخورد سرور و ادامه چالش اضافه شد.

## 0.12.1 — تکمیل مرحله ۱۲
- Sorting: Drag & Drop با Gesture Handler / Reanimated به‌جای فقط دکمه‌های جابه‌جایی؛ حفظ fallback دسترس‌پذیر.
- Content / Video: پخش درون‌برنامه‌ای با expo-video و expo-audio، ثبت اتمام فقط با پایان واقعی رسانه.
- افزودن STAGE_12_FINAL_TEST_CHECKLIST.md.

## 0.15.0 — Stage 15
- Leaderboard with typed tolerant legacy response parsing and child session isolation.
- Group invitation, child selection and join mutation.
- Pending invitation across OTP login on Web and Native; route parity.
