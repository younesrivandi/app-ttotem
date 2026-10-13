# Stage 07 — Test and acceptance checklist

## Tooling
- [ ] `npm install` completes
- [ ] `npm run typecheck` returns zero errors
- [ ] `npm run lint -- --max-warnings=0` returns zero errors/warnings
- [ ] Web and Android render without runtime errors; check iOS when available

## Auth and list
- [ ] `/children` without parent authentication asks for login, never sends unauthenticated data request
- [ ] Parent OTP login then `/children` returns live list
- [ ] Loading, empty list, offline/API failure and Retry work
- [ ] Child name, age when supplied, score, selection marker render correctly

## Create
- [ ] Add sheet opens and closes by swipe, backdrop and Cancel; test Web/Android
- [ ] First name required; national code optional or 10 digits; Persian/Arabic numbers normalized
- [ ] Year/month/day options work; Esfand leap year and invalid-day clamp work
- [ ] Birth date transmitted as ISO Gregorian, not Jalali
- [ ] POST payload has exactly `firstName`, `lastName`, `birthDate`, `nationalCode`
- [ ] Creating a child refreshes list and selects child
- [ ] API validation/server errors remain visible and do not erase form fields
- [ ] Avatar/gender visual choices work; note they are not persisted by existing backend

## Select
- [ ] Confirm selection of one child, child role token set separately from parent role
- [ ] Enter navigates to `/coming-soon`, same as original app
- [ ] Failed selection displays error and does not navigate
- [ ] Switching child clears previous child-specific cached server state

## Regression
- [ ] OTP Stage 06 works
- [ ] Navigation/Bottom Sheet Stage 04 works
- [ ] Theme/RTL/UI Kit work

## Not verified in this environment
- Live backend schema and credential/session correctness
- iOS signed build, Android production build and three-platform end-to-end smoke

**Gate:** Stage 08 must not begin until Stage 07 is accepted.
