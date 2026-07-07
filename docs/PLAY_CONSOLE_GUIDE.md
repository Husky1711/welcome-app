# Play Console Upload Guide

Complete these steps at [Google Play Console](https://play.google.com/console).

## App identity

| Field | Value |
|-------|-------|
| App name | Welcome App |
| Package name | `com.rupa.welcomeapp` |
| Category | Tools |
| Free or paid | Free |

## Privacy policy URL

```
https://husky1711.github.io/welcome-app/
```

Enable GitHub Pages first — see `docs/GITHUB_PAGES_SETUP.md`.

## Store listing assets

| Asset | File |
|-------|------|
| App icon (512×512) | `assets/store/app-icon-512.png` |
| Feature graphic (1024×500) | `assets/store/feature-graphic-1024x500.png` |
| Screenshot 1 | `assets/store/01-login-screen.png` |
| Screenshot 2 | `assets/store/02-welcome-screen.png` |

Copy text from `docs/play-store-listing.md`.

## App access (for reviewers)

```
Email: admin@example.com
Password: password123
```

## Data safety (Phase 1)

- **Data collected and transmitted?** No
- **Data stored on device?** Yes — email for session (app functionality)
- **Encrypted in transit?** N/A
- **User can request deletion?** Yes — logout or uninstall

## Upload AAB

File to upload:

```
android/app/build/outputs/bundle/release/app-release.aab
```

Rebuild if needed:

```bash
npm run bundle:release
```

## Release track

### New personal developer account

1. **Testing → Closed testing** → Create release
2. Upload `app-release.aab`
3. Add **12 testers** (Gmail accounts)
4. Wait **14 consecutive days**
5. **Dashboard** → Apply for production access
6. After approval → **Production** → Create release → Publish

### Already have production access

1. **Production** → Create new release
2. Upload `app-release.aab`
3. Submit for review

## After submission

- Review: typically **1–3 days** (up to ~7 days)
- When status is **Published**, search Play Store for "Welcome App"

## Developer contact

- Email: ponnapuvvulasaiprasad@gmail.com
- GitHub: https://github.com/Husky1711/welcome-app
