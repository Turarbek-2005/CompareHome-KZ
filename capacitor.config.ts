import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kz.comparehome.app',
  appName: 'CompareHome KZ',
  webDir: 'dist',
  backgroundColor: '#F1F3F0',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#F1F3F0',
    },
  },
};

export default config;
