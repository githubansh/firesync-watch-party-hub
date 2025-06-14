
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.980d16274461456db2a4355c6816f6b5',
  appName: 'firesync-watch-party-hub',
  webDir: 'dist',
  server: {
    url: 'https://980d1627-4461-456d-b2a4-355c6816f6b5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
