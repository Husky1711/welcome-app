import { initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions'

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
let firebaseFunctions: Functions | null = null
let authEmulatorConnected = false
let functionsEmulatorConnected = false

const EMULATOR_HOST = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099'
const FUNCTIONS_EMULATOR_HOST = import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST ?? '127.0.0.1'
const FUNCTIONS_EMULATOR_PORT = Number(import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT ?? 5001)

function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp(assertFirebaseConfig())
  }
  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseApp())

    if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true' && !authEmulatorConnected) {
      connectAuthEmulator(firebaseAuth, `http://${EMULATOR_HOST}`, {
        disableWarnings: true,
      })
      authEmulatorConnected = true
    }
  }

  return firebaseAuth
}

export function getFirebaseFunctions(): Functions {
  if (!firebaseFunctions) {
    firebaseFunctions = getFunctions(getFirebaseApp())

    if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true' && !functionsEmulatorConnected) {
      connectFunctionsEmulator(
        firebaseFunctions,
        FUNCTIONS_EMULATOR_HOST,
        FUNCTIONS_EMULATOR_PORT,
      )
      functionsEmulatorConnected = true
    }
  }

  return firebaseFunctions
}
