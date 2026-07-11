import { initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'

function readFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

function assertFirebaseConfig() {
  const config = readFirebaseConfig()
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Firebase is not configured. Set VITE_FIREBASE_* env vars: ${missing.join(', ')}`,
    )
  }

  return config
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let emulatorConnected = false

const EMULATOR_HOST = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099'

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseApp = initializeApp(assertFirebaseConfig())
    firebaseAuth = getAuth(firebaseApp)

    if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true' && !emulatorConnected) {
      connectAuthEmulator(firebaseAuth, `http://${EMULATOR_HOST}`, {
        disableWarnings: true,
      })
      emulatorConnected = true
    }
  }

  return firebaseAuth
}
