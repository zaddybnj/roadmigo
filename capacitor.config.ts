import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ab9343348e6b4e479395aeb7fbc72ba4',
  appName: 'RV Nomad',
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
