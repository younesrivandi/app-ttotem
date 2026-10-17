# Puzzle cross-platform acceptance checklist

The pure Puzzle tests are executed by `npm run test:puzzle` and `npm run verify`.
The test suite covers media normalization, two image layers, missing/broken metadata,
aspect-ratio fitting, coordinate conversion and out-of-board drops.

## Real API contract checks (required before release)
- [ ] Inspect a real `GET /api/v1/child/stages/:stageId/challenges/:challengeId` response for each existing Puzzle shape. Never log access/refresh tokens or signed media URLs to shared logs.
- [ ] Confirm the visible board/guide URLs correspond to the expected target image in the original Next.js challenge.
- [ ] Test image modes: board only; mask/guide only; board + transparent mask; board + opaque guide; relative URLs; CDN URLs; signed URLs; slow/failed images.
- [ ] Confirm the media host permits image GET from web (CORS/credentials as configured); images requiring Authorization cannot necessarily be loaded as ordinary cross-origin HTML images.
- [ ] Confirm the server's canonical `{pieceId,x,y,width,height}` values are normalized board coordinates, not image pixels.
- [ ] Confirm all piece IDs are stable and unique, including string and numeric server identifiers.

## Visual/interaction checks
- [ ] Web (Chromium/Firefox/Safari): viewport 320px, 390px, tablet and desktop; scroll during drag; mouse/trackpad and touch.
- [ ] Android: narrow/large devices; back gesture; drag and tap-then-place; network interruption and image retry.
- [ ] iOS: iPhone/iPad; drag and tap-then-place; Safe Area; portrait/landscape and image retry.
- [ ] Board dimensions: landscape, square, portrait; ensure no image stretching and placed pieces align with the visual guide.
- [ ] Drop outside the board does not call activities; inside sends x and y in [0,1].
- [ ] Wrong placement restores piece and shows feedback; correct placement uses server canonical result; completed puzzle submits exactly once and advances only after server success.
- [ ] Zero pieces, malformed piece IDs, missing URLs and unreachable media show actionable errors, not an unexplained white board.
- [ ] Verify 401 refresh during an activity does not lose puzzle progress or duplicate requests.

## Commands
```sh
npm ci
npm run verify
npm run export:web
npm run android
npm run ios
```

**Automated unit/smoke tests are not a substitute for device testing or replaying real backend payloads.**
