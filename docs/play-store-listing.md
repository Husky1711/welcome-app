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
Your personal space — sign in, save private notes, and manage your profile.
```

## Full description

```
Welcome App is a lightweight personal space for Android. Sign in once and access your private dashboard on your device.

Features:
• Secure sign-in with a personalized welcome screen
• Private notes — create, edit, and delete notes stored locally on your device
• Profile — update your display name
• Settings — light/dark theme, privacy policy, and data controls
• Clean, modern design built for mobile

All notes and session data stay on your device. No account server required.

Reviewer test account:
Email: admin@example.com
Password: password123
```

## Release notes (v1.2.0)

```
What's new:
• Delete confirmation before removing notes
• Show/hide password toggle on login
• Improved confirmation dialogs for data actions
• Personal dashboard with notes, profile, and settings
```

## Reviewer instructions (Play Console → App content → App access)

```
All functionality is available after sign-in.

Test credentials:
Email: admin@example.com
Password: password123

Flow: Login → Dashboard → try Notes, Profile, or Settings → Logout.
```

## Data safety (Phase 1 — mock auth)

| Question | Answer |
|----------|--------|
| Collect/transmit data off-device? | No |
| Store data on device? | Yes — email for session, notes, and settings |
| Purpose | App functionality |
| Encrypted in transit? | N/A |
| User can delete data? | Yes — Log out |

## Privacy policy URL

```
https://husky1711.github.io/welcome-app/
```

Enable GitHub Pages from the `main` branch `/docs` folder — see `docs/GITHUB_PAGES_SETUP.md`.

## Store listing assets

| Asset | File |
|-------|------|
| App icon (512×512) | `assets/store/app-icon-512.png` |
| Feature graphic (1024×500) | `assets/store/feature-graphic-1024x500.png` |
| Screenshot 1 — Login | `assets/store/01-login-screen.png` |
| Screenshot 2 — Dashboard | `assets/store/02-dashboard.png` |
| Screenshot 3 — Notes | `assets/store/03-notes-screen.png` |
| Screenshot 4 — Profile | `assets/store/04-profile-screen.png` |
| Screenshot 5 — Settings | `assets/store/05-settings-screen.png` |
