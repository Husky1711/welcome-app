# Play Store Listing — Welcome App

## App details

| Field | Value |
|-------|-------|
| App name | Welcome App |
| Package ID | `com.rupa.welcomeapp` |
| Category | Tools (or Productivity) |
| Price | Free |

## Short description (80 chars max)

```
Sign in and see your personalized welcome screen. Simple and clean.
```

## Full description

```
Welcome App is a simple, modern Android app that demonstrates a complete sign-in experience.

Features:
• Clean login screen with email and password
• Personalized welcome screen after sign-in
• Secure session — stay logged in until you log out
• Material-inspired design built for mobile

Perfect for learning how web apps become real Android apps on Google Play.

Reviewer test account:
Email: admin@example.com
Password: password123
```

## Release notes (v1.0.0)

```
Initial release:
• Login screen
• Welcome screen with user greeting
• Logout support
```

## Reviewer instructions (Play Console → App content → App access)

```
All functionality is available without special access.

Test credentials:
Email: admin@example.com
Password: password123
```

## Data safety (Phase 1 — mock auth)

| Question | Answer |
|----------|--------|
| Collect/transmit data off-device? | No |
| Store data locally? | Yes — email for session only |
| Purpose | App functionality |
| Encrypted in transit? | N/A |
| User can delete data? | Yes — Log out |

## Screenshots

Use files in `assets/store/`:

1. `01-login-screen.png` — Login screen
2. `02-welcome-screen.png` — Welcome screen after sign-in

## Still needed before upload

- [ ] 512×512 app icon (export from `src/assets/logo.svg`)
- [ ] 1024×500 feature graphic
- [ ] Privacy policy hosted at a public URL (see `docs/privacy-policy.html`)
- [ ] Signed release AAB (`android/app/build/outputs/bundle/release/`)
