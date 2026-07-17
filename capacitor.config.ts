import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.rupa.welcomeapp',
  appName: 'Welcome App',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#1976D2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1976D2',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_reminder',
      iconColor: '#1b4332',
    },
  },
}

export default config
