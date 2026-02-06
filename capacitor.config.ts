import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.roadmigo',
  appName: 'Roadmigo',
  webDir: 'dist',
  server: {
    url: 'https://ab934334-8e6b-4e47-9395-aeb7fbc72ba4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
