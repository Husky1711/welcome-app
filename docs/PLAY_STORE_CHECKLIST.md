# Play Store Submission Checklist

Follow these steps in order. Check each box as you complete it.

## Phase A — Assets (today)

- [x] **Screenshots** — `assets/store/01-login-screen.png`, `02-welcome-screen.png`
- [x] **App icon** — `assets/store/app-icon-512.png`
- [x] **Feature graphic** — `assets/store/feature-graphic-1024x500.png`
- [ ] **Privacy policy URL live** — Enable GitHub Pages (see `docs/GITHUB_PAGES_SETUP.md`)

## Phase B — Signed release build

- [ ] Keystore generated (`android/welcome-app-upload.jks` — local only, never commit)
- [ ] `android/keystore.properties` configured (from `keystore.properties.example`)
- [ ] Run: `npm run build:android` then `cd android && .\gradlew.bat bundleRelease`
- [ ] Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Phase C — Play Console

- [ ] Create app at [Google Play Console](https://play.google.com/console)
- [ ] Package name: `com.rupa.welcomeapp`
- [ ] Complete store listing (copy from `docs/play-store-listing.md`)
- [ ] Content rating questionnaire
- [ ] Data safety form (local email storage only)
- [ ] App access → provide test credentials

## Phase D — Release track

### New personal developer account?

- [ ] Upload AAB to **Closed testing** first
- [ ] Add **12 testers** with Gmail accounts
- [ ] Wait **14 consecutive days**
- [ ] Apply for **Production access**
- [ ] After approval → upload to **Production**

### Already have production access?

- [ ] Upload AAB directly to **Production**
- [ ] Submit for review (typically 1–3 days)

## Phase E — Go live

- [ ] Status shows **Published** in Production
- [ ] Search Play Store on a real phone
- [ ] Share link with friends

## Timeline reminder

| Account type | Time to public download |
|--------------|-------------------------|
| New personal | ~3–5 weeks |
| Has production access | ~3–7 days |
